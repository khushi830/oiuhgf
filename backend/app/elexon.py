# backend/app/elexon.py
"""Elexon BMRS client + static CSV cache. All network/disk I/O lives in this file only,
so the analytics code in processing.py stays pure and easy to test."""
import logging
from datetime import date, timedelta
from typing import Callable, Iterator

import pandas as pd
import requests

from .config import BASE_URL, DATA_DIR

log = logging.getLogger(__name__)
TIMEOUT_S = 60


def _windows(start: date, end: date, days: int) -> Iterator[tuple[date, date]]:
    """Split [start, end] into windows of `days` days (stream endpoints limit range size)."""
    cur = start
    while cur <= end:
        yield cur, min(cur + timedelta(days=days - 1), end)
        cur += timedelta(days=days)


def _get_rows(path: str, params: dict) -> list[dict]:
    """GET a stream endpoint and always return a list of records.

    Handles both response shapes defensively: a bare JSON array (stream default)
    or an object wrapping the records under "data" (paginated style).
    """
    resp = requests.get(f"{BASE_URL}{path}", params=params, timeout=TIMEOUT_S)
    resp.raise_for_status()
    body = resp.json()
    return body["data"] if isinstance(body, dict) else body


def fetch_actuals(first_day: date, last_day: date) -> pd.DataFrame:
    """Half-hourly national WIND outturn from FUELHH.  Columns: startTime, actual (MW)."""
    rows: list[dict] = []
    for a, b in _windows(first_day, last_day, days=7):
        rows += _get_rows("/datasets/FUELHH/stream", {
            "settlementDateFrom": a.isoformat(),
            "settlementDateTo": b.isoformat(),
            "fuelType": "WIND",
        })
    df = pd.DataFrame(rows)
    if df.empty:
        raise RuntimeError("Elexon FUELHH returned no rows")
    df = df[df["fuelType"] == "WIND"]  # belt and braces: enforce the filter client-side too
    df["startTime"] = pd.to_datetime(df["startTime"], utc=True)
    return (df.rename(columns={"generation": "actual"})[["startTime", "actual"]]
              .drop_duplicates("startTime")
              .sort_values("startTime")
              .reset_index(drop=True))


def fetch_forecasts(first_pub_day: date, last_pub_day: date) -> pd.DataFrame:
    """Every WINDFOR forecast *vintage* published in the window.
    Columns: startTime (target), publishTime (when created), forecast (MW)."""
    rows: list[dict] = []
    for a, b in _windows(first_pub_day, last_pub_day, days=3):
        rows += _get_rows("/datasets/WINDFOR/stream", {
            "publishDateTimeFrom": f"{a.isoformat()}T00:00:00Z",
            "publishDateTimeTo": f"{(b + timedelta(days=1)).isoformat()}T00:00:00Z",
        })
    df = pd.DataFrame(rows)
    if df.empty:
        raise RuntimeError("Elexon WINDFOR returned no rows")
    df["startTime"] = pd.to_datetime(df["startTime"], utc=True)
    df["publishTime"] = pd.to_datetime(df["publishTime"], utc=True)
    return (df.rename(columns={"generation": "forecast"})
              [["startTime", "publishTime", "forecast"]]
              .drop_duplicates(["startTime", "publishTime"])
              .reset_index(drop=True))


def load_or_fetch(name: str, fetcher: Callable[..., pd.DataFrame], *args) -> pd.DataFrame:
    """Static CSV cache. First start: call Elexon and save a CSV.
    Later starts: read the CSV (fast, works offline, and January data never changes)."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / f"{name}.csv"
    if path.exists():
        log.info("Cache hit: %s", path)
        df = pd.read_csv(path)
        for col in ("startTime", "publishTime"):
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], utc=True)
        return df
    log.info("Cache miss: fetching '%s' from Elexon", name)
    df = fetcher(*args)
    df.to_csv(path, index=False)
    return df
# backend/app/main.py
"""FastAPI entrypoint: the thin REST layer. No analytics logic lives here.

Data (~1.5k rows) is loaded once at startup and held in memory, so every request is
a cheap in-memory slice. Run a single worker process for this reason."""
import logging
from contextlib import asynccontextmanager
from datetime import date, timedelta

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import config, elexon, processing

logging.basicConfig(level=logging.INFO)
STATE: dict = {}  # populated at startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    first = date.fromisoformat(config.DECISION_START)
    last = date.fromisoformat(config.DECISION_END)
    one_day = timedelta(days=1)

    # Actuals for delivery days (decision day + 1): 2 Jan .. 1 Feb.
    actuals = elexon.load_or_fetch("actuals", elexon.fetch_actuals, first + one_day, last + one_day)
    # Forecasts *published* during January = everything knowable at decision time.
    forecasts = elexon.load_or_fetch("forecasts", elexon.fetch_forecasts, first, last)

    day_ahead = processing.select_day_ahead(forecasts)  # uses DECISION_CUTOFF_HOUR_UTC
    STATE.update(actuals=actuals, forecasts=forecasts,
                 merged=processing.merge(actuals, day_ahead))
    yield


app = FastAPI(title="Wind Forecast Monitor", lifespan=lifespan)

# CORS lets the Vercel-hosted frontend call this API from another origin.
app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS,
                   allow_methods=["GET"], allow_headers=["*"])


def _slice(start: str | None, end: str | None) -> pd.DataFrame:
    """Filter merged data to delivery days [start, end] (both inclusive, UTC)."""
    df = STATE["merged"]
    if start:
        df = df[df["startTime"] >= pd.Timestamp(start, tz="UTC")]
    if end:
        df = df[df["startTime"] < pd.Timestamp(end, tz="UTC") + pd.Timedelta(days=1)]
    return df


@app.get("/api/health")
def health():
    """Liveness probe for AWS (App Runner / ECS / ALB target group)."""
    return {"status": "ok", "rows": len(STATE.get("merged", []))}


@app.get("/api/series")
def series(start: str | None = Query(None, description="YYYY-MM-DD"),
           end: str | None = Query(None, description="YYYY-MM-DD")):
    """Half-hourly actual vs the forecast available at the D-1 cutoff."""
    df = _slice(start, end)
    return {
        "cutoff_hour_utc": config.DECISION_CUTOFF_HOUR_UTC,
        "data": [{"t": r.startTime.isoformat(), "actual": r.actual, "forecast": r.forecast,
                  "publishTime": r.publishTime.isoformat(), "error": r.error}
                 for r in df.itertuples()],
    }


@app.get("/api/metrics")
def metrics(start: str | None = None, end: str | None = None):
    """Accuracy summary plus error-by-hour for the chosen range."""
    df = _slice(start, end)
    if df.empty:
        raise HTTPException(status_code=404, detail="No data in the requested range")
    return {"summary": processing.compute_metrics(df), "by_hour": processing.by_hour(df)}


@app.get("/api/horizon")
def horizon():
    """Error vs forecast lead time, across all January vintages."""
    return processing.horizon_analysis(STATE["actuals"], STATE["forecasts"])
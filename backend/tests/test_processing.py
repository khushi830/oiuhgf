# backend/tests/test_processing.py
"""Unit tests for the logic that matters most: no look-ahead bias, correct metrics."""
import pandas as pd
from app import processing as p


def ts(s):
    return pd.Timestamp(s, tz="UTC")


def test_select_day_ahead_ignores_late_vintages():
    fc = pd.DataFrame({
        "startTime": [ts("2026-01-10 12:00")] * 3,
        "publishTime": [ts("2026-01-08 09:00"),   # eligible (older)
                        ts("2026-01-09 08:30"),   # eligible (latest <= 09:00 D-1)
                        ts("2026-01-09 10:00")],  # after cutoff -> must be excluded
        "forecast": [100.0, 200.0, 999.0],
    })
    out = p.select_day_ahead(fc, cutoff_hour=9)
    assert len(out) == 1 and out.iloc[0]["forecast"] == 200.0


def test_metrics():
    df = pd.DataFrame({"actual": [100.0, 200.0], "forecast": [110.0, 180.0]})
    df["error"] = df["forecast"] - df["actual"]
    m = p.compute_metrics(df)
    assert m["mae"] == 15.0 and m["bias"] == -5.0
    assert round(m["rmse"], 3) == round(((100 + 400) / 2) ** 0.5, 3)
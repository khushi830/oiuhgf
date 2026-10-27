# backend/app/processing.py
"""Pure analytics (no network, no disk): choose the forecast the buyer could actually see,
join it to actuals, and score it. Pure functions keep this trivially unit-testable."""
import numpy as np
import pandas as pd

from .config import DECISION_CUTOFF_HOUR_UTC


def select_day_ahead(forecasts: pd.DataFrame,
                     cutoff_hour: int = DECISION_CUTOFF_HOUR_UTC) -> pd.DataFrame:
    """For each half-hour, keep the LATEST forecast published at/before the cutoff on D-1.

    This mirrors the real decision: at 09:00 on D-1 the buyer only sees forecasts
    published so far. Using later forecasts would be look-ahead bias and would
    make the forecast look better than it was for purchasing purposes.
    """
    fc = forecasts
    delivery_day = fc["startTime"].dt.normalize()
    cutoff = delivery_day - pd.Timedelta(days=1) + pd.Timedelta(hours=cutoff_hour)
    eligible = fc[fc["publishTime"] <= cutoff]
    return (eligible.sort_values("publishTime")
                    .groupby("startTime", as_index=False)
                    .last())  # last row per startTime == most recent eligible publishTime


def merge(actuals: pd.DataFrame, day_ahead: pd.DataFrame) -> pd.DataFrame:
    """Inner-join on startTime (only scored where both exist). error = forecast - actual,
    so a positive error means the forecast over-estimated wind."""
    df = actuals.merge(day_ahead, on="startTime", how="inner").sort_values("startTime")
    df["error"] = df["forecast"] - df["actual"]
    return df.reset_index(drop=True)


def compute_metrics(df: pd.DataFrame) -> dict:
    """Headline accuracy metrics. MW unless marked %."""
    if df.empty:
        return {}
    err, act = df["error"], df["actual"]
    nonzero = act > 0  # percentage errors are undefined when actual output is 0
    return {
        "n": int(len(df)),
        "mae": float(err.abs().mean()),                          # typical miss
        "rmse": float(np.sqrt((err ** 2).mean())),               # penalises big misses
        "bias": float(err.mean()),                               # >0 = over-forecast
        "mape": float((err[nonzero].abs() / act[nonzero]).mean() * 100),
        "nmae": float(err.abs().mean() / act.mean() * 100),      # scale-free, % of mean output
        "p95_abs_error": float(err.abs().quantile(0.95)),        # 1-in-20 miss: sizing buffer
    }


def by_hour(df: pd.DataFrame) -> list[dict]:
    """Error profile by hour of day (UTC): are some delivery hours riskier than others?"""
    grouped = df.assign(hour=df["startTime"].dt.hour).groupby("hour")["error"]
    return [{"hour": int(h), "mae": float(s.abs().mean()), "bias": float(s.mean())}
            for h, s in grouped]


def horizon_analysis(actuals: pd.DataFrame, all_forecasts: pd.DataFrame) -> list[dict]:
    """MAE by forecast lead time (startTime - publishTime) in 6-hour buckets, across ALL
    vintages. Shows how forecast quality degrades the further ahead it is made."""
    df = all_forecasts.merge(actuals, on="startTime", how="inner")
    df["horizon_h"] = (df["startTime"] - df["publishTime"]).dt.total_seconds() / 3600
    df = df[df["horizon_h"] >= 0].copy()
    df["bucket"] = (df["horizon_h"] // 6 * 6).astype(int)
    df["abs_err"] = (df["forecast"] - df["actual"]).abs()
    agg = df.groupby("bucket")["abs_err"].agg(["mean", "count"]).reset_index()
    return [{"horizon_from_h": int(r["bucket"]), "horizon_to_h": int(r["bucket"]) + 6,
             "mae": float(r["mean"]), "n": int(r["count"])} for _, r in agg.iterrows()]
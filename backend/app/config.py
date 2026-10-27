# backend/app/config.py
"""Central configuration: every tunable value lives here, never inside business logic."""
import os
from pathlib import Path

# --------------------------------------------------------------------------------------
# KEY BUSINESS ASSUMPTION (highlight this in the review)
# --------------------------------------------------------------------------------------
# The buyer places the day-ahead trade at 09:00 UTC on the day BEFORE delivery (D-1).
# Only forecasts published at or before that instant are allowed to be scored.
# (UK local time == UTC in January, so no timezone conversion is needed.)
DECISION_CUTOFF_HOUR_UTC = 9

# Scope: purchase DECISIONS made in January 2026. Delivery day = decision day + 1,
# so delivery runs 2026-01-02 .. 2026-02-01.
DECISION_START = "2026-01-01"
DECISION_END = "2026-01-31"

# Elexon BMRS API
BASE_URL = os.getenv("ELEXON_BASE_URL", "https://data.elexon.co.uk/bmrs/api/v1")

# Static CSV cache: January 2026 is a closed period, so we fetch once and reuse it.
DATA_DIR = Path(os.getenv("DATA_DIR", "/srv/data"))

# Comma-separated list of allowed browser origins, e.g. "https://my-app.vercel.app".
# Defaults to "*" for easy local development; restrict it in production.
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")]
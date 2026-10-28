# Wind Forecast Monitor

A web application that helps a day-ahead electricity purchasing team to:

1. **See** the wind generation forecast that was available when the day-ahead decision was made.
2. **Quantify** how accurate that forecast was, so the error can be factored into buying decisions.

Scope: purchase decisions made in **January 2026** (delivery days 2 Jan to 1 Feb 2026).
Data: national-level wind actuals (Elexon BMRS `FUELHH`, filtered to `WIND`) and wind forecasts
(Elexon BMRS `WINDFOR`).

## Live deployments

| Component | URL |
|-----------|-----|
| Frontend (Vercel) | `https://oiuhgh.vercel.app/` |
| Backend API | `https://qatar-backend.atttrack.online` (docs at `/docs`, health at `/api/health`) |

## Use of AI tools

**Claude (by Anthropic) was used to assist in building this application**, including the
architecture, backend and frontend code, Docker configuration and this documentation.
All AI-generated output was reviewed, run and understood by the author before submission.

## Key design decision: which forecast is "the" forecast?

`WINDFOR` contains many forecasts for the same half-hour, published at different times.
The buyer trades day-ahead, so for each delivery half-hour we use the **latest forecast published
at or before 09:00 UTC on the previous day**. This is the constant `DECISION_CUTOFF_HOUR_UTC`
in `backend/app/config.py`. Using later forecasts would give look-ahead bias and overstate accuracy.
UK local time equals UTC in January, so no timezone conversion is needed.

## Metrics

`error = forecast - actual` (positive = over-forecast). Reported: MAE, RMSE, bias, MAPE, nMAE
(MAE as % of mean actual), 95th percentile absolute error, plus MAE by hour of day and by
forecast lead time.

## Files and directories

```
.
├── README.md
├── docker-compose.yml          Runs backend + frontend together locally
├── backend/
│   ├── Dockerfile              Container for AWS (App Runner / ECS / EC2)
│   ├── requirements.txt
│   ├── app/
│   │   ├── config.py           All settings, incl. DECISION_CUTOFF_HOUR_UTC
│   │   ├── elexon.py           Elexon API client + static CSV cache (I/O only)
│   │   ├── processing.py       Pure pandas logic: forecast selection, merge, metrics
│   │   └── main.py             FastAPI app and REST endpoints
│   └── tests/
│       └── test_processing.py  Unit tests (no look-ahead bias, metric maths)
└── frontend/
    ├── Dockerfile              Multi-stage build, served by nginx
    ├── nginx.conf              Proxies /api to the backend (docker-compose only)
    ├── package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html
    ├── .env.example            VITE_API_URL (backend location)
    └── src/
        ├── main.jsx, App.jsx, index.css   Entry point, dashboard page, Tailwind styles
        ├── api.js              Only file that knows the backend URL (VITE_API_URL)
        ├── hooks/useDashboardData.js   All data fetching
        ├── components/         KpiCard, Card, DateRangeFilter, ForecastChart,
        │                       HourlyErrorChart, HorizonChart
        └── lib/                constants.js, format.js
```

## API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/series?start=YYYY-MM-DD&end=YYYY-MM-DD` | Half-hourly actual vs day-ahead forecast |
| `GET /api/metrics?start=&end=` | Accuracy summary and error by hour |
| `GET /api/horizon` | Error by forecast lead time |
| `GET /api/health` | Health check |

## Running with Docker

Prerequisite: Docker with Compose.

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

On first start the backend downloads January 2026 data from Elexon (needs internet) and saves it as
CSV in a Docker volume; later starts reuse the cache. To refetch, run `docker compose down -v`.

Backend only:

```bash
cd backend
docker build -t wind-backend .
docker run -p 8000:8000 wind-backend
```

## Running without Docker

```bash
cd backend && pip install -r requirements.txt && DATA_DIR=./data uvicorn app.main:app --reload
cd frontend && cp .env.example .env.development && npm install && npm run dev   # http://localhost:5173
cd backend && DATA_DIR=./data pytest           # tests
```

## Deployment

**Backend**: run the `backend` image on a container platform. Port 8000 (or `$PORT`), health check
path `/api/health`. Set the environment variable `CORS_ORIGINS` to
`https://oiuhgh.vercel.app`.

**Frontend on Vercel**: import the repository, set the root directory to `frontend`, and set the
environment variable `VITE_API_URL` to `https://qatar-backend.atttrack.online` (it is baked in at
build time, so redeploy after changing it).
# backend/Dockerfile
# Runs unchanged on AWS App Runner, ECS/Fargate or plain EC2 + Docker.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DATA_DIR=/srv/data

WORKDIR /srv

# Install dependencies first so Docker caches this layer until requirements change.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Run as a non-root user; give it a writable cache directory.
RUN useradd --create-home appuser && mkdir -p /srv/data && chown -R appuser /srv
USER appuser

EXPOSE 8000

# Container-level health check (also usable by ECS). Uses stdlib only, no curl needed.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import os,urllib.request as u; u.urlopen(f'http://127.0.0.1:{os.environ[\"PORT\"]}/api/health')" || exit 1

# 0.0.0.0 so the platform can reach the container. $PORT is honoured (App Runner/ECS can
# override it). --proxy-headers trusts X-Forwarded-* set by the AWS load balancer.
# One worker only: dataset is held in memory.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips='*'"]
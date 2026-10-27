# frontend/Dockerfile
# ---------- Stage 1: build the static site ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first so Docker caches this layer until package.json changes.
COPY package.json ./
RUN npm install

COPY . .

# Vite inlines VITE_API_URL at build time.
#   empty (default)  -> same origin; nginx proxies /api to the "backend" service (docker-compose)
#   https://<aws>    -> call the AWS backend directly:
#       docker build --build-arg VITE_API_URL=https://<aws-url> -t wind-frontend .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Stage 2: serve with nginx ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
# Frontend React + Vite — built from the repository root (ES-Builder default
# config: context ".", dockerfile "frontend/Dockerfile"). The actual source
# lives in apps/frontend; this file only references it.
# The server passes --build-arg VITE_BASE_PATH=/projeto-x/, forwarded to Vite
# via --base, which sets import.meta.env.BASE_URL at build time.
FROM node:20-alpine AS builder

WORKDIR /app

# No per-app lockfile in this monorepo — use `npm install`, not `npm ci`.
COPY apps/frontend/package*.json ./
RUN npm install

COPY apps/frontend/ ./

# OBRIGATÓRIO: declarar o ARG, senão o --build-arg é ignorado pelo Docker.
ARG VITE_BASE_PATH=/

# --base tem precedência sobre vite.config.ts; o build do projeto é `tsc -b && vite build`.
RUN npx tsc -b && npx vite build --base="${VITE_BASE_PATH}"

# ── Estágio de produção ───────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Backend NestJS + Prisma — built from the repository root (ES-Builder default
# config: context ".", dockerfile "backend/Dockerfile"). The actual source
# lives in apps/backend; this file only references it, so no server-side config
# change is needed. The ES-Builder server injects DATABASE_URL, JWT_SECRET and PORT.
FROM node:20-alpine

WORKDIR /app

# Prisma needs openssl available in the image.
RUN apk add --no-cache openssl

# No per-app lockfile in this monorepo — use `npm install`, not `npm ci`.
COPY apps/backend/package*.json ./
RUN npm install

COPY apps/backend/ ./

# The generated Prisma client (src/common/prisma/generated) is gitignored,
# so it must be generated inside the image before compiling.
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

# Run pending migrations (with retry while the db container warms up) then start.
CMD ["sh", "./docker-entrypoint.sh"]

# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
# Only needed so `prisma generate` (run via postinstall) has a value to read —
# no DB connection happens at build time.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend ./backend
COPY frontend/package.json ./frontend/package.json
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @catholicae/backend run build
RUN pnpm --filter @catholicae/backend deploy --prod --legacy /prod/backend

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /prod/backend ./
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]

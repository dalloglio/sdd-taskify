# Deployment Guide

This guide covers the production shape for Taskify's MVP. The current `docker-compose.yml` provides local PostgreSQL only; application Dockerfiles are planned separately.

## Services

- Backend: Node.js 20 Express API with Socket.IO.
- Frontend: Vite-built static React app.
- Database: PostgreSQL 16 locally through Docker Compose; managed PostgreSQL is recommended for production.

## Backend Environment

Required:

- `DATABASE_URL`: PostgreSQL connection string.
- `NODE_ENV=production`
- `PORT`: HTTP port exposed by the runtime.
- `CORS_ORIGIN`: frontend origin allowed to call the API.

Production rules:

- Do not use wildcard CORS in production.
- Store secrets in the deployment platform's secret manager.
- Run Prisma migrations before starting the new backend version.
- Do not reuse the local Compose password in production.

## Local Compose Database

The local Compose stack starts only PostgreSQL:

```sh
docker compose up -d postgres
```

Local connection string:

```sh
postgresql://postgres:password@localhost:5432/taskify?schema=public
```

The persisted Docker volume is `postgres_data`. Removing it with `docker compose down -v` deletes local database data.

## Frontend Environment

Required at build time:

- `VITE_API_BASE_URL`: production API URL ending in `/api/v1`.
- `VITE_WEBSOCKET_URL`: production backend URL for Socket.IO.

Build:

```sh
cd frontend
npm ci
npm run build
```

Deploy the generated `frontend/dist` directory to the static host or CDN.

## Backend Build

```sh
cd backend
npm ci
npx prisma generate
npm run build
```

Start:

```sh
npm start
```

## Database Release Steps

1. Back up the production database.
2. Apply migrations with Prisma.
3. Verify `GET /health`.
4. Run a smoke test against users, projects, tasks, and comments.

## Production Checklist

- `CORS_ORIGIN` is restricted to the frontend domain.
- The database is reachable from the backend runtime.
- Prisma client was generated during the build.
- Static frontend variables point to production backend URLs.
- Socket.IO traffic is allowed through the proxy/load balancer.
- Health checks target `/health`.
- Logs are collected from backend stdout/stderr.
- Sample data seeding is intentional for the target environment.

## Rollback

If deployment fails:

1. Revert the backend and frontend artifacts to the previous known-good version.
2. Restore the database backup if a migration introduced incompatible data changes.
3. Confirm `/health` and a browser smoke test before reopening traffic.

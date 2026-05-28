# Troubleshooting

## Backend Will Not Start

Check `DATABASE_URL` first. The backend connects to the database before listening, so an unreachable database prevents startup.

Useful checks:

```sh
docker compose ps
cd backend
npx prisma generate
npx prisma migrate status
```

For local development, `DATABASE_URL` should be:

```sh
postgresql://postgres:password@localhost:5432/taskify?schema=public
```

If PostgreSQL is stopped:

```sh
docker compose up -d postgres
```

If you are running the full Compose stack, inspect the backend service logs:

```sh
docker compose logs -f backend
```

## Prisma Seed Fails

Confirm the target database exists and migrations have run.

```sh
docker compose up -d postgres
cd backend
npx prisma migrate dev
npx prisma db seed
```

In the full Compose stack, run the seed inside the backend container:

```sh
docker compose exec backend npx prisma db seed
```

If duplicate sample data appears, inspect `backend/prisma/seed.ts` before clearing records.

## Frontend Cannot Reach API

Confirm `frontend/.env` contains:

```sh
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WEBSOCKET_URL=http://localhost:3000
```

Restart Vite after changing environment files.

If the frontend is running in Compose, rebuild so build-time Vite variables are applied:

```sh
docker compose up --build frontend
```

## CORS Errors

Set backend `CORS_ORIGIN` to the exact frontend origin, for example:

```sh
CORS_ORIGIN=http://localhost:5173
```

In production, avoid `*` and use the deployed frontend origin.

## Docker Compose PostgreSQL Is Unhealthy

Check the container logs:

```sh
docker compose logs postgres
```

If the local volume contains broken or incompatible data and you do not need to keep it:

```sh
docker compose down -v
docker compose up -d postgres
```

This deletes the local `postgres_data` volume. Run migrations and seed again after recreating it.

## Docker Compose Backend Is Unhealthy

Check whether migrations completed and the backend health endpoint responds:

```sh
docker compose logs backend
curl http://localhost:3000/health
```

The backend service runs `npx prisma migrate deploy && npm run dev` in Compose. If migrations fail, fix the database state first, then restart the backend:

```sh
docker compose restart backend
```

## Docker Compose Frontend Is Unhealthy

The frontend health check expects the Vite dev server on port 5173.

```sh
docker compose logs frontend
curl http://localhost:5173/
```

If environment values changed, rebuild the frontend image:

```sh
docker compose up --build frontend
```

## Tasks Do Not Move Between Columns

Verify the update request sends one of:

- `to_do`
- `in_progress`
- `in_review`
- `done`

Then confirm the assignee, if present, is a member of the project.

## Comments Cannot Be Edited or Deleted

Comment edits and deletes require current-user context. Send either:

- `x-current-user-id` header
- `currentUserId` in the JSON body

The user ID must match the comment author.

## Realtime Updates Do Not Appear

Check both environment URLs:

- Frontend `VITE_WEBSOCKET_URL` points to the backend host.
- Backend accepts the frontend origin through `CORS_ORIGIN`.

Also confirm clients are viewing the same project. Events are scoped to `project-${projectId}` rooms.

## Playwright Tests Fail

Start the required app services before running E2E tests unless the Playwright config starts them automatically.

```sh
cd backend
npm run dev
cd ../frontend
npm run dev
npm run test:e2e
```

## Lint or Build Fails After Dependency Changes

Reinstall from the relevant package directory.

```sh
cd backend
npm install
npm run build
```

```sh
cd frontend
npm install
npm run build
```

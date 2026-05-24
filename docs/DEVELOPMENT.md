# Development Workflow

## Prerequisites

- Node.js 20.x
- npm
- Docker and Docker Compose
- PostgreSQL 16, provided locally by `docker-compose.yml`
- Git

## Install

Install backend and frontend dependencies independently.

```sh
cd backend
npm install
cd ../frontend
npm install
```

## Environment

Backend:

```sh
cp backend/.env.example backend/.env
```

Required values:

- `DATABASE_URL`
- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN`

Frontend:

```sh
cp frontend/.env.example frontend/.env
```

Required values:

- `VITE_API_BASE_URL`
- `VITE_WEBSOCKET_URL`

## Database

Start PostgreSQL through Docker Compose from the repository root:

```sh
docker compose up -d postgres
```

The Compose service is named `postgres`, the container is `taskify-postgres`, and the database is exposed on `localhost:5432`.

Use this backend connection string:

```sh
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskify?schema=public"
```

Then run migrations and seed data.

```sh
cd backend
npx prisma migrate dev
npx prisma db seed
```

The seed creates five users and three sample projects with demo tasks and comments.

## Run Locally

Backend:

```sh
cd backend
npm run dev
```

Frontend:

```sh
cd frontend
npm run dev
```

Default URLs:

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- API base: `http://localhost:3000/api/v1`
- PostgreSQL: `localhost:5432`, database `taskify`, user `postgres`, password `password`

## Docker Compose

The current Compose setup intentionally runs PostgreSQL only. Backend and frontend still run with npm during local development.

Useful commands:

```sh
docker compose up -d postgres
docker compose ps
docker compose logs postgres
docker compose down
```

To delete local database data and recreate the volume:

```sh
docker compose down -v
docker compose up -d postgres
```

## Checks

Backend:

```sh
cd backend
npm test
npm run lint
npm run build
```

Frontend:

```sh
cd frontend
npm test
npm run lint
npm run build
npm run test:e2e
```

## Debugging

- Use `GET /health` before debugging application routes.
- Confirm Docker Compose reports `taskify-postgres` as healthy before running migrations.
- Confirm `DATABASE_URL` points to `postgresql://postgres:password@localhost:5432/taskify?schema=public` for local development.
- Confirm the frontend `VITE_API_BASE_URL` points to `/api/v1`, not just the backend host.
- Use `x-current-user-id` for API calls that need current-user ownership checks.
- For realtime issues, confirm the client uses the same backend origin as `VITE_WEBSOCKET_URL`.

## Change Process

- Keep changes scoped to the active task in `specs/001-create-taskify/tasks.md`.
- Add or update tests with implementation changes.
- Update source-aligned documentation when API, setup, or workflow behavior changes.
- Mark completed tasks in `tasks.md` only after implementation and validation.

# Taskify

Taskify is a team productivity MVP for creating projects, assigning predefined team members, managing Kanban tasks, and collaborating through task comments. It uses a Node.js/Express API, PostgreSQL with Prisma, Socket.IO realtime updates, and a React/Vite frontend.

## Features

- No-password current-user selection with five predefined users.
- Three seeded sample projects for immediate exploration.
- Project creation and team member assignment.
- Kanban board with To Do, In Progress, In Review, and Done columns.
- Task creation, assignment, drag-and-drop movement, editing, and soft deletion.
- Task comments with author-only edit and delete controls.
- Socket.IO updates for task and comment changes.

## Stack

- Backend: Node.js 20, TypeScript, Express, Prisma, Socket.IO, Jest.
- Frontend: React 18, TypeScript, Vite, React Query, Zustand, dnd-kit, Tailwind CSS, Vitest, Playwright.
- Database: PostgreSQL 16 via Docker Compose for local development.

## Quick Start

Install dependencies:

```sh
cd backend
npm install
cd ../frontend
npm install
```

Configure environment files:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Start PostgreSQL with Docker Compose:

```sh
docker compose up -d postgres
```

The local database URL is:

```sh
postgresql://postgres:password@localhost:5432/taskify?schema=public
```

Run database setup:

```sh
cd backend
npx prisma migrate dev
npx prisma db seed
```

Start the backend:

```sh
cd backend
npm run dev
```

Start the frontend:

```sh
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Useful Commands

Database:

```sh
docker compose up -d postgres
docker compose ps
docker compose logs postgres
docker compose down
```

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

## Documentation

- Backend API: `backend/docs/api.md`
- Frontend components: `frontend/docs/components.md`
- Development workflow: `docs/DEVELOPMENT.md`
- Deployment guide: `docs/DEPLOYMENT.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`
- Feature spec and plan: `specs/001-create-taskify/`

## Current Scope

This is an MVP with predefined users and sample data. Authentication, organizations, labels, due dates, attachments, persisted notifications, and production-grade observability are outside the current feature scope.

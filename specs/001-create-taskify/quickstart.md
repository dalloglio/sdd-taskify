# Taskify Quick Start Guide

**Version**: 1.0.0  
**Last Updated**: 2026-05-06

## Overview

Taskify is a team productivity platform with a React frontend and Node.js/Express backend. This guide covers local development setup, running both services, and initial testing.

## Prerequisites

- **Node.js**: 20.x LTS
- **PostgreSQL**: 14+ (Docker)
- **npm**: For package management
- **Git**: For version control

## Project Structure

```
taskify/
├── backend/                 # Express.js REST API
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                # React SPA
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── specs/                   # Feature specifications & documentation
│   └── 001-create-taskify/
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       ├── research.md
│       └── contracts/
│
└── README.md
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskify
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

For Docker PostgreSQL:

```bash
docker run --name taskify-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=taskify -p 5432:5432 -d postgres:14
```

### 3. Database Setup

Initialize the database schema using Prisma:

```bash
npx prisma migrate dev --name init
npx prisma db seed           # Load sample data (5 users, 3 projects, sample tasks)
```

### 4. Run Backend Dev Server

```bash
npm run dev
```

Expected output:

```
Server running on http://localhost:3000
Connected to PostgreSQL: taskify
WebSocket server ready at ws://localhost:3000
```

### 5. Verify Backend Health

```bash
curl http://localhost:3000/health
# Response: { "status": "ok", "timestamp": "2026-05-06T10:00:00Z" }
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
# .env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WEBSOCKET_URL=ws://localhost:3000
```

### 3. Run Frontend Dev Server

```bash
npm run dev
```

Expected output:

```
VITE v5.0.0  ready in 245 ms
➜  Local:   http://localhost:5173/
```

### 4. Open in Browser

Navigate to `http://localhost:5173/` in your browser.

---

## Testing the MVP

### Initial Load

1. **User Selection Screen**: Five predefined users appear
   - Alice Chen (Product Manager)
   - Bob Smith (Engineer)
   - Carol Johnson (Engineer)
   - Dave Wilson (Engineer)
   - Emma Lee (Engineer)

2. **Select a user** (e.g., "Alice Chen")

3. **Project List**: Three sample projects are visible
   - Website Redesign
   - Mobile App v2
   - API Refactor

### Feature Testing

#### User Story 1: Create and Manage Projects

1. Click **"Create Project"**
2. Enter project name: "Test Project"
3. Select team members (e.g., Bob, Carol)
4. Click **"Create"** → Project appears in list

**Verify**:

- ✅ Project is listed on the home screen
- ✅ Team members are visible in project details

#### User Story 2: Create and Move Tasks

1. Open **"Website Redesign"** project
2. In "To Do" column, click **"+ Add Task"**
3. Enter:
   - Title: "Create hero section"
   - Description: "Design the main landing section"
   - Assignee: "Bob Smith"
4. Click **"Create"** → Task appears in "To Do" column

5. **Drag the task** to "In Progress" column
   - Verify real-time update (other users see the move)

**Verify**:

- ✅ Task appears in correct column
- ✅ Drag-and-drop updates board instantly
- ✅ All connected clients see the move

#### User Story 3: Comments on Tasks

1. Click on a task card (e.g., "Create hero section")
2. Scroll to "Comments" section
3. Enter comment: "Let's use a video background"
4. Click **"Add Comment"** → Comment appears with author name

5. As the same user, hover over your comment:
   - ✅ Edit and Delete buttons appear
6. As a different user:
   - ✅ Edit and Delete buttons are hidden

**Verify**:

- ✅ Comment is visible with author name
- ✅ Only the author can edit/delete
- ✅ Multiple comments can be added

#### User Story 4: Explore Sample Data

1. Log in as different users and verify:
   - ✅ Five users available in selection screen
   - ✅ Three sample projects appear
   - ✅ Each project has sample tasks and comments

---

## Development Workflow

### Running Tests

**Backend Unit Tests**:

```bash
cd backend
npm run test
```

**Backend Integration Tests**:

```bash
cd backend
npm run test:integration
```

**Frontend Unit Tests**:

```bash
cd frontend
npm run test
```

**Frontend E2E Tests** (Playwright):

```bash
cd frontend
npm run test:e2e
```

### Building for Production

**Backend**:

```bash
cd backend
npm run build
npm start
```

**Frontend**:

```bash
cd frontend
npm run build
# Output: dist/
```

Serve the `dist/` folder with any static web server.

---

## Common Issues

### Issue: `ECONNREFUSED` when starting backend

**Problem**: PostgreSQL is not running.

**Solution**:

```bash
# If using Docker
docker start taskify-db

# Or check local PostgreSQL
psql -U postgres -d taskify
```

### Issue: Frontend shows blank page

**Problem**: Backend is not running or CORS is misconfigured.

**Solution**:

1. Verify backend is running: `curl http://localhost:3000/health`
2. Check `.env` file in frontend matches backend CORS_ORIGIN
3. Check browser console for errors

### Issue: Real-time updates not working

**Problem**: WebSocket connection failed.

**Solution**:

1. Verify backend WebSocket is listening: `npm run dev` shows "WebSocket server ready"
2. Check firewall/proxy settings allow WebSocket connections
3. Verify `VITE_WEBSOCKET_URL` in frontend `.env`

---

## API Documentation

Full API contracts are documented in:

- [Projects API](../contracts/projects-api.md)
- [Tasks API](../contracts/tasks-api.md)
- [Notifications API](../contracts/notifications-api.md)

### Quick Example: Fetch Projects

```bash
curl http://localhost:3000/api/v1/projects
```

Response:

```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Website Redesign",
      "members": [...],
      "taskCount": 5
    }
  ]
}
```

---

## Next Steps

1. **Read the Specification**: [spec.md](../spec.md) for detailed requirements
2. **Review Data Model**: [data-model.md](../data-model.md) for entity definitions
3. **Explore API Contracts**: [contracts/](../contracts/) for endpoint details
4. **Check Implementation Plan**: [plan.md](../plan.md) for architecture decisions
5. **View Research Findings**: [research.md](../research.md) for technology choices

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Taskify Kanban Board UI                    │  │
│  │  - User Selection Screen                          │  │
│  │  - Project List                                   │  │
│  │  - Kanban Board (drag-and-drop)                   │  │
│  │  - Task Details & Comments                        │  │
│  └──────────────────────────────────────────────────┘   │
└──────────┬────────────────────────────────────┬─────────┘
           │                                    │
      REST API                          WebSocket (Socket.IO)
      (HTTP)                            (Real-time)
           │                                    │
┌──────────▼────────────────────────────────────▼──────────┐
│                  Express.js Backend                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routes                                       │   │
│  │  - /api/v1/projects (CRUD)                        │   │
│  │  - /api/v1/tasks (CRUD)                           │   │
│  │  - /api/v1/comments (CRUD)                        │   │
│  │                                                   │   │
│  │  WebSocket Handlers                               │   │
│  │  - task:moved, comment:added, etc.                │   │
│  └──────────────────────────────────────────────────┘   │
└──────────┬────────────────────────────────────────────────┘
           │
        PostgreSQL
     (Data Persistence)
```

---

## Deployment Readiness

For production deployment, ensure:

- [ ] Environment variables are secured (use .env.production)
- [ ] Database is backed up regularly
- [ ] CORS origins are restricted to production domain
- [ ] WebSocket connections are secured (wss:// over WSS)
- [ ] Error logging and monitoring are enabled
- [ ] API rate limiting is configured

See `docs/deployment.md` for detailed deployment instructions.

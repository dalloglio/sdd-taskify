# Taskify API

Taskify exposes a versioned REST API under `/api/v1` plus Socket.IO events for board updates. Authentication is intentionally omitted for this MVP; requests that need current-user context use `x-current-user-id`.

## Response Shape

Successful JSON responses use:

```json
{ "data": {} }
```

Validation and service failures use:

```json
{ "error": "Human-readable message" }
```

## Health

### GET `/health`

Returns service health for local checks and deployment probes.

## Users

### GET `/api/v1/users`

Returns the five predefined users.

## Projects

### GET `/api/v1/projects`

Lists projects with members and `isSample` on seeded sample projects.

### POST `/api/v1/projects`

Creates a project.

```json
{
  "name": "Launch Plan",
  "description": "Optional project notes",
  "memberIds": ["00000000-0000-0000-0000-000000000000"]
}
```

Validation:

- `name` is required.
- `memberIds` is optional and must contain UUIDs.

### GET `/api/v1/projects/:projectId`

Returns project details with member information.

### POST `/api/v1/projects/:projectId/members`

Adds a predefined user to a project.

```json
{ "userId": "00000000-0000-0000-0000-000000000000" }
```

## Tasks

### GET `/api/v1/projects/:projectId/tasks`

Lists active tasks for a project.

Query parameters:

- `status`: `to_do`, `in_progress`, `in_review`, or `done`
- `assigneeId`: user UUID
- `limit`, `offset`: numeric pagination hints

### POST `/api/v1/projects/:projectId/tasks`

Creates a task and emits `task:created`.

```json
{
  "title": "Create hero section",
  "description": "Design the main landing section",
  "assigneeId": "00000000-0000-0000-0000-000000000000",
  "status": "to_do",
  "createdById": "00000000-0000-0000-0000-000000000001"
}
```

Validation:

- `title` is required, 1-255 characters.
- `description` is optional, up to 5000 characters.
- `assigneeId` is optional, nullable, and must be a project member when set.
- `status` defaults to `to_do`.
- `createdById` may also be supplied by `x-current-user-id`.

### GET `/api/v1/tasks/:taskId`

Returns a task with assignee, creator, and comments.

### PATCH `/api/v1/tasks/:taskId`

Updates title, description, assignee, or status and emits `task:updated`.

### PATCH `/api/v1/tasks/:taskId/status`

Moves a task between Kanban columns and emits `task:moved`.

```json
{ "status": "in_review" }
```

### DELETE `/api/v1/tasks/:taskId`

Soft-deletes a task and emits `task:deleted`. Returns `204`.

## Comments

### GET `/api/v1/tasks/:taskId/comments`

Lists active comments for a task in chronological order.

### POST `/api/v1/tasks/:taskId/comments`

Creates a comment and emits `comment:added`.

```json
{
  "text": "Let's use a video background",
  "authorId": "00000000-0000-0000-0000-000000000000"
}
```

Validation:

- `text` is required, trimmed, and limited to 5000 characters.
- `authorId` may also be supplied by `x-current-user-id`.

### PATCH `/api/v1/comments/:commentId`

Updates a comment and emits `comment:updated`. Only the author may update.

```json
{
  "text": "Updated wording",
  "currentUserId": "00000000-0000-0000-0000-000000000000"
}
```

### DELETE `/api/v1/comments/:commentId`

Soft-deletes a comment and emits `comment:deleted`. Only the author may delete. Returns `204`.

## Sample Data

### GET `/api/v1/sample-data`

Returns a summary of seeded users, projects, tasks, and comments for the demo workspace.

## Socket.IO Events

Clients join project rooms through the Socket.IO server. REST writes emit to `project-${projectId}` rooms.

Server-emitted events:

- `task:created`
- `task:updated`
- `task:moved`
- `task:deleted`
- `comment:added`
- `comment:updated`
- `comment:deleted`

Client-forwarded events accepted by the realtime handler:

- `task:create`
- `task:update`
- `task:move`
- `task:delete`
- `comment:create`
- `comment:update`
- `comment:delete`

Each realtime payload must include `projectId`; invalid payloads receive `task:error` or `comment:error`.

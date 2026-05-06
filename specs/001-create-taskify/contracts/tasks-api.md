# Tasks API Contract

**Version**: 1.0.0  
**Base Path**: `/api/v1/tasks`  
**Authentication**: None (MVP phase)  
**Content-Type**: `application/json`

## Overview

The Tasks API manages task lifecycle within projects: creation, assignment, status management, and deletion. Real-time updates are broadcasted via WebSocket for Kanban board synchronization.

## Endpoints

### 1. List Tasks by Project

**GET** `/api/v1/projects/{projectId}/tasks`

Retrieve all tasks in a project, optionally filtered by status.

**Path Parameters**:

- `projectId`: UUID of the project

**Query Parameters**:

- `status`: Filter by status (to_do | in_progress | in_review | done) - optional
- `assigneeId`: Filter by assignee ID - optional
- `limit`: integer (default: 100)
- `offset`: integer (default: 0)

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "task-uuid-1",
      "projectId": "project-uuid",
      "title": "Design landing page",
      "description": "Create mockups and design system",
      "status": "in_progress",
      "assignee": {
        "id": "user-uuid-1",
        "name": "Bob Smith",
        "role": "engineer",
        "avatarUrl": "https://..."
      },
      "createdBy": {
        "id": "user-uuid-2",
        "name": "Alice Chen",
        "role": "product_manager"
      },
      "commentCount": 3,
      "createdAt": "2026-05-06T10:00:00Z",
      "updatedAt": "2026-05-06T10:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "limit": 100,
    "offset": 0
  }
}
```

**Error** (404):

```json
{
  "error": "project_not_found",
  "message": "Project not found",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 2. Get Task by ID

**GET** `/api/v1/tasks/{taskId}`

Retrieve a single task with full details and comment history.

**Path Parameters**:

- `taskId`: UUID of the task

**Response** (200 OK):

```json
{
  "data": {
    "id": "task-uuid-1",
    "projectId": "project-uuid",
    "title": "Design landing page",
    "description": "Create mockups and design system",
    "status": "in_progress",
    "assignee": {
      "id": "user-uuid-1",
      "name": "Bob Smith",
      "role": "engineer",
      "avatarUrl": "https://..."
    },
    "createdBy": {
      "id": "user-uuid-2",
      "name": "Alice Chen",
      "role": "product_manager"
    },
    "comments": [
      {
        "id": "comment-uuid-1",
        "text": "Let's prioritize mobile responsiveness",
        "author": {
          "id": "user-uuid-1",
          "name": "Bob Smith",
          "avatarUrl": "https://..."
        },
        "createdAt": "2026-05-06T10:30:00Z",
        "updatedAt": "2026-05-06T10:30:00Z",
        "canEdit": false,
        "canDelete": false
      }
    ],
    "createdAt": "2026-05-06T10:00:00Z",
    "updatedAt": "2026-05-06T10:15:00Z"
  }
}
```

**Error** (404):

```json
{
  "error": "not_found",
  "message": "Task not found",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 3. Create Task

**POST** `/api/v1/projects/{projectId}/tasks`

Create a new task in a project.

**Path Parameters**:

- `projectId`: UUID of the project

**Request Body**:

```json
{
  "title": "Implement authentication",
  "description": "Add OAuth2 integration",
  "assigneeId": "user-uuid-1",
  "status": "to_do"
}
```

**Validation**:

- `title`: Required, string, 1-255 characters
- `description`: Optional, string, max 5000 characters
- `assigneeId`: Optional, must be a valid project member if provided
- `status`: Optional (defaults to "to_do"), must be one of: to_do | in_progress | in_review | done

**Response** (201 Created):

```json
{
  "data": {
    "id": "new-task-uuid",
    "projectId": "project-uuid",
    "title": "Implement authentication",
    "description": "Add OAuth2 integration",
    "status": "to_do",
    "assignee": {
      "id": "user-uuid-1",
      "name": "Bob Smith",
      "role": "engineer"
    },
    "createdBy": {
      "id": "current-user-uuid",
      "name": "Alice Chen"
    },
    "comments": [],
    "createdAt": "2026-05-06T10:00:00Z",
    "updatedAt": "2026-05-06T10:00:00Z"
  }
}
```

**Error** (400 Bad Request):

```json
{
  "error": "validation_error",
  "message": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required and must be 1-255 characters"
    },
    {
      "field": "assigneeId",
      "message": "Assignee must be a project member"
    }
  ],
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 4. Update Task

**PATCH** `/api/v1/tasks/{taskId}`

Update task details: title, description, status, or assignee.

**Path Parameters**:

- `taskId`: UUID of the task

**Request Body** (any combination):

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "assigneeId": "user-uuid-2"
}
```

**Validation**:

- `assigneeId`: If provided, must be a valid project member
- `status`: If provided, must be one of: to_do | in_progress | in_review | done

**Response** (200 OK):

```json
{
  "data": {
    "id": "task-uuid",
    "projectId": "project-uuid",
    "title": "Updated title",
    "description": "Updated description",
    "status": "in_progress",
    "assignee": {
      "id": "user-uuid-2",
      "name": "Carol Johnson",
      "role": "engineer"
    },
    "updatedAt": "2026-05-06T10:30:00Z"
  }
}
```

**Error** (409 Conflict):

```json
{
  "error": "invalid_assignment",
  "message": "Assignee is not a member of this project",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 5. Delete Task

**DELETE** `/api/v1/tasks/{taskId}`

Soft-delete a task (marked as deleted but retained in database). Comments are also soft-deleted.

**Path Parameters**:

- `taskId`: UUID of the task

**Response** (204 No Content)

**Error** (404):

```json
{
  "error": "not_found",
  "message": "Task not found",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

## Real-time Events (WebSocket)

All task mutations trigger WebSocket events to the project room.

### Task Created

**Event**: `task:created`

```json
{
  "taskId": "new-task-uuid",
  "projectId": "project-uuid",
  "title": "New task",
  "status": "to_do",
  "assignee": { "id": "...", "name": "..." },
  "createdBy": { "id": "...", "name": "..." },
  "timestamp": "2026-05-06T10:00:00Z"
}
```

### Task Updated

**Event**: `task:updated`

```json
{
  "taskId": "task-uuid",
  "projectId": "project-uuid",
  "changes": {
    "status": { "from": "to_do", "to": "in_progress" },
    "assignee": { "from": null, "to": { "id": "...", "name": "..." } }
  },
  "updatedAt": "2026-05-06T10:15:00Z"
}
```

### Task Deleted

**Event**: `task:deleted`

```json
{
  "taskId": "task-uuid",
  "projectId": "project-uuid",
  "timestamp": "2026-05-06T10:20:00Z"
}
```

### Task Moved (Status Changed)

**Event**: `task:moved` (special case of task:updated)

```json
{
  "taskId": "task-uuid",
  "projectId": "project-uuid",
  "fromStatus": "to_do",
  "toStatus": "in_progress",
  "timestamp": "2026-05-06T10:15:00Z"
}
```

---

## Error Response Format

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": [],
  "timestamp": "2026-05-06T10:00:00Z"
}
```

**Standard Error Codes**:

- `validation_error`: Input validation failed
- `not_found`: Task or project not found
- `invalid_assignment`: Assignee is not a project member
- `conflict`: State conflict (e.g., invalid status transition)
- `internal_server_error`: Server error

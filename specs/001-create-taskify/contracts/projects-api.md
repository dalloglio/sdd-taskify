# Projects API Contract

**Version**: 1.0.0  
**Base Path**: `/api/v1/projects`  
**Authentication**: None (MVP phase)  
**Content-Type**: `application/json`

## Overview

The Projects API manages project lifecycle: creation, retrieval, team member management, and deletion. Supports Kanban board scope and project-level operations.

## Endpoints

### 1. List All Projects

**GET** `/api/v1/projects`

Returns all projects visible to the current session (all projects for MVP).

**Query Parameters**:

- `limit`: integer (default: 50, max: 100) - Pagination limit
- `offset`: integer (default: 0) - Pagination offset

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Website Redesign",
      "description": "Modernize the company website",
      "createdById": "user-uuid",
      "createdAt": "2026-05-06T10:00:00Z",
      "updatedAt": "2026-05-06T10:00:00Z",
      "members": [
        {
          "id": "user-uuid-1",
          "name": "Alice Chen",
          "role": "product_manager",
          "avatarUrl": "https://..."
        }
      ],
      "taskCount": 12,
      "memberCount": 3
    }
  ],
  "meta": {
    "total": 3,
    "limit": 50,
    "offset": 0
  }
}
```

**Error** (500):

```json
{
  "error": "internal_server_error",
  "message": "Failed to fetch projects",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 2. Get Project by ID

**GET** `/api/v1/projects/{projectId}`

Retrieve a single project with full details including members and task summary.

**Path Parameters**:

- `projectId`: UUID of the project

**Response** (200 OK):

```json
{
  "data": {
    "id": "uuid-1",
    "name": "Website Redesign",
    "description": "Modernize the company website",
    "createdById": "user-uuid",
    "createdAt": "2026-05-06T10:00:00Z",
    "updatedAt": "2026-05-06T10:00:00Z",
    "members": [
      {
        "id": "user-uuid-1",
        "name": "Alice Chen",
        "role": "product_manager",
        "avatarUrl": "https://..."
      }
    ],
    "tasksByStatus": {
      "to_do": 3,
      "in_progress": 4,
      "in_review": 2,
      "done": 3
    }
  }
}
```

**Error** (404):

```json
{
  "error": "not_found",
  "message": "Project not found",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 3. Create Project

**POST** `/api/v1/projects`

Create a new project. The current user (from session/header) becomes the creator.

**Request Body**:

```json
{
  "name": "New Project",
  "description": "Optional description",
  "memberIds": ["user-uuid-1", "user-uuid-2"]
}
```

**Validation**:

- `name`: Required, string, 1-255 characters
- `description`: Optional, string, max 5000 characters
- `memberIds`: Array of valid User IDs; must all exist and be valid

**Response** (201 Created):

```json
{
  "data": {
    "id": "new-uuid",
    "name": "New Project",
    "description": "Optional description",
    "createdById": "current-user-uuid",
    "createdAt": "2026-05-06T10:00:00Z",
    "updatedAt": "2026-05-06T10:00:00Z",
    "members": [
      {
        "id": "current-user-uuid",
        "name": "Alice Chen",
        "role": "product_manager"
      }
    ]
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
      "field": "name",
      "message": "Name is required and must be 1-255 characters"
    },
    {
      "field": "memberIds",
      "message": "One or more member IDs are invalid"
    }
  ],
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 4. Update Project

**PATCH** `/api/v1/projects/{projectId}`

Update project metadata (name, description). Cannot change creator.

**Path Parameters**:

- `projectId`: UUID of the project

**Request Body**:

```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response** (200 OK):

```json
{
  "data": {
    "id": "projectId",
    "name": "Updated Project Name",
    "description": "Updated description",
    "createdById": "user-uuid",
    "createdAt": "2026-05-06T10:00:00Z",
    "updatedAt": "2026-05-06T10:00:00Z"
  }
}
```

**Error** (404):

```json
{
  "error": "not_found",
  "message": "Project not found",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 5. Add Member to Project

**POST** `/api/v1/projects/{projectId}/members`

Add a predefined user to the project team.

**Path Parameters**:

- `projectId`: UUID of the project

**Request Body**:

```json
{
  "userId": "user-uuid"
}
```

**Validation**:

- `userId`: Required, must reference a valid User, must not already be a member

**Response** (200 OK):

```json
{
  "data": {
    "id": "projectId",
    "members": [
      {
        "id": "user-uuid",
        "name": "Alice Chen",
        "role": "product_manager",
        "avatarUrl": "https://..."
      }
    ]
  }
}
```

**Error** (409 Conflict):

```json
{
  "error": "already_member",
  "message": "User is already a member of this project",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 6. Remove Member from Project

**DELETE** `/api/v1/projects/{projectId}/members/{userId}`

Remove a user from the project team. Creator cannot be removed.

**Path Parameters**:

- `projectId`: UUID of the project
- `userId`: UUID of the user to remove

**Response** (204 No Content)

**Error** (409 Conflict):

```json
{
  "error": "cannot_remove_creator",
  "message": "Cannot remove the project creator",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### 7. Delete Project

**DELETE** `/api/v1/projects/{projectId}`

Delete a project and all associated tasks/comments (cascade delete).

**Path Parameters**:

- `projectId`: UUID of the project

**Response** (204 No Content)

**Error** (404):

```json
{
  "error": "not_found",
  "message": "Project not found",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

## Error Response Format

All errors follow this standard format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": [], // Optional, for validation errors
  "timestamp": "2026-05-06T10:00:00Z"
}
```

**Standard Error Codes**:

- `validation_error`: Input validation failed
- `not_found`: Resource not found
- `conflict`: Resource already exists or state conflict
- `unauthorized`: Authentication/authorization issue
- `internal_server_error`: Server error

---

## Real-time Events

When members are added/removed, a WebSocket event is emitted to all connected clients in the project room:

**Event**: `project:member_added` / `project:member_removed`

```json
{
  "projectId": "uuid",
  "userId": "uuid",
  "userName": "Alice Chen",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

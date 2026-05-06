# Notifications API & Real-time Events Contract

**Version**: 1.0.0  
**Base Path**: `/api/v1/notifications`  
**Transport**: WebSocket (Socket.IO) + REST (for future polling/fetch)  
**Authentication**: None (MVP phase)

## Overview

The Notifications API handles real-time event broadcasting and optional notification persistence. For MVP, notifications are ephemeral (sent to connected clients only). Future phases can add database persistence, email notifications, and notification history.

## Architecture

### Real-time Transport (Socket.IO)

All real-time events are emitted via Socket.IO to project-specific rooms. Clients connect to the server and join project rooms to receive updates.

**Connection Flow**:

1. Client connects to WebSocket server: `ws://localhost:3000/socket.io/`
2. Client joins a project room: `socket.emit('join_project', { projectId: 'uuid' })`
3. Client receives events: `socket.on('task:updated', handler)`
4. Client leaves project: `socket.emit('leave_project', { projectId: 'uuid' })`

---

## WebSocket Events

### System Events

#### Connection Established

**Event**: `connect`

```json
{
  "message": "Connected to Taskify server"
}
```

#### Project Joined

**Event**: `project:joined`

```json
{
  "projectId": "uuid",
  "message": "Joined project room",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

#### Project Left

**Event**: `project:left`

```json
{
  "projectId": "uuid",
  "message": "Left project room",
  "timestamp": "2026-05-06T10:00:00Z"
}
```

#### Users Online

**Event**: `project:users_online`

```json
{
  "projectId": "uuid",
  "onlineUsers": [
    { "id": "uuid-1", "name": "Alice Chen" },
    { "id": "uuid-2", "name": "Bob Smith" }
  ],
  "count": 2,
  "timestamp": "2026-05-06T10:00:00Z"
}
```

---

### Task Events

#### Task Created

**Event**: `task:created`

```json
{
  "taskId": "uuid",
  "projectId": "uuid",
  "title": "New task",
  "description": "Task description",
  "status": "to_do",
  "assignee": {
    "id": "uuid",
    "name": "Bob Smith"
  },
  "createdBy": {
    "id": "uuid",
    "name": "Alice Chen"
  },
  "createdAt": "2026-05-06T10:00:00Z"
}
```

#### Task Updated

**Event**: `task:updated`

```json
{
  "taskId": "uuid",
  "projectId": "uuid",
  "changes": {
    "title": { "from": "Old title", "to": "New title" },
    "status": { "from": "to_do", "to": "in_progress" },
    "assignee": { "from": null, "to": { "id": "uuid", "name": "Bob Smith" } }
  },
  "updatedAt": "2026-05-06T10:15:00Z"
}
```

#### Task Moved (Kanban Drag-and-Drop)

**Event**: `task:moved`

```json
{
  "taskId": "uuid",
  "projectId": "uuid",
  "fromStatus": "to_do",
  "toStatus": "in_progress",
  "draggedByUser": {
    "id": "uuid",
    "name": "Alice Chen"
  },
  "timestamp": "2026-05-06T10:15:00Z"
}
```

#### Task Deleted

**Event**: `task:deleted`

```json
{
  "taskId": "uuid",
  "projectId": "uuid",
  "deletedBy": {
    "id": "uuid",
    "name": "Alice Chen"
  },
  "timestamp": "2026-05-06T10:20:00Z"
}
```

---

### Comment Events

#### Comment Added

**Event**: `comment:added`

```json
{
  "commentId": "uuid",
  "taskId": "uuid",
  "projectId": "uuid",
  "text": "This is a great task!",
  "author": {
    "id": "uuid",
    "name": "Bob Smith",
    "avatarUrl": "https://..."
  },
  "createdAt": "2026-05-06T10:30:00Z"
}
```

#### Comment Updated

**Event**: `comment:updated`

```json
{
  "commentId": "uuid",
  "taskId": "uuid",
  "projectId": "uuid",
  "text": "Updated comment text",
  "author": {
    "id": "uuid",
    "name": "Bob Smith"
  },
  "updatedAt": "2026-05-06T10:35:00Z"
}
```

#### Comment Deleted

**Event**: `comment:deleted`

```json
{
  "commentId": "uuid",
  "taskId": "uuid",
  "projectId": "uuid",
  "deletedBy": {
    "id": "uuid",
    "name": "Bob Smith"
  },
  "timestamp": "2026-05-06T10:40:00Z"
}
```

---

### Project Member Events

#### Member Added

**Event**: `project:member_added`

```json
{
  "projectId": "uuid",
  "user": {
    "id": "uuid",
    "name": "Carol Johnson",
    "role": "engineer",
    "avatarUrl": "https://..."
  },
  "addedBy": {
    "id": "uuid",
    "name": "Alice Chen"
  },
  "timestamp": "2026-05-06T11:00:00Z"
}
```

#### Member Removed

**Event**: `project:member_removed`

```json
{
  "projectId": "uuid",
  "userId": "uuid",
  "userName": "Carol Johnson",
  "removedBy": {
    "id": "uuid",
    "name": "Alice Chen"
  },
  "timestamp": "2026-05-06T11:05:00Z"
}
```

---

## REST Endpoints (Optional, for Future Use)

### Get Notification History (Future)

**GET** `/api/v1/notifications`

Retrieve past notifications for a user (requires database persistence).

**Query Parameters**:

- `limit`: integer (default: 50)
- `offset`: integer (default: 0)

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "notification-uuid",
      "type": "task_assigned",
      "title": "You were assigned a task",
      "message": "Alice assigned 'Design landing page' to you",
      "relatedId": "task-uuid",
      "read": false,
      "createdAt": "2026-05-06T10:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "unread": 2
  }
}
```

### Mark as Read (Future)

**POST** `/api/v1/notifications/{notificationId}/read`

Mark a notification as read (requires database persistence).

---

## Client Integration Patterns

### Listening to Events

```typescript
// Connect and join project
socket.on("connect", () => {
  socket.emit("join_project", { projectId: "uuid" });
});

// Listen to task events
socket.on("task:moved", (event) => {
  console.log(`Task moved: ${event.fromStatus} → ${event.toStatus}`);
  // Update UI Kanban board
});

socket.on("task:updated", (event) => {
  console.log(`Task updated:`, event.changes);
  // Update task card UI
});

socket.on("comment:added", (event) => {
  console.log(`New comment from ${event.author.name}`);
  // Add comment to task detail view
});
```

### Emitting Events (Sending Task Updates)

```typescript
// Client initiates task move (drag-and-drop)
socket.emit(
  "task:move",
  {
    taskId: "uuid",
    fromStatus: "to_do",
    toStatus: "in_progress",
  },
  (acknowledgement) => {
    if (acknowledgement.success) {
      console.log("Task moved successfully");
    } else {
      console.error("Failed to move task:", acknowledgement.error);
    }
  },
);
```

---

## Error Handling

### WebSocket Disconnection

```json
{
  "event": "disconnect",
  "reason": "server_disconnect | client_disconnect | transport_close",
  "reconnectionDelay": 1000
}
```

**Client Behavior**: Automatically attempt to reconnect with exponential backoff (1s → 2s → 4s max).

### Event Acknowledgment

All mutation events (task:move, comment:add, etc.) can return acknowledgment:

```json
{
  "success": true,
  "taskId": "uuid",
  "timestamp": "2026-05-06T10:15:00Z"
}
```

or

```json
{
  "success": false,
  "error": "invalid_assignment",
  "message": "Assignee is not a project member",
  "timestamp": "2026-05-06T10:15:00Z"
}
```

---

## Scalability Notes

- **For MVP**: Socket.IO in-memory adapter (single server instance)
- **For Growth**: Migrate to Redis adapter for multi-server deployments
- **For Production**: Add database persistence for notification history; consider pub/sub patterns

---

## Future Extensions (Out of Scope for MVP)

- Email notifications for assigned tasks
- Notification preferences (email, in-app, push)
- Notification history and read/unread status
- User presence indicators (who is currently viewing a task)
- Typing indicators (real-time collaboration)
- Conflict resolution for simultaneous updates

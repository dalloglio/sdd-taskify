# Technical Research & Recommendations: Taskify Implementation

**Date**: 2026-05-06  
**Phase**: Phase 0 Research (Input for Phase 1 Design)  
**Purpose**: Evaluate architecture choices for real-time Kanban board, drag-and-drop, ORM, state management, and API design

---

## 1. Real-Time Updates Architecture

### Overview

Taskify requires real-time task updates when team members drag tasks between columns or modify them. The key decision: **Socket.IO vs Server-Sent Events (SSE)**.

### Socket.IO

**What it is**: Bidirectional event-based communication library built on WebSockets with fallbacks.

**Pros**:

- ✅ **Bidirectional**: Client→Server and Server→Client communication (ideal for drag-and-drop feedback)
- ✅ **Automatic fallback**: Degrades gracefully to polling/long-polling if WebSocket unavailable
- ✅ **Room-based broadcasting**: Native support for project-scoped updates (rooms = projects)
- ✅ **Reconnection handling**: Built-in reconnection logic with exponential backoff
- ✅ **Middleware support**: Authentication and validation middleware for Socket connections
- ✅ **Mature ecosystem**: 5+ years production-ready, large community

**Cons**:

- ❌ **Higher memory footprint**: Maintains persistent connections for all clients
- ❌ **More complex debugging**: Event-based async flow harder to trace than HTTP
- ❌ **Overkill for one-way updates**: If only server→client needed, adds overhead

**Server-Side Setup** (Node.js):

```typescript
import { Server } from "socket.io";
import express from "express";

const app = express();
const io = new Server(app, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  // Listen for task move events
  socket.on("task:move", (payload) => {
    // Validate and update DB
    const { taskId, targetColumnId, projectId } = payload;
    updateTaskStatus(taskId, targetColumnId);

    // Broadcast to all clients in project room
    io.to(`project-${projectId}`).emit("task:moved", {
      taskId,
      targetColumnId,
      updatedAt: new Date().toISOString(),
    });
  });
});
```

**Client-Side Setup** (React):

```typescript
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io(process.env.REACT_APP_API_URL);

// Listen for updates
socket.on("task:moved", (data) => {
  // Update local state/cache
});

// Emit events
const moveTask = (taskId, targetColumn) => {
  socket.emit("task:move", { taskId, targetColumn });
};
```

---

### Server-Sent Events (SSE)

**What it is**: One-directional, HTTP-based Server→Client event streaming.

**Pros**:

- ✅ **Simpler**: Single direction reduces complexity (server tells client updates)
- ✅ **Lower memory**: No persistent bidirectional connection overhead
- ✅ **Native browser API**: EventSource built-in, no third-party library required
- ✅ **Better for read-heavy workflows**: Task updates don't require immediate client→server feedback

**Cons**:

- ❌ **Unidirectional only**: Client must use HTTP POST for moves, SSE only for notifications
- ❌ **No built-in reconnection**: Manual implementation required (more boilerplate)
- ❌ **Harder to broadcast selectively**: No native room concept like Socket.IO
- ❌ **Polling overhead for feedback**: Client move → HTTP POST → server update → SSE broadcast creates latency

**Server-Side Setup** (Node.js):

```typescript
// SSE endpoint
app.get("/api/projects/:projectId/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const clientId = generateId();
  sseClients.add({ clientId, projectId: req.params.projectId, res });

  req.on("close", () => sseClients.delete(clientId));
});

// Broadcast helper
function broadcastToProject(projectId, event, data) {
  sseClients.forEach((client) => {
    if (client.projectId === projectId) {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });
}
```

**Client-Side Setup** (React):

```typescript
useEffect(() => {
  const eventSource = new EventSource(`/api/projects/${projectId}/stream`);

  eventSource.addEventListener("task:moved", (e) => {
    const data = JSON.parse(e.data);
    updateLocalCache(data);
  });

  return () => eventSource.close();
}, [projectId]);
```

---

### Decision Matrix

| Criterion                     | Socket.IO              | SSE                             |
| ----------------------------- | ---------------------- | ------------------------------- |
| **Real-time latency**         | ~100ms (bidirectional) | ~150-300ms (includes HTTP POST) |
| **Bandwidth efficiency**      | ⭐⭐⭐ (binary frames) | ⭐⭐ (text/event-stream)        |
| **Implementation complexity** | Medium                 | Low                             |
| **Memory per connection**     | Higher (persistent)    | Lower (stream only)             |
| **Browser support**           | ✅ 99%+                | ✅ 95%+                         |
| **Reconnection handling**     | Automatic              | Manual                          |
| **Selective broadcasting**    | Native (rooms)         | Manual (client filtering)       |

---

### **RECOMMENDATION for Taskify**

**→ Use Socket.IO**

**Rationale**:

1. **Drag-and-drop is bidirectional**: Client initiates move (socket emit) → Server validates → broadcasts back (socket emit). SSE's unidirectional model forces hybrid HTTP+SSE approach, adding latency.
2. **Room-based isolation**: Projects are natural room boundaries. Multiple projects happening simultaneously benefits from Socket.IO's room architecture.
3. **Performance target achievable**: Sub-200ms updates easily met with Socket.IO; SSE + HTTP polling harder to optimize.
4. **React integration**: Libraries like `socket.io-client` + custom hooks integrate cleanly with React Query.
5. **Fallback resilience**: Automatic HTTP fallback means even in restrictive network conditions, app works.

**Implementation Pattern** (Recommended for Taskify):

```typescript
// Backend: Socket.IO with middleware validation
io.use((socket, next) => {
  const { userId, projectId } = socket.handshake.query;
  // Validate user is member of project
  validateProjectMembership(userId, projectId)
    ? next()
    : next(new Error("Unauthorized"));
});

// Frontend: React Query + Socket.IO integration
const useBoardUpdates = (projectId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(API_URL, {
      query: { projectId, userId: currentUserId },
    });

    socket.on("task:moved", (data) => {
      // Optimistic update already applied, confirm on server response
      queryClient.setQueryData(["tasks", projectId], (old) =>
        old.map((t) =>
          t.id === data.taskId ? { ...t, status: data.status } : t,
        ),
      );
    });

    return () => socket.disconnect();
  }, [projectId]);
};
```

---

## 2. Drag-and-Drop Libraries for React + TypeScript Kanban

### Overview

For Taskify's Kanban board, we need a production-ready drag-and-drop (DnD) library. Three contenders: **react-beautiful-dnd**, **dnd-kit**, **react-dnd**.

### react-beautiful-dnd (React Beautiful DnD)

**What it is**: Opinioned React DnD library with beautiful animations and accessibility (a11y) built-in. By Atlassian.

**Pros**:

- ✅ **Stunning animations**: Smooth drag interactions out-of-the-box
- ✅ **Accessibility**: WAI-ARIA compliant, keyboard navigation support
- ✅ **Maturity**: Production-ready at scale (used by Trello-like apps)
- ✅ **Simple API**: Minimal boilerplate for basic Kanban
- ✅ **Performance**: Virtualization for large task lists

**Cons**:

- ❌ **Maintenance concerns**: Limited updates (2023 last major version)
- ❌ **TypeScript support**: Incomplete type definitions (community-maintained)
- ❌ **Bundle size**: ~40KB gzipped
- ❌ **Portal requirement**: Requires `<DragDropContext>` wrapper, some nesting complexity
- ❌ **Mobile UX**: Touch support works but not optimized

**Example**:

```typescript
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export const Board: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId &&
        source.index === destination.index) return;

    // Optimistic update
    const taskId = draggableId;
    const targetColumn = destination.droppableId;
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: targetColumn } : t
    ));

    // Send to server
    socket.emit('task:move', { taskId, targetColumn, projectId });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {columns.map(col => (
        <Droppable key={col.id} droppableId={col.id}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {tasks.filter(t => t.status === col.id).map((task, idx) => (
                <Draggable key={task.id} draggableId={task.id} index={idx}>
                  {(provided, snapshot) => (
                    <TaskCard
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      task={task}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};
```

**Limitation for Taskify**: Maintenance risk if requiring TypeScript strict mode or modern React 18 concurrent features.

---

### dnd-kit

**What it is**: Lightweight, modular drag-and-drop toolkit for React. Modern alternative to react-beautiful-dnd.

**Pros**:

- ✅ **Modern TypeScript**: First-class TS support, strict types out-of-the-box
- ✅ **Lightweight**: ~20KB gzipped (50% smaller than react-beautiful-dnd)
- ✅ **Headless design**: Flexible, works with any UI framework (Tailwind, Material-UI, etc.)
- ✅ **Actively maintained**: Regular updates, RFC-driven development
- ✅ **Accessibility**: Full a11y support (keyboard, screen reader)
- ✅ **Extensible**: Sensors (mouse, touch, pointer) are composable
- ✅ **Mobile-first**: Optimized touch interactions for mobile Kanban

**Cons**:

- ❌ **Learning curve**: More setup required than react-beautiful-dnd
- ❌ **Animations**: Requires external library (e.g., Framer Motion) for polish
- ❌ **Sorting strategies**: More verbose for multi-column sorting

**Example** (Recommended for Taskify):

```typescript
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-white rounded shadow cursor-move hover:shadow-md"
    >
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
};

export const Board: React.FC<{ projectId: string; tasks: Task[] }> = ({
  projectId,
  tasks,
}) => {
  const [items, setItems] = useState<Task[]>(tasks);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeTask = items.find(t => t.id === active.id);
    const overTask = items.find(t => t.id === over.id);

    if (!activeTask || !overTask) return;

    // For multi-column: extract column from over.id
    const [targetColumn] = (over.id as string).split('-');

    // Optimistic update
    setItems(prev =>
      prev.map(t =>
        t.id === activeTask.id
          ? { ...t, status: targetColumn }
          : t
      )
    );

    // Emit to server
    socket.emit('task:move', {
      taskId: activeTask.id,
      targetColumn,
      projectId,
    });
  };

  const columns = ['todo', 'in-progress', 'review', 'done'];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {columns.map(colId => (
          <SortableContext
            key={colId}
            items={items.filter(t => t.status === colId).map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="font-bold mb-4">{colId}</h2>
              {items
                .filter(t => t.status === colId)
                .map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {/* Render active task during drag */}
      </DragOverlay>
    </DndContext>
  );
};
```

---

### react-dnd

**What it is**: Low-level drag-and-drop system for React using HTML5 DnD API. From React ecosystem pioneer Dan Abramov.

**Pros**:

- ✅ **Maximum flexibility**: Can implement any drag-and-drop pattern
- ✅ **Battle-tested**: 10+ years in production
- ✅ **Hooks API**: Modern `useDrag`, `useDrop` hooks

**Cons**:

- ❌ **Verbose**: Requires more boilerplate than alternatives
- ❌ **Complex API**: Steep learning curve
- ❌ **Touch support**: Requires additional library (react-dnd-touch-backend)
- ❌ **Animation**: No built-in animation support
- ❌ **Bundle size**: Larger than dnd-kit

**Not recommended for Taskify MVP due to complexity vs dnd-kit**.

---

### Decision Matrix

| Aspect                 | react-beautiful-dnd | dnd-kit                      | react-dnd |
| ---------------------- | ------------------- | ---------------------------- | --------- |
| **TypeScript support** | ⭐⭐                | ⭐⭐⭐⭐⭐                   | ⭐⭐⭐    |
| **Bundle size**        | 40KB                | 20KB                         | 45KB      |
| **Mobile UX**          | ⭐⭐⭐              | ⭐⭐⭐⭐⭐                   | ⭐⭐      |
| **Animations**         | ⭐⭐⭐⭐⭐          | ⭐⭐⭐ (needs Framer Motion) | ⭐⭐      |
| **Maintenance**        | ⚠️ Slowing          | ✅ Active                    | ✅ Stable |
| **Learning curve**     | ⭐⭐                | ⭐⭐⭐                       | ⭐⭐⭐⭐  |
| **Accessibility**      | ⭐⭐⭐⭐⭐          | ⭐⭐⭐⭐⭐                   | ⭐⭐⭐⭐  |

---

### **RECOMMENDATION for Taskify**

**→ Use dnd-kit**

**Rationale**:

1. **TypeScript first-class support**: Aligns with Taskify's TypeScript 5.x standard. Type-safe drag operations reduce bugs.
2. **Modern, actively maintained**: Long-term support guarantees. react-beautiful-dnd's slow update cycle risky.
3. **Lightweight**: 20KB vs 40KB matters for React 18+ apps, especially with real-time updates overhead.
4. **Mobile optimization**: Future roadmap may include mobile team members; dnd-kit's touch handling is superior.
5. **Modular**: Can compose sensors for keyboard, pointer, touch independently.
6. **Animation integration**: Works cleanly with Framer Motion (lightweight alternative) for polish.

**Integration with Socket.IO**:

```typescript
// Combine dnd-kit + Socket.IO for real-time multi-user updates
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over) return;

  // Optimistic update first (immediate visual feedback)
  setItems((prev) =>
    prev.map((t) =>
      t.id === active.id ? { ...t, status: extractColumnId(over.id) } : t,
    ),
  );

  // Emit to server for persistence
  socket.emit("task:move", {
    taskId: active.id,
    targetStatus: extractColumnId(over.id),
    projectId,
  });
};
```

---

## 3. Node.js ORM for PostgreSQL

### Overview

Taskify needs an ORM to manage Users, Projects, Tasks, and Comments entities. Evaluate **TypeORM**, **Prisma**, and **Sequelize** for REST API with microservice-style contracts.

### TypeORM

**What it is**: Object-relational mapper for TypeScript/JavaScript with decorators for entity definitions.

**Pros**:

- ✅ **Native TypeScript**: Full decorator support, reflection-based types
- ✅ **Flexible querying**: QueryBuilder API similar to raw SQL, highly expressive
- ✅ **Advanced relations**: Supports complex eager/lazy loading, circular references
- ✅ **Migrations**: Built-in migration system with CLI
- ✅ **Validation**: Works well with `class-validator` and `class-transformer`
- ✅ **Database agnostic**: Supports PostgreSQL, MySQL, SQLite, Oracle, etc.

**Cons**:

- ❌ **Large bundle**: ~2MB core (larger install footprint)
- ❌ **Decorators required**: Relies on TypeScript experimental feature (stage-3 proposal)
- ❌ **Learning curve**: QueryBuilder syntax verbose for complex queries
- ❌ **Performance**: Reflection overhead for large datasets
- ❌ **Version stability**: Major versions require migration work

**Example**:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable()
  team: User[];

  @OneToMany(() => Task, (task) => task.project, { eager: true })
  tasks: Task[];

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  assignee: User | null;

  @Column({ default: "todo" })
  status: "todo" | "in-progress" | "review" | "done";

  @OneToMany(() => Comment, (comment) => comment.task, { eager: true })
  comments: Comment[];
}

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => Task, (task) => task.comments)
  task: Task;

  @ManyToOne(() => User)
  author: User;
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  role: "pm" | "engineer";

  @ManyToMany(() => Project, (project) => project.team)
  projects: Project[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}

// Repository usage (in service)
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async moveTask(taskId: string, targetStatus: string): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id: taskId });
    if (!task) throw new Error("Task not found");

    task.status = targetStatus;
    return this.taskRepo.save(task);
  }
}
```

---

### Prisma

**What it is**: Next-generation ORM with auto-generated prisma client from schema definitions. No decorators, TypeScript-first.

**Pros**:

- ✅ **Prisma Schema**: Human-readable schema file (not decorators). Easier to grasp relationships.
- ✅ **Type safety**: Auto-generated types from schema (zero manual DTO creation).
- ✅ **Zero boilerplate**: Client generated, no Repository pattern needed.
- ✅ **Excellent DX**: Prisma Studio GUI for data exploration, built-in migrations.
- ✅ **Query optimization**: Smart query resolution avoids N+1 problems.
- ✅ **Lightweight**: ~500KB install (much smaller than TypeORM).
- ✅ **Modern maintenance**: Active development, regular updates.

**Cons**:

- ❌ **Less SQL control**: QueryBuilder not as powerful for complex queries
- ❌ **Vendor lock-in**: Prisma-specific schema syntax
- ❌ **Relations strategy**: Different eager/lazy loading patterns (select strategy).
- ❌ **Cloud features**: Premium features (Prisma Accelerate) require upgrade

**Example**:

```prisma
// schema.prisma
model User {
  id    String   @id @default(cuid())
  name  String
  email String   @unique
  role  UserRole

  projects     Project[]
  assignedTasks Task[]
  comments     Comment[]

  createdAt DateTime @default(now())
}

enum UserRole {
  PM
  ENGINEER
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String

  team  User[]
  tasks Task[]

  createdAt DateTime @default(now())
}

model Task {
  id        String   @id @default(cuid())
  title     String
  description String
  status    TaskStatus @default(TODO)

  project   Project @relation(fields: [projectId], references: [id])
  projectId String

  assignee   User?  @relation(fields: [assigneeId], references: [id])
  assigneeId String?

  comments Comment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

model Comment {
  id      String @id @default(cuid())
  content String

  task   Task   @relation(fields: [taskId], references: [id])
  taskId String

  author   User   @relation(fields: [authorId], references: [id])
  authorId String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```typescript
// Service with Prisma client (auto-generated)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TaskService {
  async moveTask(taskId: string, targetStatus: string) {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: targetStatus as TaskStatus },
      include: { assignee: true, comments: { include: { author: true } } },
    });
    return task;
  }

  async getProjectTasks(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: { assignee: true, comments: { include: { author: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
```

---

### Sequelize

**What it is**: Mature Promise-based ORM for Node.js, supports multiple databases.

**Pros**:

- ✅ **Mature**: 10+ years in production, battle-tested
- ✅ **Flexible**: Works with JavaScript and TypeScript
- ✅ **Powerful QueryBuilder**: Complex queries easily expressed
- ✅ **Scopes**: Reusable query fragments (useful for microservice contracts)

**Cons**:

- ❌ **TypeScript support**: Incomplete, requires manual type definitions
- ❌ **Class-based**: Relies on classes for models, decorators not first-class
- ❌ **Verbose**: More boilerplate than Prisma
- ❌ **Modern DX**: Doesn't match Prisma/TypeORM's developer experience
- ❌ **Maintenance**: Slower update cadence

**Not recommended for TypeScript-first Taskify**.

---

### Decision Matrix

| Criterion                | TypeORM     | Prisma            | Sequelize    |
| ------------------------ | ----------- | ----------------- | ------------ |
| **TypeScript support**   | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐        | ⭐⭐⭐       |
| **Schema validation**    | ⚠️ Manual   | ✅ Auto-generated | ⚠️ Manual    |
| **Type safety**          | ⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐        | ⭐⭐⭐       |
| **Bundle size**          | Large (2MB) | Small (500KB)     | Medium (1MB) |
| **Query complexity**     | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐          | ⭐⭐⭐⭐⭐   |
| **Developer experience** | ⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐        | ⭐⭐⭐       |
| **Maintenance**          | ✅ Active   | ✅ Very active    | ⚠️ Moderate  |
| **Learning curve**       | Medium      | Easy              | Hard         |
| **Migrations**           | Built-in    | Built-in          | Built-in     |

---

### **RECOMMENDATION for Taskify**

**→ Use Prisma**

**Rationale**:

1. **TypeScript-first design**: Auto-generated types from schema = zero manual DTO boilerplate. Aligns with Taskify's strict TypeScript requirement.
2. **Schema validation**: Prisma schema is single source of truth. Validates at build time, not runtime.
3. **Microservice contracts**: Schema naturally defines service boundaries (Projects, Tasks, Notifications). Easy to document contracts in `.prisma` files.
4. **Developer experience**: Prisma Studio + CLI migrations make database work frictionless. Critical for iterative feature development.
5. **Bundle size**: 500KB vs 2MB + 1MB = faster cold starts for serverless/containerized deployment.
6. **Zero N+1 problems**: Query resolution prevents accidental performance cliffs (common with TypeORM).
7. **Modern maintenance**: Prisma team is actively innovating (Accelerate, Data Proxy). Long-term viability assured.

**Taskify-Specific Setup**:

```prisma
// schema.prisma - clear service boundaries
model User {
  id String @id @default(cuid())
  name String
  email String @unique
  role UserRole

  // Project Service
  projects Project[]

  // Task Service
  assignedTasks Task[]

  // Notification Service
  comments Comment[]

  @@map("users")
}

// Task Service boundary
model Task {
  id String @id @default(cuid())
  title String
  description String
  status TaskStatus @default(TODO)

  project Project @relation(fields: [projectId], references: [id])
  projectId String

  assignee User? @relation(fields: [assigneeId], references: [id])
  assigneeId String?

  comments Comment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([projectId])
  @@index([assigneeId])
  @@map("tasks")
}
```

---

## 4. State Management for React with Real-Time Updates

### Overview

Taskify needs state management that handles:

- Local optimistic updates (drag-and-drop feedback)
- Remote updates from Socket.IO
- Cache invalidation after mutations
- Synchronization across browser tabs

**Candidates**: React Query (TanStack Query), Zustand, Context API.

### React Query (TanStack Query)

**What it is**: Data synchronization and caching library for async state. Separates server state from client state.

**Pros**:

- ✅ **Built for remote data**: Designed for server-state caching and sync
- ✅ **Optimistic updates**: First-class support for optimistic mutations
- ✅ **Background refetching**: Automatic re-sync without user action
- ✅ **Devtools**: Excellent debugging UI (`@tanstack/react-query-devtools`)
- ✅ **Reduces boilerplate**: No manual action types, reducers
- ✅ **TypeScript**: Strong inference on query/mutation results
- ✅ **Real-time integration**: Cleanly integrates with WebSocket updates via mutation callbacks

**Cons**:

- ❌ **Learning curve**: Different mental model (server state vs client state)
- ❌ **Overkill for local state**: Don't use for UI state (modals, filters, etc.)
- ❌ **Cache invalidation**: Manual invalidation required (or polling)

**Example** (React Query + Socket.IO):

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL);

// Hook: Fetch project tasks with real-time sync
export const useBoardTasks = (projectId: string) => {
  const queryClient = useQueryClient();

  // Fetch from server
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetch(`/api/tasks?projectId=${projectId}`).then(r => r.json()),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  // Listen for real-time updates
  useEffect(() => {
    const handleTaskMoved = (data: { taskId: string; targetStatus: string }) => {
      // Update cache immediately when other user moves task
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) =>
        old?.map(t => t.id === data.taskId ? { ...t, status: data.targetStatus } : t)
      );
    };

    socket.on(`project-${projectId}:task:moved`, handleTaskMoved);
    return () => socket.off(`project-${projectId}:task:moved`, handleTaskMoved);
  }, [projectId, queryClient]);

  return { tasks, isLoading };
};

// Hook: Move task (optimistic + server)
export const useMoveTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, targetStatus }: { taskId: string; targetStatus: string }) =>
      fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: targetStatus }),
      }).then(r => r.json()),

    // Optimistic update
    onMutate: async ({ taskId, targetStatus }) => {
      // Cancel outgoing refetches to prevent conflicts
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      // Snapshot old state
      const previousTasks = queryClient.getQueryData(['tasks', projectId]);

      // Optimistic update
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) =>
        old?.map(t => t.id === taskId ? { ...t, status: targetStatus } : t)
      );

      // Emit to Socket.IO for real-time broadcast
      socket.emit(`project-${projectId}:task:move`, { taskId, targetStatus });

      return { previousTasks };
    },

    // Revert on error
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
    },

    // Refetch after success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
};

// Component: Kanban board
export const Board: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { tasks, isLoading } = useBoardTasks(projectId);
  const { mutate: moveTask } = useMoveTask(projectId);

  if (isLoading) return <div>Loading...</div>;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    moveTask({
      taskId: active.id as string,
      targetStatus: extractColumnId(over.id),
    });
  };

  // Render board with dnd-kit...
};
```

---

### Zustand

**What it is**: Lightweight state management library (~1KB). Minimalist, unopinionated.

**Pros**:

- ✅ **Tiny bundle**: 1KB core, zero dependencies
- ✅ **Simple API**: No boilerplate, simple `useState`-like interface
- ✅ **Middleware**: Plugins for persistence, immer, devtools
- ✅ **TypeScript**: Strong type inference
- ✅ **Flexible**: Works for any state type (server state, UI state, etc.)

**Cons**:

- ❌ **No data fetching**: Doesn't handle async/remote data. Need separate solution.
- ❌ **Manual cache management**: No automatic re-sync or background refetching
- ❌ **Requires discipline**: Easy to create performance issues with improper subscriptions
- ❌ **N+1 subscriptions**: Multiple components = multiple store subscriptions

**Example** (Not ideal for Taskify):

```typescript
import create from "zustand";
import { immer } from "zustand/middleware/immer";

interface BoardStore {
  tasks: Task[];
  updateTask: (id: string, status: string) => void;
  setTasks: (tasks: Task[]) => void;
}

const useBoardStore = create<BoardStore>()(
  immer((set) => ({
    tasks: [],
    updateTask: (id, status) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) task.status = status;
      }),
    setTasks: (tasks) => set({ tasks }),
  })),
);

// Socket.IO listener (must be manual)
socket.on("task:moved", (data) => {
  useBoardStore.setState((state) => {
    const task = state.tasks.find((t) => t.id === data.taskId);
    if (task) task.status = data.targetStatus;
  });
});
```

**Problem for Taskify**: Requires manual HTTP fetching, manual cache invalidation, manual real-time sync. Zustand is too low-level for data synchronization. Better suited for UI state.

---

### Context API + useReducer

**What it is**: Built-in React state management for sharing data down component tree.

**Pros**:

- ✅ **Built-in**: No external dependencies
- ✅ **Simple**: Sufficient for simple state trees

**Cons**:

- ❌ **No caching**: Every render re-evaluates context
- ❌ **Prop drilling**: Multiple nested providers needed
- ❌ **Performance**: All consumers re-render on any state change (unless split carefully)
- ❌ **No devtools**: Manual debugging
- ❌ **Async handling**: Requires custom hooks for data fetching
- ❌ **Real-time sync**: Manual setup for WebSocket integration

**Not recommended for Taskify's complex, real-time state needs**.

---

### Decision Matrix

| Criterion                 | React Query | Zustand  | Context API |
| ------------------------- | ----------- | -------- | ----------- |
| **Remote data sync**      | ⭐⭐⭐⭐⭐  | ⭐⭐     | ⭐          |
| **Optimistic updates**    | ⭐⭐⭐⭐⭐  | ⭐⭐⭐   | ⭐⭐        |
| **Bundle size**           | 40KB        | 1KB      | 0KB         |
| **TypeScript**            | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐ | ⭐⭐⭐      |
| **DevTools**              | ⭐⭐⭐⭐⭐  | ⭐⭐⭐   | ⭐          |
| **Learning curve**        | ⭐⭐⭐      | ⭐⭐     | ⭐          |
| **Caching**               | ⭐⭐⭐⭐⭐  | Manual   | No          |
| **Real-time integration** | ⭐⭐⭐⭐⭐  | ⭐⭐⭐   | ⭐⭐        |

---

### **RECOMMENDATION for Taskify**

**→ Use React Query (TanStack Query) + Zustand**

**Hybrid approach**:

- **React Query**: Server state (tasks, projects, users). Handles fetching, caching, real-time sync from Socket.IO.
- **Zustand**: Client/UI state (open modals, filters, selected column, dark mode toggle).

**Rationale**:

1. **Separation of concerns**: React Query owns remote data; Zustand owns ephemeral UI state.
2. **Real-time + Optimistic**: React Query's mutation callbacks + Socket.IO listeners = clean real-time architecture.
3. **Performance**: Zustand prevents Context API re-render storms; React Query prevents N+1 refetch issues.
4. **DevTools**: React Query's devtools invaluable for debugging cache state.
5. **Minimal boilerplate**: Zustand keeps UI state reducer-free.

**Implementation pattern**:

```typescript
// Server state (React Query)
export const useBoardTasks = (projectId: string) => {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => api.getTasks(projectId),
  });
};

// Mutation with optimistic update + Socket.IO broadcast
export const useMoveTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.moveTask,
    onMutate: async (variables) => {
      // Optimistic
      queryClient.setQueryData(["tasks", projectId], (old) =>
        applyTaskMove(old, variables),
      );
      socket.emit("task:move", variables);
    },
  });
};

// UI state (Zustand)
interface UIStore {
  selectedTaskId: string | null;
  filterStatus: string | null;
  openModal: "create-task" | "assign" | null;
}

const useUIStore = create<UIStore>((set) => ({
  selectedTaskId: null,
  filterStatus: null,
  openModal: null,
}));
```

---

## 5. REST API Design: Projects, Tasks, Notifications

### Overview

Define API contracts for three microservices: **Projects API**, **Tasks API**, **Notifications API**. Focus on clarity, versioning, and validation contracts.

### Core Principles

1. **Versioning**: URL path versioning (`/api/v1/...`) for backward compatibility
2. **Resource-oriented**: Resources are nouns (projects, tasks, comments), HTTP verbs are actions (GET, POST, PATCH, DELETE)
3. **Pagination**: Consistent `limit` + `offset` for list endpoints
4. **Error responses**: Consistent error shape with error codes
5. **Schema validation**: All inputs validated against schema (request body, query params)
6. **Timestamps**: ISO 8601 format with UTC timezone

---

### Projects API

**Scope**: Project management and team membership.

```
POST   /api/v1/projects                 Create project
GET    /api/v1/projects                 List projects
GET    /api/v1/projects/:id             Get project details
PATCH  /api/v1/projects/:id             Update project
DELETE /api/v1/projects/:id             Delete project

POST   /api/v1/projects/:id/team        Add team member
GET    /api/v1/projects/:id/team        List team members
DELETE /api/v1/projects/:id/team/:userId Remove team member
```

**Contracts**:

```typescript
// POST /api/v1/projects - Create project
Request:
{
  "name": "Website Redesign",
  "description": "Redesign company landing page",
  "ownerId": "user-123" // PM creating project
}

Response (201):
{
  "id": "proj-456",
  "name": "Website Redesign",
  "description": "Redesign company landing page",
  "ownerId": "user-123",
  "team": [],
  "taskCount": 0,
  "createdAt": "2026-05-06T10:30:00Z",
  "updatedAt": "2026-05-06T10:30:00Z"
}

// GET /api/v1/projects/:id - Get project with team
Response (200):
{
  "id": "proj-456",
  "name": "Website Redesign",
  "description": "...",
  "ownerId": "user-123",
  "team": [
    {
      "id": "user-123",
      "name": "Alice Chen",
      "email": "alice@company.com",
      "role": "pm",
      "joinedAt": "2026-05-06T10:30:00Z"
    },
    {
      "id": "user-789",
      "name": "Bob Kumar",
      "email": "bob@company.com",
      "role": "engineer",
      "joinedAt": "2026-05-06T11:00:00Z"
    }
  ],
  "taskCount": 5,
  "createdAt": "2026-05-06T10:30:00Z",
  "updatedAt": "2026-05-06T11:00:00Z"
}

// POST /api/v1/projects/:id/team - Add team member
Request:
{
  "userId": "user-789"
}

Response (201):
{
  "id": "user-789",
  "name": "Bob Kumar",
  "email": "bob@company.com",
  "role": "engineer",
  "joinedAt": "2026-05-06T11:05:00Z"
}

// Error responses
Response (400):
{
  "error": "VALIDATION_ERROR",
  "message": "User already member of this project",
  "code": "USER_ALREADY_MEMBER"
}

Response (404):
{
  "error": "NOT_FOUND",
  "message": "Project not found",
  "code": "PROJECT_NOT_FOUND"
}
```

---

### Tasks API

**Scope**: Task lifecycle, assignments, and status transitions.

```
POST   /api/v1/tasks                    Create task
GET    /api/v1/tasks                    List tasks (by project)
GET    /api/v1/tasks/:id                Get task details
PATCH  /api/v1/tasks/:id                Update task (title, description, assignee)
DELETE /api/v1/tasks/:id                Delete task

PATCH  /api/v1/tasks/:id/status         Move task between columns
```

**Contracts**:

```typescript
// POST /api/v1/tasks - Create task
Request:
{
  "projectId": "proj-456",
  "title": "Design homepage mockup",
  "description": "Create Figma mockup for new homepage layout",
  "assigneeId": "user-789" // Optional; can be null (unassigned)
}

Response (201):
{
  "id": "task-001",
  "projectId": "proj-456",
  "title": "Design homepage mockup",
  "description": "Create Figma mockup for new homepage layout",
  "status": "todo", // Default status
  "assignee": {
    "id": "user-789",
    "name": "Bob Kumar",
    "email": "bob@company.com"
  },
  "assigneeId": "user-789",
  "createdBy": "user-123", // Current user
  "commentCount": 0,
  "createdAt": "2026-05-06T10:35:00Z",
  "updatedAt": "2026-05-06T10:35:00Z"
}

// GET /api/v1/tasks?projectId=proj-456&status=in-progress&limit=20&offset=0
Request query parameters:
- projectId: string (required)
- status: 'todo' | 'in-progress' | 'review' | 'done' (optional, filter)
- assigneeId: string (optional, filter)
- limit: number (default: 20, max: 100)
- offset: number (default: 0)

Response (200):
{
  "data": [
    {
      "id": "task-001",
      "projectId": "proj-456",
      "title": "Design homepage mockup",
      "description": "...",
      "status": "in-progress",
      "assignee": { "id": "user-789", "name": "Bob Kumar", "email": "bob@company.com" },
      "commentCount": 3,
      "createdAt": "2026-05-06T10:35:00Z",
      "updatedAt": "2026-05-06T14:20:00Z"
    },
    // ... more tasks
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}

// PATCH /api/v1/tasks/:id - Update task details
Request:
{
  "title": "Design homepage mockup (updated)",
  "assigneeId": "user-456" // Reassign to different user
}

Response (200):
{
  "id": "task-001",
  "projectId": "proj-456",
  "title": "Design homepage mockup (updated)",
  "description": "...",
  "status": "in-progress",
  "assignee": {
    "id": "user-456",
    "name": "Charlie Patel",
    "email": "charlie@company.com"
  },
  "updatedAt": "2026-05-06T15:00:00Z"
}

// PATCH /api/v1/tasks/:id/status - Move task (used by Kanban drag-drop)
Request:
{
  "status": "review" // 'todo' | 'in-progress' | 'review' | 'done'
}

Response (200):
{
  "id": "task-001",
  "projectId": "proj-456",
  "title": "Design homepage mockup",
  "status": "review",
  "updatedAt": "2026-05-06T15:05:00Z"
}

// Validation errors
Response (400 - Assignee not in project):
{
  "error": "VALIDATION_ERROR",
  "message": "Assignee is not a member of this project",
  "code": "ASSIGNEE_NOT_PROJECT_MEMBER",
  "details": {
    "assigneeId": "user-999",
    "projectId": "proj-456"
  }
}

Response (400 - Invalid status):
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid status value",
  "code": "INVALID_STATUS",
  "details": {
    "provided": "completed",
    "allowed": ["todo", "in-progress", "review", "done"]
  }
}
```

---

### Notifications API (Comments)

**Scope**: Task comments for team collaboration.

```
POST   /api/v1/tasks/:taskId/comments       Add comment
GET    /api/v1/tasks/:taskId/comments       List comments
DELETE /api/v1/comments/:id                 Delete comment (author only)
PATCH  /api/v1/comments/:id                 Edit comment (author only)
```

**Contracts**:

```typescript
// POST /api/v1/tasks/:taskId/comments - Add comment
Request:
{
  "content": "I've started the design work. Will have mockups ready by EOD.",
  "authorId": "user-789" // Current user
}

Response (201):
{
  "id": "comment-001",
  "taskId": "task-001",
  "content": "I've started the design work. Will have mockups ready by EOD.",
  "author": {
    "id": "user-789",
    "name": "Bob Kumar",
    "email": "bob@company.com"
  },
  "createdAt": "2026-05-06T14:30:00Z",
  "updatedAt": "2026-05-06T14:30:00Z"
}

// GET /api/v1/tasks/:taskId/comments - List comments (chronological)
Request query:
- limit: number (default: 50, max: 100)
- offset: number (default: 0)

Response (200):
{
  "data": [
    {
      "id": "comment-001",
      "taskId": "task-001",
      "content": "I've started the design work. Will have mockups ready by EOD.",
      "author": {
        "id": "user-789",
        "name": "Bob Kumar",
        "email": "bob@company.com"
      },
      "createdAt": "2026-05-06T14:30:00Z",
      "updatedAt": "2026-05-06T14:30:00Z",
      "canDelete": true, // true if current user is author
      "canEdit": true
    },
    {
      "id": "comment-002",
      "taskId": "task-001",
      "content": "Great! Let's review them in standup tomorrow.",
      "author": {
        "id": "user-123",
        "name": "Alice Chen",
        "email": "alice@company.com"
      },
      "createdAt": "2026-05-06T14:45:00Z",
      "updatedAt": "2026-05-06T14:45:00Z",
      "canDelete": false,
      "canEdit": false
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}

// PATCH /api/v1/comments/:id - Edit comment (author only)
Request:
{
  "content": "Updated comment text"
}

Response (200):
{
  "id": "comment-001",
  "taskId": "task-001",
  "content": "Updated comment text",
  "author": { ... },
  "createdAt": "2026-05-06T14:30:00Z",
  "updatedAt": "2026-05-06T15:10:00Z"
}

// DELETE /api/v1/comments/:id - Delete comment (author only)
Response (204): No content

// Validation errors
Response (400 - Empty comment):
{
  "error": "VALIDATION_ERROR",
  "message": "Comment content cannot be empty",
  "code": "EMPTY_CONTENT"
}

Response (403 - Not author):
{
  "error": "FORBIDDEN",
  "message": "You can only edit/delete your own comments",
  "code": "NOT_COMMENT_AUTHOR"
}

Response (404 - Task not found):
{
  "error": "NOT_FOUND",
  "message": "Task not found",
  "code": "TASK_NOT_FOUND"
}
```

---

### Error Response Schema

**Consistent error format across all endpoints**:

```typescript
Response (4xx/5xx):
{
  "error": "ERROR_TYPE",        // e.g., VALIDATION_ERROR, NOT_FOUND, FORBIDDEN
  "message": "Human readable",  // Client-safe message
  "code": "ERROR_CODE",         // Machine-readable code for client handling
  "details": { ... }            // Optional: Additional context (validation errors, etc.)
}

Example validation error:
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": {
    "title": ["Must be 1-255 characters"],
    "assigneeId": ["Must be a valid UUID"]
  }
}

Example auth error (for future):
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "code": "MISSING_AUTH"
}
```

---

### Versioning Strategy

**API Versioning**:

- Current: `/api/v1/...`
- Headers option (optional): `Accept: application/vnd.taskify.v1+json`
- **Breaking changes** trigger new version
- **Non-breaking changes** (new optional fields, new endpoints) don't require version bump

**Deprecation approach**:

- Add `Deprecation: true` header when endpoint scheduled for removal
- Provide 6-month notice + alternative endpoint
- Document migration path in API docs

---

### Documentation as Code

**OpenAPI 3.0 spec** (`/contracts/openapi.yaml`):

```yaml
openapi: 3.0.0
info:
  title: Taskify API
  version: 1.0.0
  description: Team task management and Kanban board API

servers:
  - url: http://localhost:3000/api/v1
    description: Development
  - url: https://api.taskify.app/api/v1
    description: Production

paths:
  /projects:
    post:
      summary: Create a new project
      tags: [Projects]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateProjectRequest"
      responses:
        "201":
          description: Project created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Project"
        "400":
          $ref: "#/components/responses/ValidationError"

components:
  schemas:
    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          minLength: 1
          maxLength: 255
        description:
          type: string
        team:
          type: array
          items:
            $ref: "#/components/schemas/User"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, name, createdAt, updatedAt]

    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        title:
          type: string
          minLength: 1
          maxLength: 255
        status:
          type: string
          enum: [todo, in-progress, review, done]
        assignee:
          $ref: "#/components/schemas/User"
        createdAt:
          type: string
          format: date-time
```

---

### **RECOMMENDATION for Taskify**

**API Design Decisions**:

1. **Use `/api/v1/` path versioning**: Future-proof for v2 API without breaking existing clients.
2. **Resource-oriented RESTful**: Adheres to industry standard. Easy to auto-generate OpenAPI docs.
3. **Stateless, idempotent**: Enables horizontal scaling of API servers.
4. **Pagination with offset/limit**: Supports large task lists (future scale). Consider cursor pagination later if needed.
5. **ISO 8601 timestamps**: Machine-parseable, timezone-aware (always UTC).
6. **Consistent error shape**: Clients can handle errors predictably; no exception strings.
7. **Schema validation on server**: Use Prisma schema + Zod/Yup for runtime validation.
8. **OpenAPI documentation**: Auto-generate from code (Swagger/redoc). Reduces documentation drift.

**Implementation with Express + Prisma**:

```typescript
// routes/tasks.ts
import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../db";

const router = Router();

// Validation schemas
const CreateTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
});

// Middleware: Validate request body
const validateRequest =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Validation failed",
          code: "VALIDATION_FAILED",
          details: err.flatten().fieldErrors,
        });
      }
      next(err);
    }
  };

// POST /api/v1/tasks
router.post(
  "/",
  validateRequest(CreateTaskSchema),
  async (req: Request, res: Response) => {
    const { projectId, title, description, assigneeId } = req.body;

    try {
      // Verify assignee is project member
      if (assigneeId) {
        const member = await prisma.project.findUnique({
          where: { id: projectId },
          include: { team: { where: { id: assigneeId } } },
        });

        if (!member || member.team.length === 0) {
          return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "Assignee is not a member of this project",
            code: "ASSIGNEE_NOT_PROJECT_MEMBER",
          });
        }
      }

      const task = await prisma.task.create({
        data: {
          projectId,
          title,
          description,
          assigneeId: assigneeId || null,
        },
        include: { assignee: true },
      });

      res.status(201).json(task);
    } catch (err) {
      res
        .status(500)
        .json({
          error: "INTERNAL_SERVER_ERROR",
          message: "Failed to create task",
        });
    }
  },
);

export default router;
```

---

## Summary Table: Key Recommendations

| Category             | Decision              | Rationale                                                                       |
| -------------------- | --------------------- | ------------------------------------------------------------------------------- |
| **Real-time**        | Socket.IO             | Bidirectional, room-based, sub-200ms target, automatic fallback                 |
| **Drag-drop**        | dnd-kit               | TypeScript-first, modern maintenance, lightweight, mobile-ready                 |
| **ORM**              | Prisma                | Auto-generated types, schema as source-of-truth, zero boilerplate, excellent DX |
| **State management** | React Query + Zustand | RQ for server state sync, Zustand for ephemeral UI state                        |
| **API Design**       | REST v1 with OpenAPI  | Scalable, standards-compliant, versioning built-in, auto-documented             |

---

## Next Steps (Phase 1)

1. **Setup**:
   - Initialize backend (Node.js 20, Express, Prisma) in `backend/` folder
   - Initialize frontend (React 18, Vite) in `frontend/` folder
   - Configure Prisma schema from [data-model.md](data-model.md) (to be created)

2. **API Contracts** (create `/contracts/`):
   - `projects-api.md`: Detailed Projects API spec
   - `tasks-api.md`: Detailed Tasks API spec
   - `notifications-api.md`: Comments API spec
   - `openapi.yaml`: Auto-generated from code

3. **Implementation order**:
   - Backend: Database models → API endpoints → Socket.IO handlers
   - Frontend: Component structure → React Query hooks → dnd-kit integration → Socket.IO listeners

4. **Testing**:
   - Unit tests (Jest): Service/business logic
   - Integration tests: API endpoint contracts
   - E2E tests (Playwright): User flows (drag-drop, comments, real-time)

---

**Research completed**: 2026-05-06  
**Recommended for Phase 1 implementation**: See [plan.md](plan.md#project-structure) for next phase deliverables.

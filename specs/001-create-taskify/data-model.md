# Data Model: Taskify

**Version**: 1.0.0  
**Date**: 2026-05-06  
**Based on**: Feature Spec, Research Phase

## Entity Diagram

```
User (predefined, no auth)
├─ id: UUID
├─ name: string
├─ role: enum (product_manager | engineer)
├─ avatar_url: optional string
└─ created_at: timestamp

Project
├─ id: UUID
├─ name: string
├─ description: optional string
├─ created_by: User.id (FK)
├─ team_members: User[] (many-to-many)
├─ created_at: timestamp
└─ updated_at: timestamp

Task
├─ id: UUID
├─ project_id: Project.id (FK)
├─ title: string
├─ description: optional string
├─ assignee_id: optional User.id (FK)
├─ status: enum (to_do | in_progress | in_review | done)
├─ created_by: User.id (FK)
├─ created_at: timestamp
├─ updated_at: timestamp
└─ deleted_at: optional timestamp (soft delete)

Comment
├─ id: UUID
├─ task_id: Task.id (FK)
├─ author_id: User.id (FK)
├─ text: string (min 1 char, max 5000)
├─ created_at: timestamp
├─ updated_at: timestamp
└─ deleted_at: optional timestamp (soft delete)

ProjectMember (join table)
├─ project_id: Project.id (FK)
├─ user_id: User.id (FK)
├─ role: optional enum (admin | member) - future extension
└─ joined_at: timestamp
```

## Prisma Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(255)
  role      UserRole
  avatarUrl String?  @db.VarChar(500)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  createdProjects Project[] @relation("CreatedBy")
  createdTasks    Task[]    @relation("CreatedBy")
  assignedTasks   Task[]    @relation("Assignee")
  comments        Comment[] @relation("Author")
  projectMemberships ProjectMember[]

  @@map("users")
}

enum UserRole {
  PRODUCT_MANAGER
  ENGINEER
}

model Project {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(255)
  description String?  @db.Text
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  createdBy User    @relation("CreatedBy", fields: [createdById], references: [id])
  members   ProjectMember[]
  tasks     Task[]

  @@index([createdById])
  @@map("projects")
}

model ProjectMember {
  projectId String
  userId    String
  role      MemberRole @default(MEMBER)
  joinedAt  DateTime   @default(now())

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([projectId, userId])
  @@index([userId])
  @@map("project_members")
}

enum MemberRole {
  ADMIN
  MEMBER
}

model Task {
  id          String   @id @default(uuid())
  projectId   String
  title       String   @db.VarChar(255)
  description String?  @db.Text
  assigneeId  String?
  status      TaskStatus @default(TO_DO)
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  // Relations
  project  Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee User?      @relation("Assignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  createdBy User      @relation("CreatedBy", fields: [createdById], references: [id])
  comments Comment[]

  @@index([projectId])
  @@index([assigneeId])
  @@index([createdById])
  @@index([status])
  @@map("tasks")
}

enum TaskStatus {
  TO_DO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

model Comment {
  id        String   @id @default(uuid())
  taskId    String
  authorId  String
  text      String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  // Relations
  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author User @relation("Author", fields: [authorId], references: [id])

  @@index([taskId])
  @@index([authorId])
  @@map("comments")
}
```

## Validation Rules

### User

- `name`: Non-empty, 1-255 characters
- `role`: Must be one of: PRODUCT_MANAGER, ENGINEER
- Predefined set: 1 product manager, 4 engineers (immutable for MVP)

### Project

- `name`: Non-empty, 1-255 characters
- `description`: Optional, max 5000 characters
- `createdBy`: Must reference a valid User
- `members`: At least 1 member (creator) required; non-creator members must be added explicitly

### Task

- `title`: Non-empty, 1-255 characters
- `description`: Optional, max 5000 characters
- `assigneeId`: Optional; if provided, assignee MUST be a project member
- `status`: Must be one of: TO_DO, IN_PROGRESS, IN_REVIEW, DONE
- `createdBy`: Must reference a valid User
- Constraint: Assignee MUST be in task's project.members

### Comment

- `text`: Non-empty, 1-5000 characters (no blank submissions)
- `authorId`: Must reference a valid User who is a project member
- `taskId`: Must reference a valid Task
- Edit/Delete: Only the author can modify or delete their comment

## Relationships & Constraints

1. **Project → User (Creator)**: Many projects can be created by one user (not enforced for MVP, but extensible for multi-user scenarios)
2. **ProjectMember (Join Table)**: Explicit many-to-many; enables role-based access in future phases
3. **Task → User (Assignee)**: Optional; assignee validation MUST check project membership
4. **Task → User (Creator)**: Tracks who created the task
5. **Comment → Task**: Cascade delete (delete task → delete all comments)
6. **Soft Deletes**: Tasks and Comments use soft deletes (`deletedAt` timestamp) to preserve audit trail

## Indexing Strategy

- **Projects**: Index on `createdById` for user dashboard queries
- **ProjectMembers**: Index on `userId` for "all projects for user" queries
- **Tasks**: Composite index on `(projectId, status)` for Kanban board queries; index on `assigneeId` for "my tasks" queries
- **Comments**: Index on `taskId` for task detail view; index on `authorId` for user's comments

## Sample Data (for MVP)

### Users (5 predefined)

```
1. Alice Chen (Product Manager)
2. Bob Smith (Engineer)
3. Carol Johnson (Engineer)
4. Dave Wilson (Engineer)
5. Emma Lee (Engineer)
```

### Projects (3 sample)

```
1. "Website Redesign" (team: Alice, Bob, Carol)
2. "Mobile App v2" (team: Alice, Dave, Emma)
3. "API Refactor" (team: Bob, Carol, Dave, Emma)
```

### Tasks & Comments (seeded with examples)

```
Per project: 5-10 sample tasks with various statuses and comments to demo workflow
```

## Future Extensions (Out of Scope for MVP)

- User authentication and authorization
- Workspaces/organizations
- Task labels, priorities, and due dates
- Task attachments and file uploads
- Notifications persistence (database storage)
- Audit logging
- Archive/restore functionality beyond soft deletes

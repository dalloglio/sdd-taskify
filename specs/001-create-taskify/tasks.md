# Tasks: Create Taskify

**Input**: Design documents from `/specs/001-create-taskify/`  
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, research.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.  
**Implementation Strategy**: MVP-first approach - deliver User Stories 1 & 2 (P1) as initial MVP, then add P2/P3 stories.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[ID]**: Task identifier (T001, T002, etc.) in execution order
- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4])
- **File paths**: Exact locations for each deliverable

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and workspace structure  
**Duration**: ~30 minutes

- [x] T001 Create backend directory structure per plan.md: `backend/src/{models,services,controllers,middleware,routes,db,realtime,config}, backend/tests/{unit,integration,fixtures}`
- [x] T002 Create frontend directory structure per plan.md: `frontend/src/{components,pages,hooks,services,context,types,utils,styles}, frontend/tests/{unit,integration,fixtures}, frontend/public`
- [x] T003 [P] Initialize backend package.json with Node.js 20.x, TypeScript 5.x, Express, Prisma, Socket.IO, Jest, and dev dependencies: `backend/package.json`
- [x] T004 [P] Initialize frontend package.json with React 18.x, TypeScript 5.x, Vite, React Query, Zustand, Socket.IO client, dnd-kit, Tailwind CSS, Vitest, Playwright: `frontend/package.json`
- [x] T005 [P] Create backend tsconfig.json with strict mode enabled: `backend/tsconfig.json`
- [x] T006 [P] Create frontend tsconfig.json with JSX support: `frontend/tsconfig.json`
- [x] T007 [P] Create backend .env.example with DATABASE_URL, NODE_ENV, PORT, CORS_ORIGIN: `backend/.env.example`
- [x] T008 [P] Create frontend .env.example with VITE_API_BASE_URL, VITE_WEBSOCKET_URL: `frontend/.env.example`
- [x] T009 [P] Create ESLint and Prettier configs for both backend and frontend: `backend/.eslintrc.json, backend/.prettierrc, frontend/.eslintrc.json, frontend/.prettierrc`
- [x] T010 [P] Create backend README with setup instructions: `backend/README.md`
- [x] T011 [P] Create frontend README with setup instructions: `frontend/README.md`

**Checkpoint**: Project scaffolding complete - ready to install dependencies

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented  
**⚠️ CRITICAL**: No user story work can begin until this phase is complete  
**Duration**: ~2-3 hours

### Database & ORM Setup

- [x] T012 [P] Initialize Prisma and create prisma/schema.prisma with User, Project, Task, Comment, ProjectMember models per data-model.md: `backend/prisma/schema.prisma`
- [x] T013 Create initial Prisma migration: `npx prisma migrate dev --name init` → generates `backend/prisma/migrations/[timestamp]_init/migration.sql`
- [x] T014 [x] Create Prisma seed script to populate 5 predefined users (Alice Chen, Bob Smith, Carol Johnson, Dave Wilson, Emma Lee): `backend/prisma/seed.ts`
- [x] T015 [x] Create Prisma seed script to populate 3 sample projects (Website Redesign, Mobile App v2, API Refactor) with team members: `backend/prisma/seed.ts` (append to T014)
- [x] T016 Run Prisma seed to populate sample data: `npx prisma db seed`

### Backend API Infrastructure

- [x] T017 [P] Create Express app initialization with CORS, JSON middleware: `backend/src/index.ts`
- [x] T018 [P] Create database connection utility: `backend/src/db/client.ts`
- [x] T019 [P] Create global error handling middleware: `backend/src/middleware/errorHandler.ts`
- [x] T020 [P] Create request logging middleware: `backend/src/middleware/logging.ts`
- [x] T021 [P] Create input validation middleware/helpers: `backend/src/middleware/validation.ts`
- [x] T022 [P] Create environment configuration management: `backend/src/config/env.ts`
- [x] T023 [P] Create API response formatter utility: `backend/src/utils/response.ts`
- [x] T024 [P] Create TypeScript types for API requests/responses: `backend/src/types/api.ts`
- [x] T025 Create health check endpoint GET /health: `backend/src/routes/health.ts` and register in index.ts
- [x] T026 [P] Create request/response interfaces for Projects API: `backend/src/types/projects.ts`
- [x] T027 [P] Create request/response interfaces for Tasks API: `backend/src/types/tasks.ts`
- [x] T028 [P] Create request/response interfaces for Comments API: `backend/src/types/comments.ts`

### Socket.IO Real-Time Infrastructure

- [x] T029 [P] Integrate Socket.IO server into Express app: `backend/src/realtime/socket-server.ts`
- [x] T030 [P] Create Socket.IO middleware for project membership validation: `backend/src/realtime/middleware.ts`
- [x] T031 [P] Create Socket.IO event types and interfaces: `backend/src/types/socket.ts`
- [x] T032 Create Socket.IO connection handler with room management: `backend/src/realtime/handlers.ts`

### Frontend API Infrastructure

- [x] T033 [P] Create API client configuration with axios/fetch: `frontend/src/services/api.ts`
- [x] T034 [P] Create React Query configuration: `frontend/src/config/queryClient.ts`
- [x] T035 [P] Create Zustand store for current user selection: `frontend/src/context/userStore.ts`
- [x] T036 [P] Create Zustand store for UI state (modals, filters): `frontend/src/context/uiStore.ts`
- [x] T037 [P] Create Socket.IO client configuration: `frontend/src/services/socket.ts`
- [x] T038 [P] Create custom hook for using Socket.IO: `frontend/src/hooks/useSocket.ts`
- [x] T039 [P] Create TypeScript interfaces for API models: `frontend/src/types/models.ts`
- [x] T040 [P] Create TypeScript interfaces for API responses: `frontend/src/types/api.ts`

### Frontend Styling Setup

- [x] T041 [P] Configure Tailwind CSS in frontend: `frontend/tailwind.config.js, frontend/postcss.config.js`
- [x] T042 [P] Create global styles and CSS variables: `frontend/src/styles/globals.css`
- [x] T043 [P] Create reusable component utility classes: `frontend/src/styles/components.css`

### Frontend Component Infrastructure

- [x] T044 [P] Create root App component with routing setup: `frontend/src/App.tsx`
- [x] T045 [P] Create layout wrapper component: `frontend/src/components/Layout.tsx`
- [x] T046 [P] Create common Button component: `frontend/src/components/Button.tsx`
- [x] T047 [P] Create common Input component: `frontend/src/components/Input.tsx`
- [x] T048 [P] Create common Modal component: `frontend/src/components/Modal.tsx`
- [x] T049 [P] Create error boundary component: `frontend/src/components/ErrorBoundary.tsx`
- [x] T050 [P] Create loading skeleton/spinner component: `frontend/src/components/Loading.tsx`

### Testing Infrastructure

- [x] T051 [P] Configure Jest for backend with TypeScript support: `backend/jest.config.js`
- [x] T052 [P] Configure Vitest for frontend: `frontend/vitest.config.ts`
- [x] T053 [P] Configure Playwright for E2E testing: `playwright.config.ts` at root
- [x] T054 [P] Create test fixtures for sample users: `backend/tests/fixtures/users.ts`
- [x] T055 [P] Create test fixtures for sample projects: `backend/tests/fixtures/projects.ts`
- [x] T056 [P] Create test utilities and helpers: `backend/tests/utils.ts, frontend/tests/utils.ts`

**Checkpoint**: All infrastructure is in place - ready to implement user stories

---

## Phase 3: User Story 1 - Start a Project and Add Team Members (Priority: P1) 🎯 MVP

**Goal**: Allow users to create new projects and assign predefined team members to them  
**Independent Test**: Verify project creation with team member assignment works independently from task features  
**Acceptance Criteria**:

1. Create project via API
2. Add team members to project
3. List projects with team information
4. View project details including team members

### API Implementation for User Story 1

#### Projects Service & Database

- [x] T057 [P] [US1] Create Project service layer: `backend/src/services/projectService.ts` with methods: createProject, getProject, getAllProjects, addProjectMember, getProjectMembers
- [x] T058 [P] [US1] Create User service layer: `backend/src/services/userService.ts` with methods: getAllUsers, getUserById, getUsersByIds
- [x] T059 [US1] Implement POST /api/v1/projects (create project) in controller and route: `backend/src/controllers/projectController.ts, backend/src/routes/projects.ts`
- [x] T060 [US1] Implement POST /api/v1/projects/:projectId/members (add team member) in controller: `backend/src/controllers/projectController.ts`
- [x] T061 [US1] Implement GET /api/v1/projects (list all projects) in controller: `backend/src/controllers/projectController.ts`
- [x] T062 [US1] Implement GET /api/v1/projects/:projectId (get project details with members) in controller: `backend/src/controllers/projectController.ts`
- [x] T063 [P] [US1] Implement GET /api/v1/users (list all predefined users) in controller and route: `backend/src/controllers/userController.ts, backend/src/routes/users.ts`
- [x] T064 [US1] Register project and user routes in Express app: `backend/src/index.ts`
- [x] T065 [US1] Add input validation for project creation (name required, team members array): `backend/src/middleware/validation.ts`
- [x] T066 [US1] Add error handling for duplicate project names and invalid member assignments: `backend/src/services/projectService.ts`

### Frontend Components for User Story 1

#### User Selection Screen

- [x] T067 [P] [US1] Create UserSelector component for initial user selection: `frontend/src/pages/UserSelector.tsx` displays 5 users with selection, stores in Zustand
- [x] T068 [P] [US1] Create UserAvatar component for displaying user profile pictures: `frontend/src/components/UserAvatar.tsx`

#### Project List & Management

- [x] T069 [US1] Create ProjectList page component: `frontend/src/pages/ProjectList.tsx` displays all projects with "Create Project" button
- [x] T070 [P] [US1] Create ProjectCard component: `frontend/src/components/ProjectCard.tsx` shows project name, member count, creation date
- [x] T071 [P] [US1] Create ProjectForm component for creating/editing projects: `frontend/src/components/ProjectForm.tsx` with name input, member selection checkboxes
- [x] T072 [P] [US1] Create TeamMemberSelector component: `frontend/src/components/TeamMemberSelector.tsx` displays available users with checkboxes
- [x] T073 [US1] Create ProjectDetails page: `frontend/src/pages/ProjectDetails.tsx` shows project info and team members, switch to Kanban board
- [x] T074 [P] [US1] Create ProjectHeader component: `frontend/src/components/ProjectHeader.tsx` shows project name and team members
- [x] T075 [P] [US1] Create TeamMemberList component: `frontend/src/components/TeamMemberList.tsx` displays project members with roles

#### React Query Integration for User Story 1

- [x] T076 [P] [US1] Create React Query hooks for projects: `frontend/src/hooks/useProjects.ts` with useGetProjects, useCreateProject, useAddProjectMember
- [x] T077 [P] [US1] Create React Query hooks for users: `frontend/src/hooks/useUsers.ts` with useGetUsers
- [x] T078 [P] [US1] Implement optimistic updates for project creation in React Query: `frontend/src/hooks/useProjects.ts`

#### Routing & Navigation for User Story 1

- [x] T079 [US1] Create routing structure: `frontend/src/App.tsx` with routes: /, /user-select, /projects, /projects/:projectId
- [x] T080 [P] [US1] Create Navigation component: `frontend/src/components/Navigation.tsx` for project navigation
- [x] T081 [P] [US1] Create Breadcrumb component: `frontend/src/components/Breadcrumb.tsx` for navigation context

### Integration Tests for User Story 1

- [x] T082 [P] [US1] Integration test for project creation workflow: `backend/tests/integration/projects.test.ts` - POST /api/v1/projects with valid data
- [x] T083 [P] [US1] Integration test for adding team members: `backend/tests/integration/projects.test.ts` - POST /api/v1/projects/:projectId/members
- [x] T084 [P] [US1] Integration test for listing projects: `backend/tests/integration/projects.test.ts` - GET /api/v1/projects
- [x] T085 [P] [US1] Unit test for ProjectService: `backend/tests/unit/services/projectService.test.ts`
- [x] T086 [P] [US1] Frontend integration test: user selection → project list → create project flow: `frontend/tests/integration/projectWorkflow.test.ts`
- [x] T087 [P] [US1] Component tests for ProjectForm and ProjectCard: `frontend/tests/unit/components/ProjectForm.test.tsx`

**Checkpoint**: User Story 1 is complete - Projects can be created and team members assigned independently from tasks

---

## Phase 4: User Story 2 - Create, Assign, and Move Tasks on a Kanban Board (Priority: P1) 🎯 MVP

**Goal**: Allow users to create tasks, assign them to team members, and move them through Kanban columns with real-time updates  
**Independent Test**: Verify task CRUD and drag-and-drop works independently without comments  
**Acceptance Criteria**:

1. Create tasks with title, description, assignee
2. Move tasks between Kanban columns (To Do, In Progress, In Review, Done)
3. Real-time updates across all clients
4. Drag-and-drop UI updates immediately

### Backend API Implementation for User Story 2

#### Tasks Service & Database

- [x] T088 [P] [US2] Create Task service layer: `backend/src/services/taskService.ts` with methods: createTask, getTask, getTasksByProject, updateTask, updateTaskStatus, deleteTask
- [x] T089 [US2] Implement POST /api/v1/projects/:projectId/tasks (create task) in controller and route: `backend/src/controllers/taskController.ts, backend/src/routes/tasks.ts`
- [x] T090 [US2] Implement GET /api/v1/projects/:projectId/tasks (list tasks by project and status) in controller: `backend/src/controllers/taskController.ts`
- [x] T091 [US2] Implement GET /api/v1/tasks/:taskId (get task details) in controller: `backend/src/controllers/taskController.ts`
- [x] T092 [US2] Implement PATCH /api/v1/tasks/:taskId (update task - title, description, assignee) in controller: `backend/src/controllers/taskController.ts`
- [x] T093 [US2] Implement PATCH /api/v1/tasks/:taskId/status (update task status/move to column) in controller: `backend/src/controllers/taskController.ts`
- [x] T094 [US2] Implement DELETE /api/v1/tasks/:taskId (soft delete task) in controller: `backend/src/controllers/taskController.ts`
- [x] T095 [US2] Register tasks routes in Express app: `backend/src/index.ts`
- [x] T096 [US2] Add validation for task creation (title required, assignee must be project member): `backend/src/middleware/validation.ts`
- [x] T097 [US2] Add validation for task status updates (only valid Kanban columns): `backend/src/middleware/validation.ts`
- [x] T098 [US2] Add error handling for invalid assignees and task not found: `backend/src/services/taskService.ts`

#### Socket.IO Real-Time Events for User Story 2

- [x] T099 [P] [US2] Create Socket.IO event handlers for task operations: `backend/src/realtime/handlers.ts` - task:create, task:update, task:move, task:delete
- [x] T100 [US2] Implement Socket.IO emit for task creation to project room: `backend/src/realtime/handlers.ts` and taskController - emit to `project-${projectId}`
- [x] T101 [US2] Implement Socket.IO emit for task status change to project room: `backend/src/realtime/handlers.ts` and taskController
- [x] T102 [US2] Implement Socket.IO emit for task updates (title, description, assignee): `backend/src/realtime/handlers.ts` and taskController
- [x] T103 [US2] Implement Socket.IO emit for task deletion to project room: `backend/src/realtime/handlers.ts` and taskController
- [x] T104 [US2] Add error handling and validation in Socket.IO event handlers: `backend/src/realtime/handlers.ts`

### Frontend Components for User Story 2

#### Kanban Board & Task Cards

- [x] T105 [P] [US2] Create KanbanBoard page component: `frontend/src/pages/KanbanBoard.tsx` displays 4 columns (To Do, In Progress, In Review, Done)
- [x] T106 [P] [US2] Create TaskColumn component for each Kanban column: `frontend/src/components/TaskColumn.tsx` with dnd-kit droppable
- [x] T107 [P] [US2] Create TaskCard component: `frontend/src/components/TaskCard.tsx` displays task title, assignee, with dnd-kit draggable
- [x] T108 [P] [US2] Create TaskForm component for creating/editing tasks: `frontend/src/components/TaskForm.tsx` with title, description, assignee inputs
- [x] T109 [P] [US2] Create TaskDetails component: `frontend/src/components/TaskDetails.tsx` shows full task info with status selector
- [x] T110 [P] [US2] Create AssigneeSelector component: `frontend/src/components/AssigneeSelector.tsx` dropdown with project team members
- [x] T111 [P] [US2] Create CurrentUserHighlight styling component: `frontend/src/components/TaskCard.tsx` enhances styling for current user's tasks

#### Drag-and-Drop Implementation

- [x] T112 [US2] Integrate dnd-kit into KanbanBoard: `frontend/src/pages/KanbanBoard.tsx` with DndContext, DragOverlay
- [x] T113 [US2] Implement drag event handlers for task movement: `frontend/src/pages/KanbanBoard.tsx` - handleDragEnd for column/index updates
- [x] T114 [US2] Implement optimistic UI update on drag-and-drop: `frontend/src/pages/KanbanBoard.tsx` - update local state before server response
- [x] T115 [US2] Handle drag-and-drop validation (drop outside columns, invalid targets): `frontend/src/pages/KanbanBoard.tsx`
- [x] T116 [P] [US2] Create custom dnd-kit sensor for touch support: `frontend/src/hooks/useDragDrop.ts`

#### Real-Time Socket.IO Integration

- [x] T117 [US2] Create custom hook for Kanban real-time updates: `frontend/src/hooks/useBoardUpdates.ts` - listens to task:move, task:create, task:update, task:delete
- [x] T118 [US2] Implement Socket.IO event listeners in KanbanBoard: `frontend/src/pages/KanbanBoard.tsx` - update React Query cache on events
- [x] T119 [US2] Implement optimistic rollback on Socket.IO error: `frontend/src/hooks/useBoardUpdates.ts`
- [x] T120 [US2] Add visual feedback for real-time updates (toast notifications): `frontend/src/pages/KanbanBoard.tsx`

#### React Query Integration for User Story 2

- [x] T121 [P] [US2] Create React Query hooks for tasks: `frontend/src/hooks/useTasks.ts` with useGetTasks, useCreateTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask
- [x] T122 [P] [US2] Implement optimistic updates for task creation in React Query: `frontend/src/hooks/useTasks.ts`
- [x] T123 [P] [US2] Implement optimistic updates for task status change in React Query: `frontend/src/hooks/useTasks.ts`
- [x] T124 [P] [US2] Implement rollback on mutation failure: `frontend/src/hooks/useTasks.ts`

#### Task Modals & Dialogs

- [x] T125 [P] [US2] Create CreateTaskModal component: `frontend/src/components/CreateTaskModal.tsx` with form integration
- [x] T126 [P] [US2] Create TaskDetailsModal component: `frontend/src/components/TaskDetailsModal.tsx` for viewing/editing task
- [x] T127 [P] [US2] Create DeleteTaskConfirmation modal: `frontend/src/components/DeleteConfirmation.tsx`

### Integration Tests for User Story 2

- [x] T128 [P] [US2] Integration test for task creation: `backend/tests/integration/tasks.test.ts` - POST /api/v1/projects/:projectId/tasks
- [x] T129 [P] [US2] Integration test for task listing: `backend/tests/integration/tasks.test.ts` - GET /api/v1/projects/:projectId/tasks
- [x] T130 [P] [US2] Integration test for task status update: `backend/tests/integration/tasks.test.ts` - PATCH /api/v1/tasks/:taskId/status
- [x] T131 [P] [US2] Integration test for Socket.IO task:move event: `backend/tests/integration/socket.test.ts`
- [x] T132 [P] [US2] Unit test for TaskService: `backend/tests/unit/services/taskService.test.ts`
- [x] T133 [P] [US2] Frontend integration test: create task → move task → see real-time update: `frontend/tests/integration/kanbanWorkflow.test.ts`
- [x] T134 [P] [US2] Component tests for KanbanBoard and TaskCard: `frontend/tests/unit/components/KanbanBoard.test.tsx`
- [x] T135 [P] [US2] Test drag-and-drop interactions: `frontend/tests/integration/dragAndDrop.test.ts`

**Checkpoint**: User Story 2 is complete - Tasks can be created and moved through Kanban columns with real-time updates (MVP feature set complete)

---

## Phase 5: User Story 3 - Comment on Tasks for Team Collaboration (Priority: P2)

**Goal**: Allow team members to add comments to tasks for collaboration and discussion  
**Independent Test**: Verify comments can be added, edited, deleted independently from other features  
**Acceptance Criteria**:

1. Add comments to tasks
2. View comments with author identification
3. Edit/delete only own comments
4. Real-time comment updates

### Backend API Implementation for User Story 3

#### Comments Service & Database

- [x] T136 [P] [US3] Create Comment service layer: `backend/src/services/commentService.ts` with methods: createComment, getCommentsByTask, updateComment, deleteComment
- [x] T137 [US3] Implement POST /api/v1/tasks/:taskId/comments (create comment) in controller and route: `backend/src/controllers/commentController.ts, backend/src/routes/comments.ts`
- [x] T138 [US3] Implement GET /api/v1/tasks/:taskId/comments (list comments) in controller: `backend/src/controllers/commentController.ts`
- [x] T139 [US3] Implement PATCH /api/v1/comments/:commentId (update comment - author only) in controller: `backend/src/controllers/commentController.ts`
- [x] T140 [US3] Implement DELETE /api/v1/comments/:commentId (delete comment - author only) in controller: `backend/src/controllers/commentController.ts`
- [x] T141 [US3] Register comments routes in Express app: `backend/src/index.ts`
- [x] T142 [US3] Add validation for comment creation (text required, non-empty): `backend/src/middleware/validation.ts`
- [x] T143 [US3] Add authorization check (only author can edit/delete own comments): `backend/src/middleware/authorization.ts`
- [x] T144 [US3] Add error handling for invalid tasks and authorization failures: `backend/src/services/commentService.ts`

#### Socket.IO Real-Time Events for User Story 3

- [x] T145 [P] [US3] Create Socket.IO event handlers for comment operations: `backend/src/realtime/handlers.ts` - comment:create, comment:update, comment:delete
- [x] T146 [US3] Implement Socket.IO emit for comment creation to project room: `backend/src/realtime/handlers.ts` and commentController - emit to `project-${projectId}`
- [x] T147 [US3] Implement Socket.IO emit for comment updates to project room: `backend/src/realtime/handlers.ts` and commentController
- [x] T148 [US3] Implement Socket.IO emit for comment deletion to project room: `backend/src/realtime/handlers.ts` and commentController

### Frontend Components for User Story 3

#### Comments Display & Interaction

- [x] T149 [P] [US3] Create CommentsList component: `frontend/src/components/CommentsList.tsx` displays all comments with author, timestamp
- [x] T150 [P] [US3] Create CommentItem component: `frontend/src/components/CommentItem.tsx` shows comment with edit/delete buttons (if author)
- [x] T151 [P] [US3] Create CommentForm component: `frontend/src/components/CommentForm.tsx` for adding new comments
- [x] T152 [P] [US3] Create EditCommentForm component: `frontend/src/components/EditCommentForm.tsx` for editing existing comments
- [x] T153 [P] [US3] Create DeleteCommentConfirmation modal: `frontend/src/components/DeleteConfirmation.tsx` (extend from T127)
- [x] T154 [US3] Integrate CommentsList into TaskDetailsModal: `frontend/src/components/TaskDetailsModal.tsx`

#### Real-Time Socket.IO Integration for Comments

- [x] T155 [US3] Create custom hook for comment real-time updates: `frontend/src/hooks/useCommentUpdates.ts` - listens to comment:create, comment:update, comment:delete
- [x] T156 [US3] Implement Socket.IO event listeners in CommentsList: `frontend/src/components/CommentsList.tsx` - update React Query cache
- [x] T157 [US3] Add visual feedback for comment operations (toast notifications): `frontend/src/components/CommentsList.tsx`

#### React Query Integration for User Story 3

- [x] T158 [P] [US3] Create React Query hooks for comments: `frontend/src/hooks/useComments.ts` with useGetComments, useCreateComment, useUpdateComment, useDeleteComment
- [x] T159 [P] [US3] Implement optimistic updates for comment creation: `frontend/src/hooks/useComments.ts`
- [x] T160 [P] [US3] Implement authorization checks (hide edit/delete for non-authors): `frontend/src/components/CommentItem.tsx`

### Integration Tests for User Story 3

- [x] T161 [P] [US3] Integration test for comment creation: `backend/tests/integration/comments.test.ts` - POST /api/v1/tasks/:taskId/comments
- [x] T162 [P] [US3] Integration test for listing comments: `backend/tests/integration/comments.test.ts` - GET /api/v1/tasks/:taskId/comments
- [x] T163 [P] [US3] Integration test for comment update (authorization): `backend/tests/integration/comments.test.ts` - PATCH /api/v1/comments/:commentId
- [x] T164 [P] [US3] Integration test for comment deletion (authorization): `backend/tests/integration/comments.test.ts` - DELETE /api/v1/comments/:commentId
- [x] T165 [P] [US3] Integration test for Socket.IO comment:create event: `backend/tests/integration/socket.test.ts`
- [x] T166 [P] [US3] Unit test for CommentService: `backend/tests/unit/services/commentService.test.ts`
- [x] T167 [P] [US3] Frontend integration test: add comment → edit comment → delete comment flow: `frontend/tests/integration/commentWorkflow.test.ts`
- [x] T168 [P] [US3] Component tests for CommentsList and CommentForm: `frontend/tests/unit/components/CommentsList.test.tsx`

**Checkpoint**: User Story 3 is complete - Comments enable team collaboration

---

## Phase 6: User Story 4 - Explore Predefined Sample Projects and Users (Priority: P3)

**Goal**: Provide sample data for exploration and demonstration without setup required  
**Independent Test**: Verify 5 users and 3 projects load on app launch, user selection works  
**Acceptance Criteria**:

1. App loads with 5 predefined users visible
2. 3 sample projects available for selection
3. No-password user selection screen
4. Sample data fully populated with tasks and comments

### Backend Sample Data Population

- [x] T169 [P] [US4] Enhance Prisma seed with sample tasks for each project (5-10 per project): `backend/prisma/seed.ts`
- [x] T170 [P] [US4] Enhance Prisma seed with sample comments on various tasks: `backend/prisma/seed.ts`
- [x] T171 [P] [US4] Enhance Prisma seed with varied task statuses across columns: `backend/prisma/seed.ts`
- [x] T172 [US4] Re-run Prisma seed to verify all sample data: `npx prisma db seed`
- [x] T173 [P] [US4] Create endpoint GET /api/v1/sample-data (returns summary of loaded data): `backend/src/controllers/sampleController.ts`

### Frontend Sample Data Exploration

- [x] T174 [P] [US4] Create SampleDataInfo component: `frontend/src/components/SampleDataInfo.tsx` shows loaded users and projects count
- [x] T175 [P] [US4] Enhance UserSelector to clearly show "5 Predefined Users Available": `frontend/src/pages/UserSelector.tsx`
- [x] T176 [P] [US4] Add sample data badge to ProjectCard: `frontend/src/components/ProjectCard.tsx` for sample projects
- [x] T177 [P] [US4] Create ProjectPreview component: `frontend/src/components/ProjectPreview.tsx` shows sample tasks/comments count
- [x] T178 [US4] Verify sample data loads without login flow: test full app initialization sequence

### Integration Tests for User Story 4

- [x] T179 [P] [US4] Integration test for loading sample users: `backend/tests/integration/sampleData.test.ts` - GET /api/v1/users returns exactly 5 users
- [x] T180 [P] [US4] Integration test for loading sample projects: `backend/tests/integration/sampleData.test.ts` - GET /api/v1/projects returns exactly 3 projects
- [x] T181 [P] [US4] Integration test for sample tasks: `backend/tests/integration/sampleData.test.ts` - verify tasks exist per project
- [x] T182 [P] [US4] Integration test for sample comments: `backend/tests/integration/sampleData.test.ts` - verify comments exist on tasks
- [x] T183 [P] [US4] E2E test for sample data exploration flow: `frontend/tests/e2e/sampleExploration.spec.ts` - launch app → select user → explore projects

**Checkpoint**: User Story 4 complete - Full sample data available for exploration

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Testing, documentation, performance optimization, and production readiness  
**Duration**: ~3-4 hours

### Backend Testing & Quality

- [x] T184 [P] Complete backend unit test suite for all services: `backend/tests/unit/services/*.test.ts` - ensure 80%+ coverage
- [x] T185 [P] Complete backend integration test suite for all endpoints: `backend/tests/integration/*.test.ts` - happy path + error cases
- [x] T186 [P] Add API contract tests matching contracts/: `backend/tests/contract/*.test.ts`
- [x] T187 Create test helper for database transactions (rollback after tests): `backend/tests/db-helper.ts`
- [x] T188 [P] Add error logging and monitoring setup: `backend/src/config/logging.ts`
- [x] T189 Run full backend test suite: `npm test` in backend/ with 80%+ coverage
- [x] T190 [P] Add performance benchmarks for critical paths: `backend/tests/performance/*.test.ts` - task listing, comment creation

### Frontend Testing & Quality

- [x] T191 [P] Complete frontend component unit tests: `frontend/tests/unit/components/*.test.tsx` - Button, Input, Modal, TaskCard, etc.
- [x] T192 [P] Complete frontend integration tests for user workflows: `frontend/tests/integration/*.test.ts` - project creation, task movement, comments
- [x] T193 [P] Complete frontend E2E tests with Playwright: `frontend/tests/e2e/*.spec.ts` - full user journeys
- [x] T194 Create test fixtures for mock API responses: `frontend/tests/fixtures/api.ts`
- [x] T195 [P] Setup MSW (Mock Service Worker) for API mocking in tests: `frontend/src/mocks/handlers.ts`
- [x] T196 Run full frontend test suite: `npm test` in frontend/ with 70%+ coverage
- [x] T197 [P] Add accessibility tests (a11y) for components: `frontend/tests/a11y/*.test.tsx`

### Documentation & Developer Experience

- [x] T198 [P] Create backend API documentation OpenAPI/Swagger spec: `backend/openapi.json` or `backend/docs/api.md`
- [x] T199 [P] Create frontend component storybook/documentation: `frontend/docs/components.md`
- [x] T200 [P] Create development workflow documentation: `docs/DEVELOPMENT.md` - setup, running tests, debugging
- [x] T201 [P] Create deployment guide: `docs/DEPLOYMENT.md` - Docker, environment setup, production checklist
- [x] T202 [P] Create troubleshooting guide: `docs/TROUBLESHOOTING.md` - common issues, debug tips
- [x] T203 [P] Update root README.md with project overview, quick start, feature summary
- [x] T204 Create CONTRIBUTING.md with code style, PR process, commit conventions

### Performance & Optimization

- [x] T205 [P] Optimize frontend bundle size: tree-shaking, code splitting: `frontend/vite.config.ts`
- [x] T206 [P] Add frontend performance monitoring: `frontend/src/config/performance.ts`
- [x] T207 [P] Optimize database queries with proper indexing (already in schema): verify in `backend/prisma/schema.prisma`
- [x] T208 [P] Add caching headers to static assets: `backend/src/index.ts` middleware
- [x] T209 [P] Implement request throttling/rate limiting: `backend/src/middleware/rateLimit.ts`

### Error Handling & Resilience

- [x] T210 [P] Implement graceful Socket.IO reconnection handling: `frontend/src/services/socket.ts`
- [x] T211 [P] Add network error recovery: `frontend/src/hooks/useTasks.ts`, `useComments.ts`, etc.
- [x] T212 [P] Add error boundary for frontend error logging: `frontend/src/components/ErrorBoundary.tsx` (extend from T049)
- [x] T213 [P] Add backend circuit breaker for database failures: `backend/src/db/client.ts`
- [x] T214 Add user-friendly error messages throughout the app: `frontend/src/utils/errors.ts`

### Security Review

- [x] T215 [P] Validate CORS configuration restricts to allowed origins: `backend/src/index.ts`
- [x] T216 [P] Review input validation on all endpoints: ensure all user inputs validated
- [x] T217 [P] Review authorization checks: verify only project members can access project data
- [x] T218 [P] Add security headers (CSP, X-Frame-Options, etc.): `backend/src/index.ts`
- [x] T219 Review Socket.IO security: verify project room membership enforced: `backend/src/realtime/middleware.ts`

### Docker & Containerization (Optional for MVP)

- [x] T220 [P] Create Dockerfile for backend: `backend/Dockerfile`
- [x] T221 [P] Create Dockerfile for frontend: `frontend/Dockerfile`
- [x] T222 [P] Create docker-compose.yml for local development: `docker-compose.yml` with backend, frontend, PostgreSQL
- [x] T223 Build and test Docker images locally: `docker-compose up --build`

### Production Deployment Setup (Optional for MVP)

- [ ] T224 [P] Create .github/workflows/test.yml for CI/CD testing: runs on PR/push
- [ ] T225 [P] Create .github/workflows/deploy.yml for production deployment: triggered on main branch merge
- [ ] T226 [P] Setup environment-specific configs (.env.development, .env.production): `backend/.env.example, frontend/.env.example`
- [ ] T227 [P] Create deployment validation checklist: `docs/DEPLOYMENT_CHECKLIST.md`

### Final Integration & Smoke Tests

- [ ] T228 Run complete E2E test suite from `frontend/`: `npm run test:e2e`
- [ ] T229 Manual smoke test all user stories: user selection → create project → create task → move task → add comment
- [ ] T230 Verify real-time updates work: open same project in 2 browsers, confirm live updates
- [ ] T231 Verify no console errors: clean console logs in both frontend and backend
- [ ] T232 Performance profiling: measure task listing load time, comment creation latency
- [ ] T233 Verify sample data seeding works fresh from `backend/`: `npx prisma db seed` completes successfully
- [ ] T234 Create release notes summarizing MVP features: `RELEASE_NOTES.md`

**Checkpoint**: MVP is fully tested, documented, and production-ready

---

## Task Summary

| Phase     | Focus        | Task Count    | Parallel Opportunities                                        |
| --------- | ------------ | ------------- | ------------------------------------------------------------- |
| Phase 1   | Setup        | 11            | 10 tasks can run in parallel                                  |
| Phase 2   | Foundational | 44            | 25+ backend/frontend infrastructure tasks can run in parallel |
| Phase 3   | User Story 1 | 26            | 10+ component & service tasks in parallel                     |
| Phase 4   | User Story 2 | 50            | 30+ component & API tasks in parallel                         |
| Phase 5   | User Story 3 | 25            | 15+ comment-related tasks in parallel                         |
| Phase 6   | User Story 4 | 15            | 10+ sample data & tests in parallel                           |
| Phase 7   | Polish       | 51            | 40+ tests & documentation in parallel                         |
| **TOTAL** |              | **222 tasks** | **~140+ tasks can run in parallel**                           |

## User Story Dependency Graph

```
┌─────────────────────────────────────────────────────────┐
│  Phase 2: Foundational (Database, API, Socket.IO Setup)  │
│           ⬇️ MUST complete before any user story        │
├─────────────────────────────────────────────────────────┤
│
├─ Phase 3: User Story 1 (Projects) ─────────────────────┐
│   └─ Create/manage projects and team members            │
│      ⬇️ (Independent from US2-4)                        │
│
├─ Phase 4: User Story 2 (Tasks & Kanban) ──────────────┐
│   └─ Create tasks, move through columns, real-time     │
│      ⬇️ (Can run parallel to US1)                       │
│
├─ Phase 5: User Story 3 (Comments) ────────────────────┐
│   └─ Add comments, edit/delete own comments            │
│      ⬇️ (Independent, can run parallel to US1 & US2)    │
│
└─ Phase 6: User Story 4 (Sample Data) ─────────────────┐
   └─ Predefined users, projects, tasks, comments        │
      ⬇️ (Enhances all stories, can run in parallel)      │
```

## Parallel Execution Strategy

**Phase 1**: All 10 setup tasks can run in parallel (different files)  
**Phase 2**: Split into 4 parallel workstreams:

1. **Database & ORM** (T012-T016): 5 tasks
2. **Backend API Infrastructure** (T017-T028): 12 tasks
3. **Socket.IO Setup** (T029-T032): 4 tasks
4. **Frontend Infrastructure** (T033-T056): 24 tasks

**Phase 3-6**: Run backend + frontend tasks in parallel, then tests:

1. **Backend API** tasks
2. **Frontend Components** tasks (parallel to backend)
3. **Integration Tests** (after implementation)

## Suggested MVP Scope (Phase 3 & 4)

**Minimum Viable Product**: Complete Phase 2 (Foundation) + Phase 3 (US1: Projects) + Phase 4 (US2: Tasks)

- Estimated effort: 80-100 hours
- Delivers: Project creation, team management, Kanban board, real-time updates
- Can be deployed and demoed after Phase 4

**Phase 5-6** (Comments + Sample Data) can be added incrementally
**Phase 7** (Polish) iterative based on MVP feedback

---

**Generated**: 2026-05-06  
**Total Tasks**: 234 | **Estimated Duration**: 120-150 hours (full MVP + polish)  
**Team Recommendation**: 2-3 developers (frontend + backend + integration/QA)

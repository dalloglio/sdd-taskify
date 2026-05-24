# Frontend Components

Taskify uses React 18, TypeScript, React Query, Zustand, Tailwind CSS, Socket.IO client, and dnd-kit. Components are organized by reusable UI, workflow pages, and feature hooks.

## Pages

### `UserSelector`

Launch screen for the no-password current-user flow. It displays the five predefined users, stores the selected user in Zustand, and sends the user to the project list.

### `ProjectList`

Displays all projects, sample data summary, and project creation entry points.

### `ProjectDetails`

Shows project metadata, team members, and navigation toward the board experience.

### `KanbanBoard`

Main task workspace. It renders the four required columns in order: To Do, In Progress, In Review, Done. It owns drag-and-drop orchestration, task modals, optimistic movement, and realtime update subscriptions.

## Shared UI

### `Button`

Primary command control. Use for form submission, modal actions, and high-value page commands.

### `Input`

Shared text input wrapper for forms.

### `Modal`

Reusable modal frame used by task and delete flows.

### `Loading`

Loading state primitives for data-fetching views.

### `ErrorBoundary`

Runtime failure boundary for preserving a usable shell when a component throws.

## Project Components

### `ProjectCard`

Project summary card with name, member count, creation date, and sample badge when applicable.

### `ProjectForm`

Create/edit project form with project name and member selection.

### `ProjectHeader`

Board-level project identity and team summary.

### `TeamMemberSelector`

Checkbox selection control for available predefined users.

### `TeamMemberList`

Read-only member display with roles.

### `ProjectPreview`

Compact sample-project preview with task and comment counts.

### `SampleDataInfo`

Demo workspace summary for predefined users and projects.

## Task Components

### `TaskColumn`

dnd-kit droppable column. It displays a status header, task count, empty state, and task cards.

### `TaskCard`

dnd-kit draggable task summary. Cards show title, description, assignee, status, unassigned state, and current-user highlighting.

### `TaskForm`

Create/edit form for title, description, assignee, and status.

### `CreateTaskModal`

Modal wrapper around `TaskForm` for new tasks.

### `TaskDetails`

Full task details view with status and assignment controls.

### `TaskDetailsModal`

Task details modal with comments integrated.

### `AssigneeSelector`

Project-member selector for task assignment.

### `DeleteConfirmation`

Reusable confirmation modal for destructive task and comment operations.

## Comment Components

### `CommentsList`

Fetches and renders task comments. It subscribes to realtime comment updates and keeps the React Query cache aligned.

### `CommentItem`

Displays author, timestamp, text, and edit/delete actions only for the current user's own comments.

### `CommentForm`

Adds a new non-empty task comment.

### `EditCommentForm`

Inline editing form for existing comments.

## Navigation Components

### `Layout`

Application shell wrapper.

### `Navigation`

Current-user and project navigation controls.

### `Breadcrumb`

Context trail for project and board navigation.

### `UserAvatar`

Consistent avatar rendering for users and assignees.

## Hooks and Stores

- `useProjects`: project list, creation, and member mutations.
- `useUsers`: predefined user query.
- `useTasks`: task queries and optimistic mutations.
- `useComments`: comment queries and optimistic mutations.
- `useBoardUpdates`: Socket.IO task event cache updates.
- `useCommentUpdates`: Socket.IO comment event cache updates.
- `useDragDrop`: dnd-kit sensors with touch support.
- `useSocket`: shared socket lifecycle helper.
- `userStore`: current-user selection.
- `uiStore`: modal and filter UI state.

## Testing Notes

Component tests live under `frontend/tests/unit/components`. Workflow tests live under `frontend/tests/integration`, and browser journeys live under `frontend/tests/e2e`.

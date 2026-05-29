# Taskify MVP Release Notes

## MVP Features

- No-password user selection for five predefined users: one product manager and four engineers.
- Three seeded sample projects for immediate exploration.
- Project creation with predefined team member assignment.
- Kanban task board with To Do, In Progress, In Review, and Done columns.
- Task creation, assignment, status changes, and visual highlighting for the current user's assigned tasks.
- Real-time task updates across connected browser sessions.
- Task comments with author attribution and owner-only edit/delete controls.
- Fresh sample data seeding through Prisma.

## Validation

- Frontend E2E suite passed with 2 Playwright tests.
- Live smoke flow passed against the local Docker stack:
  user selection, project creation, task creation, status movement, comment creation, and cross-browser real-time update visibility.
- Browser console and page-error collection was clean during the passing smoke run.
- Backend container logs showed normal request traffic and no error entries during smoke validation.
- Smoke profiling measured task listing at 27 ms, task creation at 3201 ms, and comment creation at 4346 ms in the local development stack.

## Known Scope

- Authentication and user account management remain out of scope for this MVP.
- Deployment automation is tracked separately from the final integration smoke-test tasks.

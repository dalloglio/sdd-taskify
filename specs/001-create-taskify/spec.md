# Feature Specification: Create Taskify

**Feature Branch**: `create-taskify`
**Created**: 2026-05-05
**Status**: Draft
**Input**: User description: "Develop Taskify, a team productivity platform. It should allow users to create projects, add team members, assign tasks, comment and move tasks between boards in Kanban style. In this initial phase for this feature, let's call it \"Create Taskify,\" let's have multiple users but the users will be declared ahead of time, predefined. I want five users in two different categories, one product manager and four engineers. Let's create three different sample projects. Let's have the standard Kanban columns for the status of each task, such as \"To Do,\" \"In Progress,\" \"In Review,\" and \"Done.\" There will be no login for this application as this is just the very first testing thing to ensure that our basic features are set up."

## Clarifications

### Session 2026-05-06

- Q: Should the app start by selecting one of five predefined users and use that selection as the current user for assigned-card highlighting and comment ownership? → A: Yes, use a no-password selection flow and preserve current-user-specific highlighting and comment edit/delete restrictions.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Start a Project and Add Team Members (Priority: P1)

A product manager or team member opens the app and creates a new project, then assigns predefined team members to that project from the available sample users.

**Why this priority**: Creating and organizing projects is the foundation of the platform and allows the team to begin tracking work immediately.

**Independent Test**: Verify that a project can be created and that the sample users can be added as project team members.

**Acceptance Scenarios**:

1. **Given** the app is loaded with predefined users and sample projects, **When** the user creates a new project, **Then** the project appears in the project list.
2. **Given** a project exists, **When** the user selects team members from the predefined list, **Then** those members are added to the project team.
3. **Given** a project has team members, **When** the user opens the project, **Then** the project board shows the assigned team and available Kanban columns.

---

### User Story 2 - Create, Assign, and Move Tasks on a Kanban Board (Priority: P1)

A team member creates a task, assigns it from the task card to one of the predefined users, and moves it through the standard Kanban columns to reflect progress.

**Why this priority**: Task creation and status movement are the core productivity features and need to work first.

**Independent Test**: Confirm that tasks can be created, assigned, and relocated across the Kanban board independently of other features.

**Acceptance Scenarios**:

1. **Given** a project board is open, **When** the user creates a new task with title, description, and assignee, **Then** the task appears in the "To Do" column.
2. **Given** a task exists in one column, **When** the user moves it to another column, **Then** the task appears in the target column and no longer appears in the original column.
3. **Given** a task card is open, **When** the user changes its status to a different Kanban column, **Then** the task appears in the new column and the board reflects the updated status.
4. **Given** a task is assigned, **When** the user views the task details, **Then** the selected assignee is visible.

---

### User Story 3 - Comment on Tasks for Team Collaboration (Priority: P2)

A team member opens a task card and adds comments so that the team can discuss work directly on the task card.

**Why this priority**: Comments enable collaboration and early feedback without requiring a full communication system.

**Independent Test**: Validate that comments can be added to a task and are visible in the task detail view.

**Acceptance Scenarios**:

1. **Given** a task exists, **When** the user adds a comment, **Then** the comment appears in the task's comments list with the author indicated and additional comments can be added without a fixed per-task limit.
2. **Given** a task has comments, **When** the user reopens the task, **Then** all previous comments remain visible.
3. **Given** a task has comments from multiple users, **When** the current user views the comments, **Then** they can edit or delete only comments they authored and not comments from other users.

---

### User Story 4 - Explore Predefined Sample Projects and Users (Priority: P3)

A user explores the included sample data to understand how the app works without needing to set up accounts or create initial content.

**Why this priority**: Preloaded demonstrations reduce friction for first-time use and validate the feature setup.

**Independent Test**: Check that the app loads with five predefined users and three sample projects visible in the project selection screen.

**Acceptance Scenarios**:

1. **Given** the app is opened for the first time, **When** the user views the sample workspace, **Then** exactly five users are available in the predefined user list.
2. **Given** the app is opened, **When** the user inspects sample projects, **Then** three distinct sample projects are available to select.
3. **Given** the app is opened, **When** the user selects one of the five predefined users, **Then** the app opens the project list as that current user without requiring a password.

---

### Edge Cases

- What happens when a user attempts to assign a task to a team member who is not part of the current project? The app should prevent the assignment and show a clear message.
- What happens when a user attempts to assign a task from the task card to a user who is not valid for that project? The app should prevent the assignment and show a clear message.
- How does the system behave when a task is moved outside the defined Kanban columns? Movement should be restricted to only the four supported columns.
- How does the app handle an empty comment submission? The user should not be able to submit a blank comment.
- What happens if the user creates a task without selecting an assignee? The app should allow an unassigned task but clearly indicate its unassigned status.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST allow a user to create a new project and add predefined team members to it.
- **FR-002**: The system MUST include exactly five predefined users in two categories: one product manager and four engineers.
- **FR-003**: The system MUST include three sample projects available immediately when the app loads.
- **FR-004**: The system MUST display a project board with standard Kanban columns: "To Do," "In Progress," "In Review," and "Done."
- **FR-005**: The system MUST allow users to create tasks with a title, description, and assignee from the predefined list.
- **FR-006**: The system MUST allow tasks to be moved between the four Kanban columns and reflect the new status immediately.
- **FR-007**: The system MUST allow users to add comments to tasks and display those comments with the author identity.
- **FR-008**: The system MUST allow users to view task details and see current assignee, status, and comment history.
- **FR-009**: The system MUST support sample data only, with no login or account creation required for this initial phase.
- **FR-010**: The system MUST clearly indicate if a task is unassigned and allow assignment changes after creation.
- **FR-011**: The system MUST allow a user to change a task's status from the task card to any of the four Kanban columns.
- **FR-012**: The system MUST allow unlimited comments to be added to a task.
- **FR-013**: The system MUST allow task assignment and reassignment from the task card to any valid predefined team member.
- **FR-014**: The system MUST present a no-password user selection screen with the five predefined users on launch and treat the selected user as the current user.
- **FR-015**: The system MUST visually distinguish task cards assigned to the current user from other cards.
- **FR-016**: The system MUST allow users to edit or delete only the comments they authored and not comments made by other users.

### Key Entities _(include if feature involves data)_

- **User**: Represents a predefined team member with a name, role category, and display identity. Users are not created or authenticated in this phase.
- **Project**: Represents a workspace for related tasks, including a name, assigned team members, and its own Kanban board.
- **Task**: Represents a unit of work with a title, description, assignee, status, and comment thread.
- **Comment**: Represents a message attached to a task, including author and text content.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can create a new project and see it listed in the project selector within one action.
- **SC-002**: A user can create and assign a task to a predefined team member successfully in under one minute.
- **SC-003**: A task can be moved through all four Kanban columns and the board updates immediately for each move.
- **SC-004**: A user can add a comment to a task and see that comment displayed in the task detail view.
- **SC-005**: The app loads with exactly five predefined users and three sample projects available for exploration.
- **SC-006**: The application does not require login and immediately presents the initial workspace on load.
- **SC-007**: A task's status can be changed from its open task card to any supported Kanban column.
- **SC-008**: A task can receive more than one comment without an arbitrary per-task comment limit.
- **SC-009**: The app opens with a no-password selection screen for five predefined users, and the selected user becomes the current user for UI state and permissions.

## Assumptions

- Users are predefined for this first phase and no user authentication or login flow will be implemented.
- The initial feature scope is limited to sample data, project creation, task management, and comments for demonstration purposes.
- Project team membership is managed from the predefined user list only; creating new users is out of scope.
- The Kanban board is the main task view, and mobile or offline support is out of scope for this phase.
- State may be maintained for the duration of the current session or demo environment without long-term multi-user persistence.
- The app opens to a no-password selection screen for the five predefined users; the selected user is treated as the current user for highlighting assigned tasks and enforcing comment edit/delete permissions.

## UI/UX Requirements _(new section for visual and interaction specifications)_

### Visual Hierarchy Requirements

#### Task Card Visual Hierarchy

Task cards MUST display the following elements in this hierarchy (top to bottom):

1. **Title** (Primary): Font weight `font-bold`, size `text-base`, color `text-gray-900`, max-width constrained (truncate with ellipsis if >50 characters)
2. **Description** (Secondary): Font size `text-sm`, color `text-gray-600`, limited to 2 lines with `line-clamp-2`
3. **Assignee Info** (Tertiary): Flex row with avatar (w-6 h-6 rounded-full) + name (text-sm) + role tag (text-xs)
4. **Status Badge** (Indicator): Right-aligned, background color mapped to status (To Do: bg-gray-200, In Progress: bg-blue-200, In Review: bg-yellow-200, Done: bg-green-200)

Cards assigned to the current user MUST have a left border accent: `border-l-4 border-blue-500`. Unassigned tasks MUST display "Unassigned" label in italic `text-gray-500`.

---

### Kanban Board Layout Requirements

The Kanban board MUST display exactly 4 columns in a horizontal grid layout:

**Column Order (left to right)**: To Do → In Progress → In Review → Done

**Layout Specifications**:

- Grid: `grid grid-cols-4 gap-4` (4 equal-width columns with 16px gutter)
- Column width: Each column occupies 25% of available width
- Column header: Font `font-semibold text-lg`, padded `pb-3`, with task count: `(N tasks)`
- Column container: `bg-gray-100 rounded-lg p-4`, min-height `min-h-screen`
- Column scrolls vertically (overflow-y-auto) if tasks exceed viewport
- Spacing between task cards: `gap-2` (8px vertical spacing)

**Responsive behavior** (noted for future phases): Tablets (1024px) may stack to 2x2 grid or scroll horizontally.

---

### Task Card Interaction Requirements

Task cards MUST support the following interactions:

1. **Open Details**: Click card → Opens task details modal (overlay) showing full title, description, assignee, status, comments. Close with X button or Escape key.

2. **Move Between Columns** (Drag-and-Drop): Card is draggable (dnd-kit integration). User drags card to target column. Card animates to new position on drop. Board updates immediately (optimistic update).

3. **Inline Status Change** (from card context menu): Right-click or click ellipsis menu on card. Dropdown shows: To Do | In Progress | In Review | Done. Selecting status updates card column immediately.

4. **Edit/Delete** (card context menu): Menu option "Edit task" → Opens edit modal (same form as create). Menu option "Delete task" → Shows confirmation, soft-deletes task.

**Cursor states**: Draggable cursor on hover, pointer cursor for clickable elements.

---

### Comment Display in Task Details

Comments section MUST display the following for each comment:

1. **Author Identity**: Avatar (w-8 h-8 rounded-full) + name (font-semibold text-sm)
2. **Timestamp**: Right-aligned, size `text-xs text-gray-500`, format: "May 6, 2:45 PM"
3. **Comment Text**: Full text in `text-base text-gray-900`, word-wrapped
4. **Edit/Delete Actions** (conditional): Visible ONLY if comment author === current user. "Edit" button → Opens inline edit or modal. "Delete" button → Shows confirmation modal, then removes comment.

**Comment Order**: Latest comment at BOTTOM (chronological, ascending). **Comment Container**: `bg-gray-50 rounded p-3 mb-2`. **Empty State**: "No comments yet" message when list is empty.

---

### User Selection & Project Navigation UI

#### User Selection Screen (Launch)

The app MUST display a user selection screen on first load:

**Layout**: Full-screen centered modal. Title: "Select your user" (font-bold text-2xl). Subtitle: "No password required" (text-gray-600 text-sm).

**User Cards Grid**: Grid layout `grid grid-cols-3 gap-4` (3 columns on desktop). 5 user cards total, arranged 3+2.

**Each User Card**:

- Background: `bg-white border border-gray-200 rounded-lg p-6`
- Avatar: Circular image `w-16 h-16 rounded-full` centered
- Name: Below avatar, `font-semibold text-base`, centered
- Role Badge: `inline-block px-3 py-1 text-xs font-medium rounded-full`
  - Product Manager: `bg-blue-100 text-blue-700`
  - Engineer: `bg-gray-100 text-gray-700`
- Click card or button: Selects user, stores in session/Zustand, navigates to Project List

#### User Switching (after selection)

Top-right corner: Current user profile button. Click → Dropdown menu: "Switch User" option. Returns to User Selection screen.

#### Project List View

After user selection, display projects list:

- Title: "Projects" (font-bold text-2xl)
- Current user indicator: "Logged in as [User Name]" (top-right, text-gray-600)
- Grid of project cards (3 columns) or list view
- Each card: name, member count, creation date
- Button: "+ Create Project"
- Click project → Navigate to Kanban board

---

### Kanban Column Visual Representation

Each Kanban column MUST be visually distinct and clearly labeled:

**Column Headers**:

- Text: Exact names: "To Do" | "In Progress" | "In Review" | "Done"
- Font: `font-semibold text-lg text-gray-900`
- Below header: Task count in parentheses: "(5 tasks)"
- Color-coded top border for each column:
  - To Do: `border-t-4 border-gray-400`
  - In Progress: `border-t-4 border-blue-500`
  - In Review: `border-t-4 border-yellow-500`
  - Done: `border-t-4 border-green-500`

**Column Container**: Background `bg-gray-100`, border `rounded-lg`, padding `p-4`, minimum height viewport height, scrollable `overflow-y-auto`, visible dividers with gutter `gap-4` between columns.

**Empty Column State**: Show icon, text "No tasks in this column", and CTA "Create the first task" (if To Do column is empty).

---

### User Category Visual Distinction

Predefined users MUST be visually distinguished by role category:

**Product Manager (1 user)**:

- Avatar background: Solid blue (`bg-blue-500`)
- Role badge: Filled blue background `bg-blue-100 text-blue-700`, text "PM"
- Card border (in user selection): Optional left border `border-l-4 border-blue-500`

**Engineer (4 users)**:

- Avatar background: Solid gray (`bg-gray-400`)
- Role badge: Filled gray background `bg-gray-100 text-gray-700`, text "Engineer"

**Task Assignment Indicator**: When viewing task cards or assignee dropdowns, show user with badge: Format "[User Name] - [PM|Engineer]" with badge styling matching role colors.

---

### Task Assignment Display Requirements

Task assignment information MUST be displayed unambiguously:

**On Task Card**: Format avatar (w-6 h-6) + Name (text-sm) on single row. Assigned: Show assignee name and role. Unassigned: Display text "Unassigned" in italic gray (`italic text-gray-500`).

**In Task Details Modal**: Section label "Assigned to:" (font-semibold text-sm). Display avatar + Full name + Role tag (e.g., "Alice Chen - PM"). Edit mode: Dropdown showing all project members with avatars and role badges. Validation: Only project members available for assignment. Error handling: If assigned user not in project, show warning: "⚠️ Assigned user is not a member of this project. Update assignment."

**In Create/Edit Task Form**: Label "Assignee" (required or optional, clearly marked). Input type dropdown/select with search, showing user avatars + names + roles. Default empty or "Unassigned". Help text "Select a team member from this project".

---

### Task Status Consistency Requirements

Task status MUST be consistent across all views and representations:

**Canonical Status Values** (MUST appear identically everywhere):

1. "To Do"
2. "In Progress"
3. "In Review"
4. "Done"

These values MUST appear in Kanban column headers, task card status badges, task details modal status selector, status change dropdown, and task list filters (if any).

**Color Mapping** (Consistent across all occurrences):

- To Do → Gray (`bg-gray-200`)
- In Progress → Blue (`bg-blue-200`)
- In Review → Yellow (`bg-yellow-200`)
- Done → Green (`bg-green-200`)

Invalid status values like "Doing", "Review", "Complete", "Backlog" MUST NOT appear in any UI.

---

### Task Creation & Edit UI Consistency

Task creation (modal/form) and task editing MUST use identical UI components and layout:

**Form Fields** (Same in both create and edit):

1. Title (text input, required, max 100 chars)
2. Description (textarea, optional, max 500 chars)
3. Assignee (dropdown, optional, project members only)
4. Status (dropdown, required, defaults to "To Do" on create)

**Form Layout** (Both create and edit): [Modal Header] "Create Task" / "Edit Task", [Input] Title, [Textarea] Description, [Dropdown] Assignee, [Dropdown] Status, [Button] Cancel [Button] Save

**Validation** (Identical in both): Title required and non-empty. Description optional, max 500 chars. Assignee must be valid project member or empty (unassigned). Status must be valid. Submit button disabled until valid.

**Success feedback** (Both): Toast notification "Task created successfully" / "Task updated". Modal closes, board updates immediately.

---

### Measurable UI Acceptance Criteria

All UI acceptance scenarios MUST be objectively verifiable:

**Task Appearance**: ✅ Task card is rendered in target Kanban column with title, assignee avatar, and status badge visible within 100ms of drop.

**Column Update**: ✅ After moving task to new column, task card is visually removed from source column and appears in target column within same render cycle (no reload required).

**Comment Display**: ✅ All comments appear in chronological order (oldest first) with author avatar, name, timestamp (MM/DD, HH:MM), and edit/delete buttons (visible only to author).

**Empty State**: ✅ When Kanban column has no tasks, display message "No tasks in this column" centered, and show "+ Create Task" CTA.

**User Selection**: ✅ On app launch, display 5 user cards in 3-column grid, each showing avatar, name, role badge; clicking card navigates to Project List and displays selected user in top-right corner.

---

### Empty State UI Requirements

The app MUST handle empty states gracefully across all views:

**Empty Project List**: Title "No projects yet", Message "Create your first project to get started", CTA Button "+ Create Project", centered layout with light background and icon.

**Empty Kanban Board** (No tasks in entire board): Message in center "No tasks yet. Create one to get started!", Button "+ Create Task" (primary action), all 4 columns visible but empty.

**Empty Column** (e.g., "To Do" is empty): In column header "(0 tasks)" count. Column body icon + message "No tasks in this column". Optional "Create task" link below message.

**Empty Comments** (Task has no comments): In comments section text "No comments yet". Input still visible "Add a comment..." placeholder. User can immediately start typing.

**Visual Consistency**: Empty state text color `text-gray-500`, empty state icon muted gray color, all empty states use consistent spacing and layout.

---

### Multi-User Comment Display Requirements

When task has comments from multiple users, UI MUST clearly show:

Each comment displays:

1. Commenter avatar (`w-8 h-8 rounded-full`)
2. Commenter full name (`font-semibold text-sm`)
3. Commenter role tag (PM or Engineer, smaller badge)
4. Timestamp "May 6, 2:45 PM" (`text-xs text-gray-500`)
5. Comment text (full content, word-wrapped)
6. Edit/Delete buttons (visible ONLY if commenter === current user)

**Comment Order**: Chronological ascending (oldest at top, newest at bottom).

**Permissions Display** (Edit/Delete Buttons): If `comment.authorId === currentUser.id` show buttons "Edit" → Opens inline edit or modal, "Delete" → Shows confirmation then removes comment. If comment author ≠ current user buttons are hidden, not just disabled.

---

### Long Text Handling Requirements

The app MUST handle long task titles, descriptions, and comments gracefully:

**Task Card - Title**: Max displayed ~40 characters, overflow handling ellipsis (`text-ellipsis overflow-hidden whitespace-nowrap`), full text visible in task details modal.

**Task Card - Description**: Max displayed 2 lines (`line-clamp-2`), font `text-sm text-gray-600`, overflow ellipsis after 2 lines, full text visible in task details modal.

**Task Details Modal - Title**: No truncation, full title visible word-wrapped if needed, font `font-bold text-xl`.

**Task Details Modal - Description**: No truncation, full description visible, word wrap enabled, font `text-base text-gray-900`, max height scrollable if >5 lines.

**Comments - Comment Text**: No truncation, full text visible, word wrap enabled (`word-break break-word`), supports line breaks to preserve user formatting, max width modal/card width.

**Input Fields** (create/edit): Title input visual feedback at 100 chars with character counter "50/100". Description textarea visual feedback at 500 chars "245/500". Prevent submission if exceeding max.

---

### Keyboard Navigation & Accessibility Requirements

The app MUST be fully navigable via keyboard:

**Focus Management**: Tab order logical flow (left-to-right, top-to-bottom). Focus indicator visible outline (`outline-2 outline-blue-500 outline-offset-2`). All interactive elements focusable: buttons, links, inputs, drag-drop.

**Keyboard Shortcuts**:

- Tab: Move to next interactive element
- Shift+Tab: Move to previous interactive element
- Enter: Activate button/link/form submission
- Escape: Close modal or dropdown
- Arrow Keys (in select/dropdown): Navigate options, select with Enter
- Space: Toggle checkbox (assignee multi-select if applicable)

**Task Card Interaction via Keyboard**: Tab to task card (focus indicator visible). Press Enter opens task details modal. In modal: Tab through fields, select status/assignee with arrow keys.

**Drag-and-Drop Alternative** (Keyboard users): Tab to task card. Press 'M' key enters move mode. Press arrow keys select target column. Press Enter drops task in column. OR use status dropdown in task details modal (keyboard accessible).

**Form Accessibility**: All inputs have `<label>` elements (for attribute linked to input id). Required fields marked with asterisk `*` (aria-label "required"). Error messages linked to input `aria-describedby="error-message"`. Disabled buttons show `:disabled` visual state.

**ARIA Labels** (screen reader support): Button aria-label="Create task". Modal role="dialog", aria-labelledby="modal-title". Dropdown role="combobox", aria-expanded="true/false". Task card role="button", aria-label="Task: [title], Assigned to [assignee]". Drag handle aria-label="Drag to move task".

**Color Contrast** (WCAG AA minimum): Text on background 4.5:1 ratio minimum. Status badges ensure text readable on colored backgrounds.

---

### Responsive Design Requirements

**Desktop (1920px and above)**: Kanban board 4-column grid layout (grid-cols-4). Column width equal distribution. Task card full width of column. Padding/spacing `gap-4` (16px) between columns.

**Laptop (1440px)**: Same as desktop layout. Ensure no horizontal scrolling.

**Tablet (1024px)**: Kanban layout may adapt to 2x2 grid (grid-cols-2) with column pairs: (To Do, In Progress) in first row, (In Review, Done) in second row. OR horizontal scroll if 4-column layout preferred. Task cards slightly reduced padding for space efficiency.

**Tablet Landscape (768px)**: Determine primary: 4-column with horizontal scroll OR 2x2 grid layout. Document chosen approach.

**Mobile (< 768px)**: Out of scope for MVP per assumptions. Recommendation for future: Stack to 1 column or tab-based view.

**Responsive Considerations** (All breakpoints): Navigation/header responsive, hamburger menu for mobile (future). Modals full width on mobile (future), max-width on desktop. Task cards readable text sizes, touch-friendly button sizes (>=44px). Inputs full width on small screens, auto-width on desktop.

**Tailwind Breakpoints Used**:

- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

**Currently for MVP**: Desktop/laptop only (min 1024px recommended).

---

### Predefined User Data Assumptions

The app MUST operate under these explicit assumptions about user data:

**User Set**: Exactly 5 predefined users, hardcoded or seeded in database. No user creation, registration, or signup. No user deletion or modification after initial seed. Users persist for entire application session.

**User Categories**: Category 1 Product Manager (exactly 1 user). Category 2 Engineer (exactly 4 users). No other roles or categories in MVP.

**User Data Structure**: Each user MUST have `id` (unique identifier), `name` (full name), `role` (category "PM" or "Engineer"), `avatar` (avatar image or color).

**User Selection Flow**: On app launch no user is "logged in". User selection screen shows all 5 users. User clicks to select. Selected user becomes "current user" for session. Current user stored in Zustand store (persists in session). User can switch at any time via UI button.

**Assumptions NOT in Scope**: No user authentication or passwords. No multi-device sync. No persistent user data across sessions (session-only). No user roles/permissions system beyond PM/Engineer distinction.

---

### Sample Project Data Dependencies

The app MUST load with exactly 3 predefined sample projects:

**Project Requirements**: Pre-seeded in database or hardcoded. Loaded on app initialization. Available immediately (not lazy-loaded). Visible in project list after user selection.

**Sample Projects**:

1. Project Name "Website Redesign" with Team members Alice Chen (PM), Bob Smith, Carol Johnson. Status Active.
2. Project Name "Mobile App v2" with Team members Alice Chen (PM), Dave Wilson, Emma Lee. Status Active.
3. Project Name "API Refactor" with Team members Alice Chen (PM), Bob Smith, Dave Wilson, Emma Lee. Status Active.

**Each Project Has**: `id` (unique identifier), `name` (project name string), `description` (optional, may be empty for MVP), `createdAt` (timestamp of project creation), `teamMembers` (array of user IDs assigned to project), `tasks` (initially empty array, populated when user creates tasks).

**Dependency Documentation**: Projects loaded from database seed script `backend/prisma/seed.ts`. Projects immutable in MVP (cannot delete sample projects). New projects can be created via UI, added to user's workspace. Sample projects visible to all users (shared demo data).

**Sample Data Availability**: All 3 projects visible in project list regardless of selected user. Each project shows member count "Website Redesign (3 members)". Clicking project opens its Kanban board.

---

### User Selection as Login Alternative

The apparent conflict between "no login" requirement and user-specific features is resolved by user selection flow:

**Resolution**: No login = No password/authentication required. User selection = Functional replacement for login. User selection happens at app launch, not via authentication.

**User Selection Flow** (replaces login): App loads with user selection screen. User clicks profile card to select user. Selected user becomes "current user" for session. Current user ID stored in Zustand (`userStore.currentUserId`). User-specific features now work based on current user.

**User-Specific Features Enabled After Selection**:

- Task cards assigned to current user highlighted with blue border
- Current user's comments show edit/delete buttons
- Other users' comments have edit/delete buttons hidden
- Current user indicator displayed in header/top-right

**Session Persistence**: Current user selection stored in memory during session. User can switch users at any time via "Switch User" button. User selection is NOT persisted across browser restarts (session-only).

**Why This Works**: Provides user context for task assignment and comment ownership. Enables UI differentiation (highlight, permissions). Avoids password/auth complexity (MVP requirement). Simple, no login infrastructure needed.

---

### Quantified UI Terminology

All vague terms in requirements MUST be replaced with measurable specifications:

**"Clearly indicate" unassigned task**: ✅ Display text "Unassigned" in italic, color `text-gray-500`, in assignee position of task card.

**"Visually distinguish" current user's tasks**: ✅ Add left border `border-l-4 border-blue-500` to task cards where `card.assigneeId === currentUser.id`.

**"Immediate" update**: ✅ Task card moves to target column within same render cycle (<16ms on 60fps display), no page reload required.

**"Prominent display"**: ✅ Role badge displayed inline with name, `text-xs` size, colored background matching role (PM blue, Engineer gray).

**"Clearly show"**: ✅ Modal displays title (font-bold text-xl), description (text-base), assignee (with avatar and name), status, and comments list (max 80% modal height).

**"Real-time" updates**: ✅ When one user moves task via drag-drop, all other users' browsers update their board within 1 second via WebSocket.

**"Accessible" keyboard navigation**: ✅ All interactive elements focusable via Tab key, focus indicator visible (2px outline), enter/space to activate buttons, escape to close modals.

**"Responsive" design**: ✅ Grid layout 4 columns at 1024px+, 2 columns at 768px-1023px, horizontal scroll or stack below 768px (out of scope MVP).

**"Consistent" styling**: ✅ Primary buttons `bg-blue-500 text-white px-4 py-2 rounded`, Secondary buttons `bg-gray-200 text-gray-900 px-4 py-2 rounded`, All buttons font `text-sm font-medium`.

**"Feedback" on actions**: ✅ Toast notification appears (top-right, green background, text "Task created"), auto-dismisses after 3 seconds.

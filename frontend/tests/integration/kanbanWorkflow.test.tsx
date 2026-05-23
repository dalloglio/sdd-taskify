import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import KanbanBoard from '../../src/pages/KanbanBoard';
import api from '../../src/services/api';
import { useUserStore } from '../../src/context/userStore';
import { Project, Task } from '../../src/types/models';
import { renderWithProviders } from '../utils';

vi.mock('../../src/services/socket', () => ({
  initSocket: () => ({
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  closeSocket: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const users = [
  { id: 'user-1', name: 'Alice Chen', role: 'product_manager' },
  { id: 'user-2', name: 'Bob Smith', role: 'engineer' },
];

const project: Project = {
  id: 'project-1',
  name: 'Website Redesign',
  members: users,
  createdAt: '2026-05-06T10:00:00.000Z',
};

const initialTasks: Task[] = [
  {
    id: 'task-1',
    projectId: project.id,
    title: 'Create hero section',
    description: 'Design the main landing section',
    assignee: users[1],
    status: 'to_do',
    createdAt: '2026-05-06T10:00:00.000Z',
  },
];

describe('kanban workflow', () => {
  beforeEach(() => {
    useUserStore.getState().setCurrentUser(users[0]);
    vi.mocked(api.get).mockResolvedValue({ data: { data: initialTasks } });
    vi.mocked(api.post).mockResolvedValue({
      data: {
        data: {
          id: 'task-2',
          projectId: project.id,
          title: 'Write launch copy',
          description: 'Draft the website copy',
          assignee: users[1],
          status: 'to_do',
          createdAt: '2026-05-06T12:00:00.000Z',
        },
      },
    });
    vi.mocked(api.patch).mockResolvedValue({
      data: {
        data: {
          ...initialTasks[0],
          status: 'in_progress',
        },
      },
    });
    vi.mocked(api.delete).mockResolvedValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
    useUserStore.getState().setCurrentUser(null);
  });

  it('creates a task, moves it by status action, and reflects optimistic board state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KanbanBoard project={project} />);

    await screen.findByText('Create hero section');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.type(screen.getByLabelText(/^title$/i), 'Write launch copy');
    await user.selectOptions(screen.getByLabelText(/assignee/i), 'user-2');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/projects/project-1/tasks', {
        title: 'Write launch copy',
        description: undefined,
        assigneeId: 'user-2',
        createdById: 'user-1',
      });
    });

    await user.click(screen.getByRole('button', { name: /open actions for create hero section/i }));
    await user.click(screen.getByRole('button', { name: 'In Progress' }));

    expect(api.patch).toHaveBeenCalledWith('/tasks/task-1/status', {
      status: 'in_progress',
    });
    expect(await screen.findByText('In Progress')).toBeInTheDocument();
  });
});

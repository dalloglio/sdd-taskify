import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import KanbanBoard from '../../../src/pages/KanbanBoard';
import api from '../../../src/services/api';
import { Project, Task } from '../../../src/types/models';
import { renderWithProviders } from '../../utils';

vi.mock('../../../src/services/socket', () => ({
  initSocket: () => ({
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  closeSocket: vi.fn(),
}));

vi.mock('../../../src/services/api', () => ({
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

const tasks: Task[] = [
  {
    id: 'task-1',
    projectId: project.id,
    title: 'Create hero section',
    description: 'Design the main landing section',
    assignee: users[1],
    status: 'to_do',
    createdAt: '2026-05-06T10:00:00.000Z',
  },
  {
    id: 'task-2',
    projectId: project.id,
    title: 'Review color palette',
    assignee: null,
    status: 'in_review',
    createdAt: '2026-05-06T11:00:00.000Z',
  },
];

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: tasks } });
    vi.mocked(api.post).mockResolvedValue({
      data: {
        data: {
          ...tasks[0],
          id: 'task-3',
          title: 'Write launch copy',
        },
      },
    });
    vi.mocked(api.patch).mockResolvedValue({ data: { data: tasks[0] } });
    vi.mocked(api.delete).mockResolvedValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the four Kanban columns and task card hierarchy', async () => {
    renderWithProviders(<KanbanBoard project={project} />);

    expect(await screen.findByText('Create hero section')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Review' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();

    const card = screen.getByText('Create hero section').closest('article');
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText('Bob Smith')).toBeInTheDocument();
    expect(within(card as HTMLElement).getByText('To Do')).toBeInTheDocument();
  });

  it('creates a task from the board modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KanbanBoard project={project} />);

    await screen.findByText('Create hero section');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.type(screen.getByLabelText(/^title$/i), 'Write launch copy');
    await user.type(screen.getByLabelText(/description/i), 'Draft the website copy');
    await user.selectOptions(screen.getByLabelText(/assignee/i), 'user-2');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(api.post).toHaveBeenCalledWith('/projects/project-1/tasks', {
      title: 'Write launch copy',
      description: 'Draft the website copy',
      assigneeId: 'user-2',
      createdById: undefined,
    });
  });

  it('opens task details and updates status from the modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<KanbanBoard project={project} />);

    await user.click(await screen.findByText('Create hero section'));
    await user.selectOptions(screen.getByLabelText(/status/i), 'in_progress');

    expect(api.patch).toHaveBeenCalledWith('/tasks/task-1/status', {
      status: 'in_progress',
    });
  });
});

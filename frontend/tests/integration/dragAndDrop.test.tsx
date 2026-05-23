import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import KanbanBoard from '../../src/pages/KanbanBoard';
import api from '../../src/services/api';
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

const users = [{ id: 'user-2', name: 'Bob Smith', role: 'engineer' }];

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
    assignee: users[0],
    status: 'to_do',
    createdAt: '2026-05-06T10:00:00.000Z',
  },
];

describe('drag-and-drop interactions', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: tasks } });
    vi.mocked(api.patch).mockResolvedValue({ data: { data: tasks[0] } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('exposes draggable cards and ignores drops without a valid target column', async () => {
    renderWithProviders(<KanbanBoard project={project} />);

    const dragHandle = await screen.findByRole('button', {
      name: /drag create hero section/i,
    });

    fireEvent.pointerDown(dragHandle, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(document.body, { clientX: 14, clientY: 14 });
    fireEvent.pointerUp(document.body);

    expect(api.patch).not.toHaveBeenCalled();
  });
});

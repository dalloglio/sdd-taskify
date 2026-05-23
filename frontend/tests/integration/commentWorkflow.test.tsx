import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TaskDetailsModal from '../../src/components/TaskDetailsModal';
import { useUserStore } from '../../src/context/userStore';
import api from '../../src/services/api';
import { Comment, Task, User } from '../../src/types/models';
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

const alice: User = {
  id: 'user-1',
  name: 'Alice Chen',
  role: 'product_manager',
};

const bob: User = {
  id: 'user-2',
  name: 'Bob Smith',
  role: 'engineer',
};

const task: Task = {
  id: 'task-1',
  projectId: 'project-1',
  title: 'Create hero section',
  description: 'Design the main landing section',
  assignee: bob,
  status: 'to_do',
  createdAt: '2026-05-06T10:00:00.000Z',
};

const comments: Comment[] = [
  {
    id: 'comment-1',
    taskId: task.id,
    projectId: task.projectId,
    text: 'Initial direction',
    author: alice,
    createdAt: '2026-05-06T10:00:00.000Z',
  },
];

describe('comment workflow', () => {
  beforeEach(() => {
    useUserStore.setState({ currentUser: alice });
    vi.mocked(api.get).mockResolvedValue({ data: { data: comments } });
    vi.mocked(api.post).mockResolvedValue({
      data: {
        data: {
          ...comments[0],
          id: 'comment-2',
          text: 'New feedback',
        },
      },
    });
    vi.mocked(api.patch).mockResolvedValue({
      data: {
        data: {
          ...comments[0],
          text: 'Updated direction',
        },
      },
    });
    vi.mocked(api.delete).mockResolvedValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ currentUser: null });
  });

  it('adds, edits, and deletes a comment from task details', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TaskDetailsModal
        open
        task={task}
        members={[alice, bob]}
        editing={false}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onSubmitEdit={vi.fn()}
        onStatusChange={vi.fn()}
        onAssigneeChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await screen.findByText('Initial direction');
    await user.type(screen.getByLabelText(/add comment/i), 'New feedback');
    await user.click(screen.getByRole('button', { name: /add comment/i }));

    expect(api.post).toHaveBeenCalledWith('/tasks/task-1/comments', {
      text: 'New feedback',
      authorId: 'user-1',
    });

    const ownComment = screen
      .getByText('Initial direction')
      .closest('article') as HTMLElement;
    await user.click(within(ownComment).getByText('Edit'));
    await user.clear(screen.getByLabelText(/edit comment/i));
    await user.type(screen.getByLabelText(/edit comment/i), 'Updated direction');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(api.patch).toHaveBeenCalledWith('/comments/comment-1', {
      text: 'Updated direction',
      currentUserId: 'user-1',
    });

    const refreshedComment = screen
      .getByText('Initial direction')
      .closest('article') as HTMLElement;
    await user.click(within(refreshedComment).getByText('Delete'));
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    await user.click(deleteButtons[deleteButtons.length - 1]);

    expect(api.delete).toHaveBeenCalledWith('/comments/comment-1', {
      data: { currentUserId: 'user-1' },
    });
  });
});

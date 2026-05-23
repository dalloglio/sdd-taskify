import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CommentsList from '../../../src/components/CommentsList';
import { useUserStore } from '../../../src/context/userStore';
import api from '../../../src/services/api';
import { Comment, Task, User } from '../../../src/types/models';
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
  status: 'to_do',
  createdAt: '2026-05-06T10:00:00.000Z',
};

const comments: Comment[] = [
  {
    id: 'comment-1',
    taskId: task.id,
    projectId: task.projectId,
    text: 'My note',
    author: alice,
    createdAt: '2026-05-06T10:00:00.000Z',
  },
  {
    id: 'comment-2',
    taskId: task.id,
    projectId: task.projectId,
    text: 'Other note',
    author: bob,
    createdAt: '2026-05-06T10:05:00.000Z',
  },
];

describe('CommentsList', () => {
  beforeEach(() => {
    useUserStore.setState({ currentUser: alice });
    vi.mocked(api.get).mockResolvedValue({ data: { data: comments } });
    vi.mocked(api.post).mockResolvedValue({
      data: {
        data: {
          ...comments[0],
          id: 'comment-3',
          text: 'New comment',
        },
      },
    });
    vi.mocked(api.patch).mockResolvedValue({
      data: {
        data: {
          ...comments[0],
          text: 'Updated note',
        },
      },
    });
    vi.mocked(api.delete).mockResolvedValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ currentUser: null });
  });

  it('renders comments and only shows edit/delete for the current author', async () => {
    renderWithProviders(<CommentsList task={task} />);

    const ownComment = await screen.findByText('My note');
    const otherComment = screen.getByText('Other note');

    expect(within(ownComment.closest('article') as HTMLElement).getByText('Edit')).toBeInTheDocument();
    expect(within(ownComment.closest('article') as HTMLElement).getByText('Delete')).toBeInTheDocument();
    expect(within(otherComment.closest('article') as HTMLElement).queryByText('Edit')).not.toBeInTheDocument();
    expect(within(otherComment.closest('article') as HTMLElement).queryByText('Delete')).not.toBeInTheDocument();
  });

  it('adds a comment with the current user as author', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommentsList task={task} />);

    await screen.findByText('My note');
    await user.type(screen.getByLabelText(/add comment/i), 'New comment');
    await user.click(screen.getByRole('button', { name: /add comment/i }));

    expect(api.post).toHaveBeenCalledWith('/tasks/task-1/comments', {
      text: 'New comment',
      authorId: 'user-1',
    });
  });

  it('edits and deletes an authored comment', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommentsList task={task} />);

    const ownComment = (await screen.findByText('My note')).closest('article') as HTMLElement;
    await user.click(within(ownComment).getByText('Edit'));
    await user.clear(screen.getByLabelText(/edit comment/i));
    await user.type(screen.getByLabelText(/edit comment/i), 'Updated note');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(api.patch).toHaveBeenCalledWith('/comments/comment-1', {
      text: 'Updated note',
      currentUserId: 'user-1',
    });

    await waitFor(() => expect(screen.getByText('My note')).toBeInTheDocument());
    const refreshedComment = screen.getByText('My note').closest('article') as HTMLElement;
    await user.click(within(refreshedComment).getByText('Delete'));
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    await user.click(deleteButtons[deleteButtons.length - 1]);

    expect(api.delete).toHaveBeenCalledWith('/comments/comment-1', {
      data: { currentUserId: 'user-1' },
    });
  });
});

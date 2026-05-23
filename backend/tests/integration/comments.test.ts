const mockCommentService = {
  createComment: jest.fn(),
  getCommentsByTask: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
};

jest.mock('../../src/services/commentService', () => mockCommentService);

const mockRealtime = {
  emitCommentAdded: jest.fn(),
  emitCommentUpdated: jest.fn(),
  emitCommentDeleted: jest.fn(),
};

jest.mock('../../src/realtime/handlers', () => mockRealtime);

import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from '../../src/controllers/commentController';

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
}

const commentFixture = {
  id: 'comment-1',
  taskId: 'task-1',
  text: 'Looks good',
  author: {
    id: 'user-1',
    name: 'Alice Chen',
    role: 'PRODUCT_MANAGER',
    avatarUrl: null,
  },
  task: {
    projectId: 'project-1',
  },
  createdAt: new Date('2026-05-06T10:00:00.000Z'),
  updatedAt: new Date('2026-05-06T10:00:00.000Z'),
};

describe('comments workflow integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a comment and emits a realtime event', async () => {
    mockCommentService.createComment.mockResolvedValue(commentFixture);

    const res = createMockRes();
    await createComment(
      {
        params: { taskId: 'task-1' },
        body: { text: 'Looks good', authorId: 'user-1' },
        header: jest.fn().mockReturnValue(undefined),
      } as never,
      res as never
    );

    expect(mockCommentService.createComment).toHaveBeenCalledWith('task-1', {
      text: 'Looks good',
      authorId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        id: 'comment-1',
        projectId: 'project-1',
        author: expect.objectContaining({ id: 'user-1' }),
      }),
    });
    expect(mockRealtime.emitCommentAdded).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({ id: 'comment-1' })
    );
  });

  it('lists comments for a task', async () => {
    mockCommentService.getCommentsByTask.mockResolvedValue([commentFixture]);

    const res = createMockRes();
    await listComments({ params: { taskId: 'task-1' } } as never, res as never);

    expect(mockCommentService.getCommentsByTask).toHaveBeenCalledWith('task-1');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [expect.objectContaining({ id: 'comment-1' })],
    });
  });

  it('updates a comment for the current author', async () => {
    mockCommentService.updateComment.mockResolvedValue({
      ...commentFixture,
      text: 'Updated',
    });

    const res = createMockRes();
    await updateComment(
      {
        params: { commentId: 'comment-1' },
        body: { text: 'Updated', currentUserId: 'user-1' },
        header: jest.fn().mockReturnValue(undefined),
      } as never,
      res as never
    );

    expect(mockCommentService.updateComment).toHaveBeenCalledWith('comment-1', {
      text: 'Updated',
      currentUserId: 'user-1',
    });
    expect(mockRealtime.emitCommentUpdated).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({ text: 'Updated' })
    );
  });

  it('deletes a comment for the current author', async () => {
    mockCommentService.deleteComment.mockResolvedValue(commentFixture);

    const res = createMockRes();
    await deleteComment(
      {
        params: { commentId: 'comment-1' },
        body: { currentUserId: 'user-1' },
        header: jest.fn().mockReturnValue(undefined),
      } as never,
      res as never
    );

    expect(mockCommentService.deleteComment).toHaveBeenCalledWith('comment-1', {
      currentUserId: 'user-1',
    });
    expect(mockRealtime.emitCommentDeleted).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({ commentId: 'comment-1' })
    );
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('uses the current user header when creating comments', async () => {
    mockCommentService.createComment.mockResolvedValue(commentFixture);

    const res = createMockRes();
    await createComment(
      {
        params: { taskId: 'task-1' },
        body: { text: 'Looks good', authorId: 'body-user' },
        header: jest.fn().mockReturnValue('header-user'),
      } as never,
      res as never
    );

    expect(mockCommentService.createComment).toHaveBeenCalledWith('task-1', {
      text: 'Looks good',
      authorId: 'header-user',
    });
  });

  it('maps authorization errors to response status codes', async () => {
    mockCommentService.updateComment.mockRejectedValue(
      Object.assign(new Error('Only the comment author can modify this comment'), {
        status: 403,
      })
    );

    const res = createMockRes();
    await updateComment(
      {
        params: { commentId: 'comment-1' },
        body: { text: 'Updated', currentUserId: 'user-2' },
        header: jest.fn().mockReturnValue(undefined),
      } as never,
      res as never
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Only the comment author can modify this comment',
    });
  });
});

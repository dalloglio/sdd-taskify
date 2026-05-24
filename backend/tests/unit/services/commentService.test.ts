const mockPrisma = {
  task: {
    findFirst: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import {
  createComment,
  deleteComment,
  getCommentsByTask,
  updateComment,
} from '../../../src/services/commentService';

const task = {
  id: 'task-1',
  projectId: 'project-1',
  project: { members: [{ userId: 'user-1' }, { userId: 'user-2' }] },
};

const comment = {
  id: 'comment-1',
  taskId: 'task-1',
  authorId: 'user-1',
  text: 'Initial note',
  task,
};

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a comment for a project member', async () => {
    mockPrisma.task.findFirst.mockResolvedValue(task);
    mockPrisma.comment.create.mockResolvedValue(comment);

    await expect(
      createComment('task-1', { text: 'Initial note', authorId: 'user-1' })
    ).resolves.toMatchObject({ id: 'comment-1' });

    expect(mockPrisma.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          taskId: 'task-1',
          authorId: 'user-1',
          text: 'Initial note',
        },
      })
    );
  });

  it('rejects comments from users outside the project', async () => {
    mockPrisma.task.findFirst.mockResolvedValue(task);

    await expect(
      createComment('task-1', { text: 'Blocked', authorId: 'user-99' })
    ).rejects.toMatchObject({
      message: 'Comment author must be a project member',
      status: 403,
    });
  });

  it('lists active comments in chronological order', async () => {
    mockPrisma.task.findFirst.mockResolvedValue(task);
    mockPrisma.comment.findMany.mockResolvedValue([comment]);

    await expect(getCommentsByTask('task-1')).resolves.toEqual([comment]);

    expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { taskId: 'task-1', deletedAt: null },
        orderBy: { createdAt: 'asc' },
      })
    );
  });

  it('allows only the author to update a comment', async () => {
    mockPrisma.comment.findFirst.mockResolvedValue(comment);
    mockPrisma.comment.update.mockResolvedValue({
      ...comment,
      text: 'Updated',
    });

    await expect(
      updateComment('comment-1', {
        text: 'Updated',
        currentUserId: 'user-1',
      })
    ).resolves.toMatchObject({ text: 'Updated' });
  });

  it('rejects update attempts by non-authors', async () => {
    mockPrisma.comment.findFirst.mockResolvedValue(comment);

    await expect(
      updateComment('comment-1', {
        text: 'Updated',
        currentUserId: 'user-2',
      })
    ).rejects.toMatchObject({
      message: 'Only the comment author can modify this comment',
      status: 403,
    });
  });

  it('soft deletes a comment when requested by the author', async () => {
    mockPrisma.comment.findFirst.mockResolvedValue(comment);
    mockPrisma.comment.update.mockResolvedValue({
      ...comment,
      deletedAt: new Date('2026-05-06T10:00:00.000Z'),
    });

    await deleteComment('comment-1', { currentUserId: 'user-1' });

    expect(mockPrisma.comment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'comment-1' },
        data: { deletedAt: expect.any(Date) },
      })
    );
  });
});

const mockPrisma = {
  project: {
    findUnique: jest.fn(),
  },
  task: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  comment: {
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import {
  createTask,
  deleteTask,
  getTasksByProject,
  updateTaskStatus,
} from '../../../src/services/taskService';

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (operations: unknown[]) =>
      Promise.all(operations as Promise<unknown>[])
    );
  });

  it('creates a task for a valid project member', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      createdById: 'user-1',
      members: [{ userId: 'user-1' }, { userId: 'user-2' }],
    });
    mockPrisma.task.create.mockResolvedValue({
      id: 'task-1',
      projectId: 'project-1',
      title: 'Build board',
      description: 'Kanban UI',
      status: 'TO_DO',
      assigneeId: 'user-2',
      createdById: 'user-1',
    });

    await expect(
      createTask('project-1', {
        title: 'Build board',
        description: 'Kanban UI',
        assigneeId: 'user-2',
        createdById: 'user-1',
      })
    ).resolves.toMatchObject({ id: 'task-1' });

    expect(mockPrisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 'project-1',
          title: 'Build board',
          status: 'TO_DO',
          assigneeId: 'user-2',
          createdById: 'user-1',
        }),
      })
    );
  });

  it('rejects assignment to a user outside the project', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      createdById: 'user-1',
      members: [{ userId: 'user-1' }],
    });

    await expect(
      createTask('project-1', {
        title: 'Build board',
        assigneeId: 'user-99',
        createdById: 'user-1',
      })
    ).rejects.toMatchObject({
      message: 'Assignee must be a project member',
      status: 409,
    });
  });

  it('lists active tasks by project and status', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      createdById: 'user-1',
      members: [{ userId: 'user-1' }],
    });
    mockPrisma.task.findMany.mockResolvedValue([{ id: 'task-1' }]);

    await expect(
      getTasksByProject('project-1', { status: 'in_progress' })
    ).resolves.toEqual([{ id: 'task-1' }]);

    expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId: 'project-1',
          deletedAt: null,
          status: 'IN_PROGRESS',
        }),
      })
    );
  });

  it('returns the previous status when moving a task', async () => {
    mockPrisma.task.findFirst.mockResolvedValue({
      id: 'task-1',
      projectId: 'project-1',
      status: 'TO_DO',
    });
    mockPrisma.task.update.mockResolvedValue({
      id: 'task-1',
      projectId: 'project-1',
      status: 'IN_PROGRESS',
    });

    await expect(updateTaskStatus('task-1', 'in_progress')).resolves.toEqual({
      task: { id: 'task-1', projectId: 'project-1', status: 'IN_PROGRESS' },
      previousStatus: 'to_do',
    });
  });

  it('soft deletes a task and its comments', async () => {
    mockPrisma.task.findFirst.mockResolvedValue({
      id: 'task-1',
      projectId: 'project-1',
      status: 'TO_DO',
    });
    mockPrisma.task.update.mockResolvedValue({ id: 'task-1' });
    mockPrisma.comment.updateMany.mockResolvedValue({ count: 2 });

    await deleteTask('task-1');

    expect(mockPrisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'task-1' },
        data: { deletedAt: expect.any(Date) },
      })
    );
    expect(mockPrisma.comment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { taskId: 'task-1', deletedAt: null },
      })
    );
  });
});

const mockTaskService = {
  createTask: jest.fn(),
  getTask: jest.fn(),
  getTasksByProject: jest.fn(),
  updateTask: jest.fn(),
  updateTaskStatus: jest.fn(),
  deleteTask: jest.fn(),
  prismaToStatus: {
    TO_DO: 'to_do',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review',
    DONE: 'done',
  },
};

jest.mock('../../src/services/taskService', () => mockTaskService);

const mockRealtime = {
  emitTaskCreated: jest.fn(),
  emitTaskUpdated: jest.fn(),
  emitTaskMoved: jest.fn(),
  emitTaskDeleted: jest.fn(),
};

jest.mock('../../src/realtime/handlers', () => mockRealtime);

import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from '../../src/controllers/taskController';

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
}

const taskFixture = {
  id: 'task-1',
  projectId: 'project-1',
  title: 'Build task API',
  description: 'Create endpoints',
  status: 'TO_DO',
  assignee: {
    id: 'user-2',
    name: 'Bob Smith',
    role: 'ENGINEER',
    avatarUrl: null,
  },
  createdBy: {
    id: 'user-1',
    name: 'Alice Chen',
    role: 'PRODUCT_MANAGER',
    avatarUrl: null,
  },
  comments: [],
  createdAt: new Date('2026-05-06T10:00:00.000Z'),
  updatedAt: new Date('2026-05-06T10:00:00.000Z'),
};

describe('tasks workflow integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a task in a project', async () => {
    mockTaskService.createTask.mockResolvedValue(taskFixture);

    const res = createMockRes();
    await createTask(
      {
        params: { projectId: 'project-1' },
        body: {
          title: 'Build task API',
          description: 'Create endpoints',
          assigneeId: 'user-2',
        },
        header: jest.fn().mockReturnValue('user-1'),
      } as never,
      res as never
    );

    expect(mockTaskService.createTask).toHaveBeenCalledWith('project-1', {
      title: 'Build task API',
      description: 'Create endpoints',
      assigneeId: 'user-2',
      status: undefined,
      createdById: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        id: 'task-1',
        status: 'to_do',
        assignee: expect.objectContaining({ id: 'user-2' }),
      }),
    });
    expect(mockRealtime.emitTaskCreated).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({ id: 'task-1' })
    );
  });

  it('lists tasks for a project with a status filter', async () => {
    mockTaskService.getTasksByProject.mockResolvedValue([taskFixture]);

    const res = createMockRes();
    await listTasks(
      {
        params: { projectId: 'project-1' },
        query: { status: 'to_do' },
      } as never,
      res as never
    );

    expect(mockTaskService.getTasksByProject).toHaveBeenCalledWith(
      'project-1',
      {
        status: 'to_do',
        assigneeId: undefined,
        limit: undefined,
        offset: undefined,
      }
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [expect.objectContaining({ id: 'task-1', status: 'to_do' })],
    });
  });

  it('updates task status and emits a task moved event', async () => {
    mockTaskService.updateTaskStatus.mockResolvedValue({
      task: { ...taskFixture, status: 'IN_PROGRESS' },
      previousStatus: 'to_do',
    });

    const res = createMockRes();
    await updateTaskStatus(
      {
        params: { taskId: 'task-1' },
        body: { status: 'in_progress' },
      } as never,
      res as never
    );

    expect(mockTaskService.updateTaskStatus).toHaveBeenCalledWith(
      'task-1',
      'in_progress'
    );
    expect(mockRealtime.emitTaskMoved).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({
        taskId: 'task-1',
        fromStatus: 'to_do',
        toStatus: 'in_progress',
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({ id: 'task-1', status: 'in_progress' }),
    });
  });

  it('gets task details with comments', async () => {
    mockTaskService.getTask.mockResolvedValue({
      ...taskFixture,
      comments: [
        {
          id: 'comment-1',
          text: 'Ship it',
          author: taskFixture.createdBy,
          createdAt: new Date('2026-05-06T11:00:00.000Z'),
          updatedAt: new Date('2026-05-06T11:00:00.000Z'),
        },
      ],
    });

    const res = createMockRes();
    await getTask({ params: { taskId: 'task-1' } } as never, res as never);

    expect(mockTaskService.getTask).toHaveBeenCalledWith('task-1');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        id: 'task-1',
        comments: [
          expect.objectContaining({
            id: 'comment-1',
            text: 'Ship it',
            author: expect.objectContaining({ id: 'user-1' }),
          }),
        ],
      }),
    });
  });

  it('updates task details and emits an update event', async () => {
    mockTaskService.updateTask.mockResolvedValue({
      ...taskFixture,
      title: 'Updated title',
      assignee: null,
    });

    const res = createMockRes();
    await updateTask(
      {
        params: { taskId: 'task-1' },
        body: { title: 'Updated title', assigneeId: null },
      } as never,
      res as never
    );

    expect(mockTaskService.updateTask).toHaveBeenCalledWith('task-1', {
      title: 'Updated title',
      description: undefined,
      assigneeId: null,
      status: undefined,
    });
    expect(mockRealtime.emitTaskUpdated).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({ title: 'Updated title', assignee: null })
    );
  });

  it('deletes a task and emits a delete event', async () => {
    mockTaskService.deleteTask.mockResolvedValue([taskFixture]);

    const res = createMockRes();
    await deleteTask({ params: { taskId: 'task-1' } } as never, res as never);

    expect(mockTaskService.deleteTask).toHaveBeenCalledWith('task-1');
    expect(mockRealtime.emitTaskDeleted).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({ taskId: 'task-1', projectId: 'project-1' })
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('maps service errors to response status codes', async () => {
    mockTaskService.getTask.mockRejectedValue(
      Object.assign(new Error('Task not found'), { status: 404 })
    );

    const res = createMockRes();
    await getTask(
      { params: { taskId: 'missing-task' } } as never,
      res as never
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Task not found',
    });
  });
});

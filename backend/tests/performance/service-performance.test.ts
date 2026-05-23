const mockPrisma = {
  project: {
    findUnique: jest.fn(),
  },
  task: {
    findMany: jest.fn(),
  },
  comment: {
    create: jest.fn(),
  },
};

jest.mock('../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import { createComment } from '../../src/services/commentService';
import { getTasksByProject } from '../../src/services/taskService';

describe('critical backend path performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps task listing service overhead below the target budget', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      createdById: 'user-1',
      members: [{ userId: 'user-1' }],
    });
    mockPrisma.task.findMany.mockResolvedValue(
      Array.from({ length: 100 }, (_, index) => ({
        id: `task-${index}`,
        projectId: 'project-1',
      }))
    );

    const started = performance.now();
    const tasks = await getTasksByProject('project-1');
    const elapsedMs = performance.now() - started;

    expect(tasks).toHaveLength(100);
    expect(elapsedMs).toBeLessThan(50);
    expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100, skip: 0 })
    );
  });

  it('keeps comment creation service overhead below the target budget', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(undefined);
    mockPrisma.comment.create.mockResolvedValue({
      id: 'comment-1',
      taskId: 'task-1',
      authorId: 'user-1',
      text: 'Looks good',
    });

    const taskFindFirst = jest.fn().mockResolvedValue({
      id: 'task-1',
      project: { members: [{ userId: 'user-1' }] },
    });
    (mockPrisma as any).task = { findFirst: taskFindFirst };

    const started = performance.now();
    const comment = await createComment('task-1', {
      text: 'Looks good',
      authorId: 'user-1',
    });
    const elapsedMs = performance.now() - started;

    expect(comment).toEqual(expect.objectContaining({ id: 'comment-1' }));
    expect(elapsedMs).toBeLessThan(50);
  });
});

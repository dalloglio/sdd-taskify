const mockPrisma = {
  user: { count: jest.fn() },
  project: { count: jest.fn(), findMany: jest.fn() },
  task: { count: jest.fn() },
  comment: { count: jest.fn() },
};

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import {
  SAMPLE_PROJECT_NAMES,
  getSampleDataSummary,
} from '../../../src/services/sampleService';

describe('sampleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('summarizes predefined users, sample projects, tasks, and comments', async () => {
    mockPrisma.user.count.mockResolvedValue(5);
    mockPrisma.project.count.mockResolvedValue(3);
    mockPrisma.task.count.mockResolvedValue(18);
    mockPrisma.comment.count.mockResolvedValue(9);
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: 'project-1',
        name: 'Website Redesign',
        _count: { members: 3, tasks: 6 },
        tasks: [
          { id: 'task-1', _count: { comments: 2 } },
          { id: 'task-2', _count: { comments: 1 } },
        ],
      },
    ]);

    await expect(getSampleDataSummary()).resolves.toEqual({
      usersCount: 5,
      projectsCount: 3,
      tasksCount: 18,
      commentsCount: 9,
      sampleProjectNames: SAMPLE_PROJECT_NAMES,
      projects: [
        {
          id: 'project-1',
          name: 'Website Redesign',
          membersCount: 3,
          tasksCount: 6,
          commentsCount: 3,
        },
      ],
    });
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: { in: SAMPLE_PROJECT_NAMES } },
        orderBy: { createdAt: 'asc' },
      })
    );
  });
});

const mockPrisma = {
  user: {
    count: jest.fn(),
  },
  project: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  task: {
    count: jest.fn(),
  },
  comment: {
    count: jest.fn(),
  },
};

jest.mock('../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import { getSampleData } from '../../src/controllers/sampleController';

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('sample data integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.count.mockResolvedValue(5);
    mockPrisma.project.count.mockResolvedValue(3);
    mockPrisma.task.count.mockResolvedValue(15);
    mockPrisma.comment.count.mockResolvedValue(15);
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: 'project-1',
        name: 'Website Redesign',
        _count: { members: 5, tasks: 5 },
        tasks: [
          { id: 'task-1', _count: { comments: 2 } },
          { id: 'task-2', _count: { comments: 1 } },
        ],
      },
      {
        id: 'project-2',
        name: 'Mobile App v2',
        _count: { members: 5, tasks: 5 },
        tasks: [{ id: 'task-3', _count: { comments: 2 } }],
      },
      {
        id: 'project-3',
        name: 'API Refactor',
        _count: { members: 5, tasks: 5 },
        tasks: [{ id: 'task-4', _count: { comments: 1 } }],
      },
    ]);
  });

  it('loads exactly five sample users', async () => {
    const res = createMockRes();
    await getSampleData({} as never, res as never);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({ usersCount: 5 }),
    });
  });

  it('loads exactly three sample projects', async () => {
    const res = createMockRes();
    await getSampleData({} as never, res as never);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        projectsCount: 3,
        sampleProjectNames: [
          'Website Redesign',
          'Mobile App v2',
          'API Refactor',
        ],
      }),
    });
  });

  it('reports sample tasks for each project', async () => {
    const res = createMockRes();
    await getSampleData({} as never, res as never);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        tasksCount: 15,
        projects: expect.arrayContaining([
          expect.objectContaining({ name: 'Website Redesign', tasksCount: 5 }),
          expect.objectContaining({ name: 'Mobile App v2', tasksCount: 5 }),
          expect.objectContaining({ name: 'API Refactor', tasksCount: 5 }),
        ]),
      }),
    });
  });

  it('reports sample comments on tasks', async () => {
    const res = createMockRes();
    await getSampleData({} as never, res as never);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        commentsCount: 15,
        projects: expect.arrayContaining([
          expect.objectContaining({ id: 'project-1', commentsCount: 3 }),
        ]),
      }),
    });
  });
});

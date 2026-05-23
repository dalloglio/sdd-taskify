const mockPrisma = {
  project: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  projectMember: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import {
  addMember,
  createProject,
  getProject,
  listProjects,
} from '../../src/controllers/projectController';

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('projects workflow integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (operations: unknown[]) =>
      Promise.all(operations as Promise<unknown>[])
    );
  });

  it('creates a project with valid data', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null);
    mockPrisma.user.findMany.mockResolvedValue([
      { id: '11111111-1111-4111-8111-111111111111' },
      { id: '22222222-2222-4222-8222-222222222222' },
    ]);
    mockPrisma.project.create.mockResolvedValue({
      id: 'project-1',
      name: 'New Website',
      description: 'Launch workstream',
      createdAt: new Date('2026-05-06T12:00:00.000Z'),
      createdById: '11111111-1111-4111-8111-111111111111',
    });
    mockPrisma.projectMember.create.mockImplementation(
      async ({ data }: { data: { projectId: string; userId: string } }) => data
    );

    const res = createMockRes();
    await createProject(
      {
        body: {
          name: 'New Website',
          description: 'Launch workstream',
          memberIds: [
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
          ],
        },
      } as never,
      res as never
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        id: 'project-1',
        name: 'New Website',
        description: 'Launch workstream',
        createdAt: '2026-05-06T12:00:00.000Z',
        members: [],
      },
    });
    expect(mockPrisma.project.create).toHaveBeenCalledWith({
      data: {
        name: 'New Website',
        description: 'Launch workstream',
        createdById: '11111111-1111-4111-8111-111111111111',
      },
    });
    expect(mockPrisma.projectMember.create).toHaveBeenCalledTimes(2);
  });

  it('adds a team member to an existing project', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      name: 'New Website',
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Carol Johnson',
    });
    mockPrisma.projectMember.findUnique.mockResolvedValue(null);
    mockPrisma.projectMember.create.mockResolvedValue({
      projectId: 'project-1',
      userId: '33333333-3333-4333-8333-333333333333',
    });

    const res = createMockRes();
    await addMember(
      {
        params: { projectId: 'project-1' },
        body: { userId: '33333333-3333-4333-8333-333333333333' },
      } as never,
      res as never
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        projectId: 'project-1',
        userId: '33333333-3333-4333-8333-333333333333',
      },
    });
    expect(mockPrisma.projectMember.create).toHaveBeenCalledWith({
      data: {
        projectId: 'project-1',
        userId: '33333333-3333-4333-8333-333333333333',
      },
    });
  });

  it('returns 404 when adding a member to a missing project', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: '33333333-3333-4333-8333-333333333333',
    });

    const res = createMockRes();
    await addMember(
      {
        params: { projectId: 'missing-project' },
        body: { userId: '33333333-3333-4333-8333-333333333333' },
      } as never,
      res as never
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Project not found',
    });
  });

  it('lists projects with member information', async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: 'project-1',
        name: 'Website Redesign',
        description: 'Revamp landing pages',
        createdAt: new Date('2026-05-05T10:00:00.000Z'),
        members: [
          {
            user: {
              id: '11111111-1111-4111-8111-111111111111',
              name: 'Alice Chen',
              avatarUrl: 'https://example.com/alice.png',
            },
          },
        ],
      },
    ]);

    const res = createMockRes();
    await listProjects({} as never, res as never);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        {
          id: 'project-1',
          name: 'Website Redesign',
          description: 'Revamp landing pages',
          createdAt: '2026-05-05T10:00:00.000Z',
          isSample: true,
          members: [
            {
              id: '11111111-1111-4111-8111-111111111111',
              name: 'Alice Chen',
              avatarUrl: 'https://example.com/alice.png',
            },
          ],
        },
      ],
    });
  });

  it('gets a project with team members', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      name: 'Website Redesign',
      description: 'Revamp landing pages',
      createdAt: new Date('2026-05-05T10:00:00.000Z'),
      members: [
        {
          user: {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'Alice Chen',
            avatarUrl: null,
          },
        },
      ],
      tasks: [],
    });

    const res = createMockRes();
    await getProject(
      { params: { projectId: 'project-1' } } as never,
      res as never
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        id: 'project-1',
        isSample: true,
        members: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'Alice Chen',
            avatarUrl: null,
          },
        ],
      }),
    });
  });

  it('returns 404 for a missing project details request', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);

    const res = createMockRes();
    await getProject(
      { params: { projectId: 'missing-project' } } as never,
      res as never
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Project not found',
    });
  });
});

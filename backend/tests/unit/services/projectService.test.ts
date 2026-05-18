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

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import {
  addProjectMember,
  createProject,
  getAllProjects,
} from '../../../src/services/projectService';

describe('projectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (operations: unknown[]) =>
      Promise.all(operations as Promise<unknown>[])
    );
  });

  it('creates a project, de-duplicates members, and uses the first member as owner', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null);
    mockPrisma.user.findMany.mockResolvedValue([
      { id: 'user-1' },
      { id: 'user-2' },
    ]);
    mockPrisma.project.create.mockResolvedValue({
      id: 'project-1',
      name: 'Marketing Launch',
      description: 'Launch plan',
      createdAt: new Date('2026-05-06T12:00:00.000Z'),
      createdById: 'user-1',
    });
    mockPrisma.projectMember.create.mockImplementation(
      async ({ data }: { data: { projectId: string; userId: string } }) => data
    );

    const project = await createProject({
      name: 'Marketing Launch',
      description: 'Launch plan',
      memberIds: ['user-1', 'user-1', 'user-2'],
    });

    expect(project).toEqual({
      id: 'project-1',
      name: 'Marketing Launch',
      description: 'Launch plan',
      createdAt: new Date('2026-05-06T12:00:00.000Z'),
      createdById: 'user-1',
    });
    expect(mockPrisma.project.create).toHaveBeenCalledWith({
      data: {
        name: 'Marketing Launch',
        description: 'Launch plan',
        createdById: 'user-1',
      },
    });
    expect(mockPrisma.projectMember.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['user-1', 'user-2'] } },
      select: { id: true },
    });
  });

  it('falls back to the first user when no members are supplied', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null);
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'owner-1' });
    mockPrisma.project.create.mockResolvedValue({
      id: 'project-2',
      name: 'Support Queue',
      description: null,
      createdAt: new Date('2026-05-06T13:00:00.000Z'),
      createdById: 'owner-1',
    });

    const project = await createProject({ name: 'Support Queue' });

    expect(project.createdById).toBe('owner-1');
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      select: { id: true },
    });
  });

  it('rejects duplicate project names', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'existing-project' });

    await expect(
      createProject({ name: 'Duplicate Name' })
    ).rejects.toMatchObject({
      message: 'Project name already exists',
      status: 409,
    });
  });

  it('returns projects with member details', async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: 'project-1',
        name: 'Website Redesign',
        members: [{ user: { id: 'user-1', name: 'Alice' } }],
      },
    ]);

    await expect(getAllProjects()).resolves.toEqual([
      {
        id: 'project-1',
        name: 'Website Redesign',
        members: [{ user: { id: 'user-1', name: 'Alice' } }],
      },
    ]);
  });

  it('adds a project member when the project and user exist', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      name: 'Website Redesign',
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-3',
      name: 'Carol',
    });
    mockPrisma.projectMember.findUnique.mockResolvedValue(null);
    mockPrisma.projectMember.create.mockResolvedValue({
      projectId: 'project-1',
      userId: 'user-3',
    });

    await expect(addProjectMember('project-1', 'user-3')).resolves.toEqual({
      projectId: 'project-1',
      userId: 'user-3',
    });
  });

  it('rejects an already assigned project member', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      name: 'Website Redesign',
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-3',
      name: 'Carol',
    });
    mockPrisma.projectMember.findUnique.mockResolvedValue({
      projectId: 'project-1',
      userId: 'user-3',
    });

    await expect(addProjectMember('project-1', 'user-3')).rejects.toMatchObject(
      {
        message: 'User is already a project member',
        status: 409,
      }
    );
  });
});

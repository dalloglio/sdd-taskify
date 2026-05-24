const mockPrisma = {
  projectMember: {
    findUnique: jest.fn(),
  },
  task: {
    findFirst: jest.fn(),
  },
  comment: {
    findFirst: jest.fn(),
  },
};

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import {
  requireProjectMember,
  requireTaskProjectMember,
} from '../../../src/middleware/projectAccess';

const userId = '11111111-1111-4111-8111-111111111111';
const projectId = '22222222-2222-4222-8222-222222222222';
const taskId = '33333333-3333-4333-8333-333333333333';

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('project access middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows current project members through project-scoped routes', async () => {
    mockPrisma.projectMember.findUnique.mockResolvedValue({ projectId });
    const next = jest.fn();
    const res = createMockRes();

    await requireProjectMember()(
      {
        params: { projectId },
        body: {},
        header: jest.fn().mockReturnValue(userId),
      } as never,
      res as never,
      next
    );

    expect(mockPrisma.projectMember.findUnique).toHaveBeenCalledWith({
      where: { projectId_userId: { projectId, userId } },
      select: { projectId: true },
    });
    expect(next).toHaveBeenCalled();
  });

  it('rejects non-members from project-scoped routes', async () => {
    mockPrisma.projectMember.findUnique.mockResolvedValue(null);
    const next = jest.fn();
    const res = createMockRes();

    await requireProjectMember()(
      {
        params: { projectId },
        body: {},
        header: jest.fn().mockReturnValue(userId),
      } as never,
      res as never,
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Current user is not a project member',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('resolves task project membership before allowing task access', async () => {
    mockPrisma.task.findFirst.mockResolvedValue({ projectId });
    mockPrisma.projectMember.findUnique.mockResolvedValue({ projectId });
    const next = jest.fn();
    const res = createMockRes();

    await requireTaskProjectMember()(
      {
        params: { taskId },
        body: {},
        header: jest.fn().mockReturnValue(userId),
      } as never,
      res as never,
      next
    );

    expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
      where: { id: taskId, deletedAt: null },
      select: { projectId: true },
    });
    expect(next).toHaveBeenCalled();
  });
});

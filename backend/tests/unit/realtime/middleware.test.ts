const mockPrisma = {
  projectMember: {
    findUnique: jest.fn(),
  },
};

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import { validateProjectMembership } from '../../../src/realtime/middleware';

const userId = '11111111-1111-4111-8111-111111111111';
const projectId = '22222222-2222-4222-8222-222222222222';

describe('Socket.IO security middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows sockets with a user that belongs to the requested project', async () => {
    mockPrisma.projectMember.findUnique.mockResolvedValue({ projectId });

    await expect(
      validateProjectMembership(
        {
          handshake: { auth: { userId }, query: {} },
        } as never,
        projectId
      )
    ).resolves.toBe(true);
  });

  it('rejects sockets without a valid user id', async () => {
    await expect(
      validateProjectMembership(
        {
          handshake: { auth: {}, query: {} },
        } as never,
        projectId
      )
    ).resolves.toBe(false);

    expect(mockPrisma.projectMember.findUnique).not.toHaveBeenCalled();
  });
});

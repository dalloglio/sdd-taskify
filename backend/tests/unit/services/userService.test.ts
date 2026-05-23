const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: mockPrisma,
}));

import {
  getAllUsers,
  getUserById,
  getUsersByIds,
} from '../../../src/services/userService';

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists predefined users with public profile fields only', async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        name: 'Alice Chen',
        avatarUrl: null,
        role: 'PRODUCT_MANAGER',
      },
    ]);

    await expect(getAllUsers()).resolves.toEqual([
      {
        id: 'user-1',
        name: 'Alice Chen',
        avatarUrl: null,
        role: 'PRODUCT_MANAGER',
      },
    ]);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true, avatarUrl: true, role: true },
    });
  });

  it('gets one user by id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2' });

    await expect(getUserById('user-2')).resolves.toEqual({ id: 'user-2' });
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-2' },
    });
  });

  it('gets users by ids', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]);

    await expect(getUsersByIds(['user-1', 'user-2'])).resolves.toEqual([
      { id: 'user-1' },
    ]);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['user-1', 'user-2'] } },
    });
  });
});

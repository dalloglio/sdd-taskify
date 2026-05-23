const mockUserService = {
  getAllUsers: jest.fn(),
};

jest.mock('../../src/services/userService', () => mockUserService);

import { getUsers } from '../../src/controllers/userController';

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('users integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the predefined users list', async () => {
    mockUserService.getAllUsers.mockResolvedValue([
      {
        id: 'user-1',
        name: 'Alice Chen',
        role: 'PRODUCT_MANAGER',
        avatarUrl: null,
      },
    ]);

    const res = createMockRes();
    await getUsers({} as never, res as never);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        {
          id: 'user-1',
          name: 'Alice Chen',
          role: 'PRODUCT_MANAGER',
          avatarUrl: null,
        },
      ],
    });
  });

  it('returns an error response when user loading fails', async () => {
    mockUserService.getAllUsers.mockRejectedValue(new Error('db unavailable'));

    const res = createMockRes();
    await getUsers({} as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'db unavailable',
    });
  });
});

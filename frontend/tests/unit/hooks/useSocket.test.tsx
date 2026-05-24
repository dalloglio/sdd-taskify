import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSocket } from '../../../src/hooks/useSocket';

const socketMocks = vi.hoisted(() => ({
  off: vi.fn(),
  on: vi.fn(),
  closeSocket: vi.fn(),
}));

vi.mock('../../../src/services/socket', () => ({
  initSocket: vi.fn(() => ({ on: socketMocks.on, off: socketMocks.off })),
  closeSocket: socketMocks.closeSocket,
}));

describe('useSocket', () => {
  it('removes its own listeners without closing the shared socket', () => {
    const listener = vi.fn();
    const { unmount } = renderHook(() =>
      useSocket('project-1', { 'task:created': listener })
    );

    expect(socketMocks.on).toHaveBeenCalledWith('task:created', listener);

    unmount();

    expect(socketMocks.off).toHaveBeenCalledWith('task:created', listener);
    expect(socketMocks.closeSocket).not.toHaveBeenCalled();
  });
});

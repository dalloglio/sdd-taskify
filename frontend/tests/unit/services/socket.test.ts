import { describe, expect, it, vi } from 'vitest';

const handlers = new Map<string, (...args: any[]) => void>();
const managerHandlers = new Map<string, (...args: any[]) => void>();
const emit = vi.fn();
const connect = vi.fn();
const disconnect = vi.fn();
const removeAllListeners = vi.fn();

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connected: false,
    connect,
    disconnect,
    emit,
    on: vi.fn((event: string, handler: (...args: any[]) => void) => {
      handlers.set(event, handler);
    }),
    removeAllListeners,
    io: {
      on: vi.fn((event: string, handler: (...args: any[]) => void) => {
        managerHandlers.set(event, handler);
      }),
      removeAllListeners,
    },
  })),
}));

describe('socket service resilience', () => {
  it('reports reconnecting and rejoins the active project after reconnect', async () => {
    const { closeSocket, initSocket, onSocketStatusChange } = await import(
      '../../../src/services/socket'
    );
    const statuses: string[] = [];
    const unsubscribe = onSocketStatusChange((status) => statuses.push(status));

    initSocket({ projectId: 'project-1' });
    managerHandlers.get('reconnect_attempt')?.(1);
    handlers.get('connect')?.();

    expect(statuses).toEqual(['reconnecting', 'connected']);
    expect(emit).toHaveBeenCalledWith('join_project', { projectId: 'project-1' });

    unsubscribe();
    closeSocket();
  });
});

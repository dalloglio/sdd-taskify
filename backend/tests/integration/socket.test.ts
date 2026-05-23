const mockTo = jest.fn();
const mockEmit = jest.fn();

jest.mock('../../src/realtime/socket-server', () => ({
  getIo: () => ({
    to: mockTo,
  }),
}));

import {
  emitCommentAdded,
  emitTaskMoved,
  registerRealtimeHandlers,
} from '../../src/realtime/handlers';

describe('Socket.IO task events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTo.mockReturnValue({ emit: mockEmit });
  });

  it('emits task move events to the project room from API helpers', () => {
    emitTaskMoved('project-1', {
      taskId: 'task-1',
      projectId: 'project-1',
      fromStatus: 'to_do',
      toStatus: 'done',
    });

    expect(mockTo).toHaveBeenCalledWith('project-project-1');
    expect(mockEmit).toHaveBeenCalledWith(
      'task:moved',
      expect.objectContaining({ taskId: 'task-1', toStatus: 'done' })
    );
  });

  it('validates task event payloads from socket clients', () => {
    const handlers: Record<string, (payload: unknown) => void> = {};
    const socket = {
      on: jest.fn((event: string, handler: (payload: unknown) => void) => {
        handlers[event] = handler;
      }),
      to: jest.fn().mockReturnValue({ emit: mockEmit }),
      emit: jest.fn(),
    };

    registerRealtimeHandlers(socket as never);
    handlers['task:move']?.({ taskId: 'task-1' });

    expect(socket.emit).toHaveBeenCalledWith('task:error', {
      error: 'projectId is required',
    });
    expect(socket.to).not.toHaveBeenCalled();
  });

  it('emits comment events to the project room from API helpers', () => {
    emitCommentAdded('project-1', {
      commentId: 'comment-1',
      taskId: 'task-1',
      projectId: 'project-1',
      text: 'Looks good',
    });

    expect(mockTo).toHaveBeenCalledWith('project-project-1');
    expect(mockEmit).toHaveBeenCalledWith(
      'comment:added',
      expect.objectContaining({ commentId: 'comment-1', taskId: 'task-1' })
    );
  });

  it('validates comment event payloads from socket clients', () => {
    const handlers: Record<string, (payload: unknown) => void> = {};
    const socket = {
      on: jest.fn((event: string, handler: (payload: unknown) => void) => {
        handlers[event] = handler;
      }),
      to: jest.fn().mockReturnValue({ emit: mockEmit }),
      emit: jest.fn(),
    };

    registerRealtimeHandlers(socket as never);
    handlers['comment:create']?.({ commentId: 'comment-1' });

    expect(socket.emit).toHaveBeenCalledWith('comment:error', {
      error: 'projectId is required',
    });
    expect(socket.to).not.toHaveBeenCalled();
  });
});

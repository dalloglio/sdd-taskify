import { Socket } from 'socket.io';
import { getIo } from './socket-server';

type TaskEventPayload = {
  projectId?: string;
  taskId?: string;
  [key: string]: unknown;
};

type ValidTaskEventPayload = TaskEventPayload & { projectId: string };

function projectRoom(projectId: string) {
  return `project-${projectId}`;
}

function isTaskEventPayload(
  payload: unknown
): payload is ValidTaskEventPayload {
  return Boolean(
    payload &&
    typeof payload === 'object' &&
    'projectId' in payload &&
    typeof (payload as TaskEventPayload).projectId === 'string'
  );
}

function emitFromApi(event: string, projectId: string, payload: unknown) {
  try {
    getIo().to(projectRoom(projectId)).emit(event, payload);
  } catch {
    // API writes should not fail when Socket.IO is not initialized in tests.
  }
}

export function emitTaskCreated(projectId: string, payload: unknown) {
  emitFromApi('task:created', projectId, payload);
}

export function emitTaskUpdated(projectId: string, payload: unknown) {
  emitFromApi('task:updated', projectId, payload);
}

export function emitTaskMoved(projectId: string, payload: unknown) {
  emitFromApi('task:moved', projectId, payload);
}

export function emitTaskDeleted(projectId: string, payload: unknown) {
  emitFromApi('task:deleted', projectId, payload);
}

export function registerRealtimeHandlers(socket: Socket) {
  socket.on('task:create', (payload) => {
    if (!isTaskEventPayload(payload)) {
      socket.emit('task:error', { error: 'projectId is required' });
      return;
    }
    socket.to(projectRoom(payload.projectId)).emit('task:created', payload);
  });

  socket.on('task:update', (payload) => {
    if (!isTaskEventPayload(payload)) {
      socket.emit('task:error', { error: 'projectId is required' });
      return;
    }
    socket.to(projectRoom(payload.projectId)).emit('task:updated', payload);
  });

  socket.on('task:move', (payload) => {
    if (!isTaskEventPayload(payload)) {
      socket.emit('task:error', { error: 'projectId is required' });
      return;
    }
    socket.to(projectRoom(payload.projectId)).emit('task:moved', payload);
  });

  socket.on('task:delete', (payload) => {
    if (!isTaskEventPayload(payload)) {
      socket.emit('task:error', { error: 'projectId is required' });
      return;
    }
    socket.to(projectRoom(payload.projectId)).emit('task:deleted', payload);
  });
}

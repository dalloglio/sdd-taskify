import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { createCorsOptions } from '../config/security';
import { registerRealtimeHandlers } from './handlers';
import { validateProjectMembership } from './middleware';

let io: IOServer | null = null;

export function initSocketServer(server: HttpServer) {
  io = new IOServer(server, {
    cors: createCorsOptions(),
  });

  io.on('connection', (socket: Socket) => {
    socket.on('joinProject', () => {
      socket.emit('project:error', {
        error: 'Use join_project with projectId and authenticated user context',
      });
    });
    socket.on('join_project', async (payload: { projectId?: string }) => {
      if (!payload.projectId) {
        socket.emit('project:error', { error: 'projectId is required' });
        return;
      }
      const isMember = await validateProjectMembership(
        socket,
        payload.projectId
      );
      if (!isMember) {
        socket.emit('project:error', {
          error: 'Current user is not a project member',
        });
        return;
      }

      const room = `project-${payload.projectId}`;
      socket.join(room);
      socket.emit('project:joined', {
        projectId: payload.projectId,
        message: 'Joined project room',
        timestamp: new Date().toISOString(),
      });
    });

    registerRealtimeHandlers(socket);
  });
}

export function getIo() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

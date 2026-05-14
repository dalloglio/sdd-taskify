import { Socket } from 'socket.io';

export function registerRealtimeHandlers(socket: Socket) {
  socket.on('task:create', (payload) => {
    // Broadcast to project room - payload should include projectId
    const room = `project-${payload.projectId}`;
    socket.to(room).emit('task:created', payload);
  });

  socket.on('task:update', (payload) => {
    const room = `project-${payload.projectId}`;
    socket.to(room).emit('task:updated', payload);
  });

  socket.on('task:move', (payload) => {
    const room = `project-${payload.projectId}`;
    socket.to(room).emit('task:moved', payload);
  });
}

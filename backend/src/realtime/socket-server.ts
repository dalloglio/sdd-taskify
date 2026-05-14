import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { registerRealtimeHandlers } from './handlers';

let io: IOServer | null = null;

export function initSocketServer(server: HttpServer) {
  io = new IOServer(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*' },
  });

  io.on('connection', (socket: Socket) => {
    // eslint-disable-next-line no-console
    console.log('Socket connected', socket.id);
    socket.on('joinProject', (room: string) => {
      socket.join(room);
      // eslint-disable-next-line no-console
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    registerRealtimeHandlers(socket);
  });
}

export function getIo() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(options?: { projectId?: string }) {
  if (!socket) {
    const url =
      (import.meta.env.VITE_WEBSOCKET_URL as string) || 'http://localhost:4000';
    socket = io(url, {
      autoConnect: false,
    });
  }

  if (options?.projectId && socket) {
    socket.auth = { projectId: options.projectId };
  }

  socket.connect();
  return socket;
}

export function getSocket(): Socket {
  if (!socket)
    throw new Error('Socket not initialized. Call initSocket first.');
  return socket;
}

export function closeSocket() {
  socket?.disconnect();
  socket = null;
}

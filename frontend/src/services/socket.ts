import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let activeProjectId: string | null = null;

function joinActiveProject() {
  if (!socket || !activeProjectId) return;
  socket.emit('join_project', { projectId: activeProjectId });
}

export function initSocket(options?: { projectId?: string }) {
  if (!socket) {
    const url =
      (import.meta.env.VITE_WEBSOCKET_URL as string) || 'http://localhost:3000';
    socket = io(url, {
      autoConnect: false,
    });
    socket.on('connect', joinActiveProject);
  }

  if (options?.projectId) {
    activeProjectId = options.projectId;
    if (socket.connected) {
      joinActiveProject();
    }
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
  if (socket) {
    socket.off('connect', joinActiveProject);
  }
  socket?.disconnect();
  socket = null;
  activeProjectId = null;
}

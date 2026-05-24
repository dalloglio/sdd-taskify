import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let activeProjectId: string | null = null;
let reconnectAttempts = 0;

export type SocketStatus =
  | 'idle'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

type SocketStatusListener = (status: SocketStatus) => void;
const statusListeners = new Set<SocketStatusListener>();

function notifyStatus(status: SocketStatus) {
  statusListeners.forEach((listener) => listener(status));
}

function joinActiveProject() {
  if (!socket || !activeProjectId) return;
  socket.emit('join_project', { projectId: activeProjectId });
}

export function onSocketStatusChange(listener: SocketStatusListener) {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

export function initSocket(options?: { projectId?: string }) {
  if (!socket) {
    const url =
      (import.meta.env.VITE_WEBSOCKET_URL as string) || 'http://localhost:3000';
    socket = io(url, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });
    socket.on('connect', () => {
      reconnectAttempts = 0;
      notifyStatus('connected');
      joinActiveProject();
    });
    socket.io.on('reconnect_attempt', (attempt) => {
      reconnectAttempts = attempt;
      notifyStatus('reconnecting');
    });
    socket.io.on('reconnect_failed', () => {
      notifyStatus('failed');
    });
    socket.on('disconnect', () => {
      notifyStatus(reconnectAttempts > 0 ? 'reconnecting' : 'disconnected');
    });
    socket.on('connect_error', () => {
      notifyStatus('reconnecting');
    });
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
    socket.removeAllListeners();
    socket.io.removeAllListeners('reconnect_attempt');
    socket.io.removeAllListeners('reconnect_failed');
  }
  socket?.disconnect();
  socket = null;
  activeProjectId = null;
  reconnectAttempts = 0;
  notifyStatus('idle');
}

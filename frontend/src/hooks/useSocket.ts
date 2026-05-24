import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket } from '../services/socket';

type ListenerMap = Record<string, (...args: any[]) => void>;

export function useSocket(projectId?: string, listeners?: ListenerMap) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = initSocket({ projectId });

    const s = socketRef.current;
    if (listeners) {
      Object.entries(listeners).forEach(([event, handler]) => {
        s.on(event, handler);
      });
    }

    return () => {
      if (listeners) {
        Object.entries(listeners).forEach(([event, handler]) => {
          s.off(event, handler);
        });
      }
    };
  }, [projectId]);

  return socketRef;
}

export default useSocket;

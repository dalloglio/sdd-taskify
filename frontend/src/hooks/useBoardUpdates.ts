import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { Task } from '../types/models';

type MovePayload = {
  taskId: string;
  toStatus: Task['status'];
};

type DeletePayload = {
  taskId: string;
};

function upsertTask(tasks: Task[] | undefined, task: Task) {
  if (!tasks) return [task];
  const exists = tasks.some((item) => item.id === task.id);
  return exists
    ? tasks.map((item) => (item.id === task.id ? task : item))
    : [...tasks, task];
}

export function useBoardUpdates(projectId?: string) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  useSocket(projectId, {
    'task:created': (task: Task) => {
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        upsertTask(old, task)
      );
      setMessage('Task created');
    },
    'task:updated': (task: Task) => {
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        upsertTask(old, task)
      );
      setMessage('Task updated');
    },
    'task:moved': (payload: MovePayload) => {
      queryClient.setQueryData<Task[] | undefined>(
        ['tasks', projectId],
        (old) =>
          old
            ? old.map((task) =>
                task.id === payload.taskId
                  ? { ...task, status: payload.toStatus }
                  : task
              )
            : old
      );
      setMessage('Task moved');
    },
    'task:deleted': (payload: DeletePayload) => {
      queryClient.setQueryData<Task[] | undefined>(
        ['tasks', projectId],
        (old) => (old ? old.filter((task) => task.id !== payload.taskId) : old)
      );
      setMessage('Task deleted');
    },
    'task:error': () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setMessage('Board update failed');
    },
  });

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 2500);
    return () => window.clearTimeout(timer);
  }, [message]);

  return { message };
}

export default useBoardUpdates;

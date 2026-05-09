import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ApiResponse } from '../types/api';
import { Task } from '../types/models';

export function useGetTasks(projectId?: string) {
  return useQuery<Task[]>(
    ['tasks', projectId],
    async () => {
      if (!projectId) return [];
      const res = await api.get<ApiResponse<Task[]>>(
        `/projects/${projectId}/tasks`
      );
      return res.data.data;
    },
    {
      enabled: !!projectId,
    }
  );
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation(
    async (payload: {
      title: string;
      description?: string;
      assigneeId?: string;
    }) => {
      const res = await api.post<ApiResponse<Task>>(
        `/projects/${projectId}/tasks`,
        payload
      );
      return res.data.data;
    },
    {
      onMutate: async (newTask) => {
        await qc.cancelQueries(['tasks', projectId]);
        const previous = qc.getQueryData<Task[]>(['tasks', projectId]);
        const optimistic: Task = {
          id: `temp-${Date.now()}`,
          title: newTask.title,
          description: newTask.description,
          assignee: null,
          status: 'todo',
          projectId,
          createdAt: new Date().toISOString(),
        };
        qc.setQueryData<Task[]>(['tasks', projectId], (old) =>
          old ? [optimistic, ...old] : [optimistic]
        );
        return { previous };
      },
      onError: (err, newTask, context: any) => {
        if (context?.previous)
          qc.setQueryData(['tasks', projectId], context.previous);
      },
      onSettled: () => qc.invalidateQueries(['tasks', projectId]),
    }
  );
}

export function useUpdateTaskStatus(projectId: string) {
  const qc = useQueryClient();
  return useMutation(
    async ({ taskId, status }: { taskId: string; status: string }) => {
      const res = await api.patch<ApiResponse<Task>>(
        `/tasks/${taskId}/status`,
        { status }
      );
      return res.data.data;
    },
    {
      onMutate: async ({ taskId, status }) => {
        await qc.cancelQueries(['tasks', projectId]);
        const previous = qc.getQueryData<Task[]>(['tasks', projectId]);
        qc.setQueryData<Task[] | undefined>(['tasks', projectId], (old) =>
          old ? old.map((t) => (t.id === taskId ? { ...t, status } : t)) : old
        );
        return { previous };
      },
      onError: (err, vars, context: any) => {
        if (context?.previous)
          qc.setQueryData(['tasks', projectId], context.previous);
      },
      onSettled: () => qc.invalidateQueries(['tasks', projectId]),
    }
  );
}

export default useGetTasks;

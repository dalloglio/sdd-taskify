import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ApiResponse } from '../types/api';
import { Task, TaskStatus } from '../types/models';
import { getErrorMessage, retryRecoverable } from '../utils/errors';

export function useGetTasks(projectId?: string) {
  return useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await api.get<ApiResponse<Task[]>>(
        `/projects/${projectId}/tasks`
      );
      return res.data.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      assigneeId?: string | null;
      createdById?: string;
    }) => {
      const res = await retryRecoverable(() =>
        api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, payload)
      );
      return res.data.data;
    },
    onMutate: async (newTask) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = qc.getQueryData<Task[]>(['tasks', projectId]);
      const optimistic: Task = {
        id: `temp-${Date.now()}`,
        title: newTask.title,
        description: newTask.description,
        assignee: null,
        status: 'to_do',
        projectId,
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old ? [optimistic, ...old] : [optimistic]
      );
      return { previous };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previous)
        qc.setQueryData(['tasks', projectId], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useUpdateTaskStatus(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
    }) => {
      const res = await retryRecoverable(() =>
        api.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status })
      );
      return res.data.data;
    },
    onMutate: async ({ taskId, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = qc.getQueryData<Task[]>(['tasks', projectId]);
      qc.setQueryData<Task[] | undefined>(['tasks', projectId], (old) =>
        old ? old.map((t) => (t.id === taskId ? { ...t, status } : t)) : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        qc.setQueryData(['tasks', projectId], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      ...payload
    }: {
      taskId: string;
      title?: string;
      description?: string | null;
      assigneeId?: string | null;
      status?: TaskStatus;
    }) => {
      const res = await retryRecoverable(() =>
        api.patch<ApiResponse<Task>>(`/tasks/${taskId}`, payload)
      );
      return res.data.data;
    },
    onMutate: async ({ taskId, ...payload }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = qc.getQueryData<Task[]>(['tasks', projectId]);
      qc.setQueryData<Task[] | undefined>(['tasks', projectId], (old) =>
        old
          ? old.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    title: payload.title ?? task.title,
                    description:
                      payload.description === undefined
                        ? task.description
                        : (payload.description ?? undefined),
                    status: payload.status ?? task.status,
                  }
                : task
            )
          : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        qc.setQueryData(['tasks', projectId], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await retryRecoverable(() => api.delete(`/tasks/${taskId}`));
      return taskId;
    },
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = qc.getQueryData<Task[]>(['tasks', projectId]);
      qc.setQueryData<Task[] | undefined>(['tasks', projectId], (old) =>
        old ? old.filter((task) => task.id !== taskId) : old
      );
      return { previous };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previous)
        qc.setQueryData(['tasks', projectId], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export { getErrorMessage };

export default useGetTasks;

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ApiResponse } from '../types/api';
import { Project } from '../types/models';

export function useGetProjects() {
  return useQuery<Project[]>(['projects'], async () => {
    const res = await api.get<ApiResponse<Project[]>>('/projects');
    return res.data.data;
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation(
    async (payload: {
      name: string;
      description?: string;
      memberIds?: string[];
    }) => {
      const res = await api.post<ApiResponse<Project>>('/projects', payload);
      return res.data.data;
    },
    {
      onMutate: async (newProject) => {
        await qc.cancelQueries(['projects']);
        const prev = qc.getQueryData<Project[]>(['projects']);
        const optimistic: Project = {
          id: `optimistic-${Date.now()}`,
          name: newProject.name,
          description: newProject.description,
          members: [],
          createdAt: new Date().toISOString(),
        } as Project;
        if (prev)
          qc.setQueryData<Project[]>(['projects'], [optimistic, ...prev]);
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev) qc.setQueryData(['projects'], ctx.prev);
      },
      onSettled: () => qc.invalidateQueries(['projects']),
    }
  );
}

export function useAddProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation(
    async (payload: { userId: string }) => {
      const res = await api.post<ApiResponse<any>>(
        `/projects/${projectId}/members`,
        payload
      );
      return res.data.data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['projects']);
        qc.invalidateQueries(['project', projectId]);
      },
    }
  );
}

export default useGetProjects;

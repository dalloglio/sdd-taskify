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
      onSuccess: () => qc.invalidateQueries(['projects']),
    }
  );
}

export default useGetProjects;

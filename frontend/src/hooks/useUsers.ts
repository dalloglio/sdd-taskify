import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ApiResponse } from '../types/api';
import { User } from '../types/models';

export function useGetUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User[]>>('/users');
      return res.data.data;
    },
  });
}

export default useGetUsers;

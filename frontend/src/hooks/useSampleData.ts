import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ApiResponse } from '../types/api';
import { SampleDataSummary } from '../types/sampleData';

export function useSampleData() {
  return useQuery<SampleDataSummary>({
    queryKey: ['sample-data'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SampleDataSummary>>('/sample-data');
      return res.data.data;
    },
  });
}

export default useSampleData;

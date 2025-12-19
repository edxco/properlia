import { useQuery } from '@tanstack/react-query';
import { propertyApi } from './api';

interface UsePropertiesParams {
  page?: number;
  items?: number;
}

export const useStatus = (params?: UsePropertiesParams) => {
  return useQuery({
    queryKey: ['statuses', params],
    queryFn: () => propertyApi.getAll(params),
  });
};
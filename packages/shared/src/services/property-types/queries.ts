import { useQuery } from '@tanstack/react-query';
import { propertyTypeApi } from './api';

interface UsePropertyTypesParams {
  page?: number;
  items?: number;
}

export const usePropertyTypes = (params?: UsePropertyTypesParams) => {
  return useQuery({
    queryKey: ['property-types', params],
    queryFn: () => propertyTypeApi.getAll(params),
  });
};

export const usePropertyType = (id: string) => {
  return useQuery({
    queryKey: ['property-types', id],
    queryFn: () => propertyTypeApi.getById(id),
    enabled: !!id,
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyTypeApi } from './api';
import type { CreatePropertyTypeDto, UpdatePropertyTypeDto } from './types';

export const useCreatePropertyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyTypeDto) => propertyTypeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-types'] });
    },
  });
};

export const useUpdatePropertyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyTypeDto }) =>
      propertyTypeApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-types'] });
      queryClient.invalidateQueries({ queryKey: ['property-types', data.data.id] });
    },
  });
};

export const useDeletePropertyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertyTypeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-types'] });
    },
  });
};

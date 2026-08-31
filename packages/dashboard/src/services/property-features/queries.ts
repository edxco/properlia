'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyFeatureApi } from '@properlia/shared/services/property-features/api';
import type { PropertyFeaturePayload } from '@properlia/shared/types';

export const usePropertyFeatures = () =>
  useQuery({
    queryKey: ['property-features'],
    queryFn: propertyFeatureApi.getAll,
    select: (response) => response.data,
  });

export const useCreatePropertyFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PropertyFeaturePayload) =>
      propertyFeatureApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-features'] });
    },
  });
};

export const useDeletePropertyFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertyFeatureApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-features'] });
    },
  });
};

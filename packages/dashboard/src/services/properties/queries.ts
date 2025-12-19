'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { propertyApi } from '@properlia/shared/services/properties/api';
import type {
  CreatePropertyDto,
  Property,
  UpdatePropertyDto,
} from '@properlia/shared/types';

type PropertyFilters = {
  featured?: boolean;
  status_id?: string;
  property_type_id?: string;
  page?: number;
  items?: number;
};

export const useProperties = (params?: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertyApi.getAll(params),
  });
};

export const useProperty = (id?: string) => {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertyApi.getById(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyDto) => propertyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePropertyDto;
    }) => propertyApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      attachmentId,
    }: {
      propertyId: string;
      attachmentId: string;
    }) => propertyApi.deleteAttachment(propertyId, attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', variables.propertyId] });
    },
  });
};

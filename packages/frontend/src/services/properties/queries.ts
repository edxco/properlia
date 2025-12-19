'use client';

import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '@properlia/shared/services/properties/api';

type PropertyFilters = {
  featured?: boolean;
  status_id?: string;
  property_type_id?: string;
  page?: number;
  items?: number;
};

// Query hook for fetching all properties
export const useProperties = (params?: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertyApi.getAll(params),
  });
};

// Query hook for fetching a single property by ID
export const useProperty = (id?: string) => {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertyApi.getById(id as string),
    enabled: Boolean(id),
  });
};

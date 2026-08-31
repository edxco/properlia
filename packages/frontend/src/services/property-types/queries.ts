'use client';

import { useQuery } from '@tanstack/react-query';
import { propertyTypeApi } from '@properlia/shared/services/property-types/api';

export const usePropertyTypes = () => {
  return useQuery({
    queryKey: ['property-types'],
    queryFn: () => propertyTypeApi.getAll(),
  });
};

export const usePropertyType = (id: string) => {
  return useQuery({
    queryKey: ['property-types', id],
    queryFn: () => propertyTypeApi.getById(id),
    enabled: !!id,
  });
};

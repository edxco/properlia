'use client';

import { useQuery } from '@tanstack/react-query';
import { propertyTypeApi } from '@properlia/shared/services/property-types/api';

export const usePropertyTypes = () =>
  useQuery({
    queryKey: ['property-types'],
    queryFn: propertyTypeApi.getAll,
    select: (response) => response.data,
  });

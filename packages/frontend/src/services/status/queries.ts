'use client';

import { useQuery } from '@tanstack/react-query';
import { statusApi } from '@properlia/shared/services/statuses/api';

export const useStatuses = () => {
  return useQuery({
    queryKey: ['statuses'],
    queryFn: () => statusApi.getAll(),
  });
};

export const useStatus = (id: string) => {
  return useQuery({
    queryKey: ['statuses', id],
    queryFn: () => statusApi.getById(id),
    enabled: !!id,
  });
};
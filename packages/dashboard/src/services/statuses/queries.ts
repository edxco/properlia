'use client';

import { useQuery } from '@tanstack/react-query';
import { statusApi } from '@properlia/shared/services/statuses/api';

export const useStatuses = () =>
  useQuery({
    queryKey: ['statuses'],
    queryFn: statusApi.getAll,
    select: (response) => response.data,
  });

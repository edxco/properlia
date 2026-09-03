'use client';

import { useQuery } from '@tanstack/react-query';
import { cityApi } from '@properlia/shared/services/cities/api';

export const useCities = (stateId?: string) => {
  return useQuery({
    queryKey: ['cities', stateId],
    queryFn: () => cityApi.getAll({ state_id: stateId }),
    enabled: !!stateId,
  });
};

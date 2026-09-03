'use client';

import { useQuery } from '@tanstack/react-query';
import { stateApi } from '@properlia/shared/services/states/api';

export const useStates = () => {
  return useQuery({
    queryKey: ['states'],
    queryFn: () => stateApi.getAll(),
  });
};

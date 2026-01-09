'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { generalInfoApi, UpdateGeneralInfoDto } from '@properlia/shared/services/general-info/api';

export const useGeneralInfo = () => {
  return useQuery({
    queryKey: ['generalInfo'],
    queryFn: () => generalInfoApi.get(),
  });
};

export const useUpdateGeneralInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGeneralInfoDto) => generalInfoApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generalInfo'] });
    },
  });
};

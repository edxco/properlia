'use client';

import { useMutation } from '@tanstack/react-query';
import { leadsApi, CreatePublicLeadDto } from '@properlia/shared/services/leads/api';

export const useCreatePublicLead = () => {
  return useMutation({
    mutationFn: (data: CreatePublicLeadDto) => leadsApi.publicCreate(data),
  });
};

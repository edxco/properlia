'use client';

import { useMutation } from '@tanstack/react-query';
import { leadsApi, CreatePropertyLeadDto, CreatePublicLeadDto } from '@properlia/shared/services/leads/api';

export const useCreatePublicLead = () => {
  return useMutation({
    mutationFn: (data: CreatePublicLeadDto) => leadsApi.publicCreate(data),
  });
};

export const useCreatePropertyLead = (propertyId: string) => {
  return useMutation({
    mutationFn: (data: CreatePropertyLeadDto) => leadsApi.createForProperty(propertyId, data),
  });
};

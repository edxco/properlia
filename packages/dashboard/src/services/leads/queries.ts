'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@properlia/shared/services/leads/api';
import type { LeadFilters, LeadStatus } from '@properlia/shared/types';

export const useLeads = (params?: LeadFilters) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsApi.getAll(params),
  });
};

export const useLead = (id?: string) => {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.getById(id as string),
    enabled: Boolean(id),
  });
};

export const useChangeLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: LeadStatus; reason?: string }) =>
      leadsApi.changeStatus(id, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    },
  });
};

export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leadsApi.assign(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    },
  });
};

export const useRecordContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, method, notes }: { id: string; method?: string; notes?: string }) =>
      leadsApi.recordContact(id, method, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    },
  });
};

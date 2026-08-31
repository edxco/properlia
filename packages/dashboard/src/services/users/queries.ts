'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi } from '@properlia/shared/services/users/api';
import type { AdminUserFilters, CreateUserDto, UpdateUserDto } from '@properlia/shared/services/users/types';

export const useAdminUsers = (params?: AdminUserFilters) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminUsersApi.getAll(params),
  });
};

export const useAdminUser = (id?: string) => {
  return useQuery({
    queryKey: ['admin-users', id],
    queryFn: () => adminUsersApi.getById(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => adminUsersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      adminUsersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users', variables.id] });
    },
  });
};

export const useDisableUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUsersApi.disable(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users', id] });
    },
  });
};

import { apiClient } from '../../lib/api-client';
import type {
  AdminUser,
  AdminUserFilters,
  AdminUserResponse,
  AdminUsersResponse,
  CreateUserDto,
  UpdateUserDto,
} from './types';

export type { AdminUser, AdminUserFilters, CreateUserDto, UpdateUserDto } from './types';

export const adminUsersApi = {
  // Get all users with filtering and pagination (requires admin auth)
  getAll: async (params?: AdminUserFilters): Promise<AdminUsersResponse> => {
    const query = new URLSearchParams();

    if (params?.page) query.set('page', String(params.page));
    if (params?.items) query.set('items', String(params.items));
    if (params?.role) query.set('role', params.role);
    if (params?.enabled !== undefined) query.set('enabled', String(params.enabled));
    if (params?.search) query.set('search', params.search);

    const search = query.toString();
    const endpoint = search ? `/admin/users?${search}` : '/admin/users';

    return apiClient.get<AdminUsersResponse>(endpoint, true);
  },

  // Get a single user by ID (requires admin auth)
  getById: async (id: string): Promise<AdminUserResponse> => {
    return apiClient.get<AdminUserResponse>(`/admin/users/${id}`, true);
  },

  // Create a new user (requires admin auth)
  create: async (data: CreateUserDto): Promise<AdminUserResponse> => {
    return apiClient.post<AdminUserResponse>('/admin/users', { user: data }, true);
  },

  // Update a user (requires admin auth)
  update: async (id: string, data: UpdateUserDto): Promise<AdminUserResponse> => {
    return apiClient.patch<AdminUserResponse>(`/admin/users/${id}`, { user: data }, true);
  },

  // Disable a user (requires admin auth)
  disable: async (id: string): Promise<AdminUserResponse> => {
    return apiClient.patch<AdminUserResponse>(`/admin/users/${id}/disable`, {}, true);
  },
};

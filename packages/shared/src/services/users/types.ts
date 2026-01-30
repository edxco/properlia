import type { PaginatedResponse } from '../../types';

export type UserRole = 'user' | 'staff' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUserFilters {
  role?: UserRole;
  enabled?: boolean;
  search?: string;
  page?: number;
  items?: number;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  role: UserRole;
  password: string;
  password_confirmation: string;
  enabled?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: UserRole;
  password?: string;
  password_confirmation?: string;
  enabled?: boolean;
}

export interface AdminUserResponse {
  success: boolean;
  data: AdminUser;
  message?: string;
}

export type AdminUsersResponse = PaginatedResponse<AdminUser>;

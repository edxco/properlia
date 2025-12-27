import { apiClient } from '../../lib/api-client';
import type { LoginCredentials, AuthResponse, LogoutResponse, User } from './types';

const TOKEN_KEY = 'authToken';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data, token } = await apiClient.requestWithToken<AuthResponse>(
      '/users/sign_in',
      {
        method: 'POST',
        body: JSON.stringify({ user: credentials }),
        requiresAuth: false,
      }
    );

    if (data.success && data.data && token) {
      this.setToken(token);
      return data.data;
    }

    throw new Error('Login failed');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.delete<LogoutResponse>('/users/sign_out', true);
    } finally {
      this.clearToken();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>(
        '/users/current',
        true
      );
      return response.data;
    } catch (error) {
      this.clearToken();
      return null;
    }
  },

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24}`;
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = 'authToken=; path=/; max-age=0';
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

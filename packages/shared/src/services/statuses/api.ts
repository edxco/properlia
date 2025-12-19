import { apiClient } from '../../lib/api-client';
import type { PaginatedResponse, Status } from '../../types';

export const statusApi = {
  getAll: async (): Promise<PaginatedResponse<Status>> => {
    return apiClient<PaginatedResponse<Status>>('/statuses');
  },

  getById: async (id: string): Promise<Status> => {
    return apiClient<Status>(`/statuses/${id}`);
  },
};

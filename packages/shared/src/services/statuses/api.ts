import { apiClient } from '../../lib/api-client';
import type { PaginatedResponse, Status } from '../../types';

export const statusApi = {
  // Get all statuses
  getAll: async (): Promise<PaginatedResponse<Status>> => {
    return apiClient.get<PaginatedResponse<Status>>('/statuses');
  },

  // Get a single status by ID
  getById: async (id: string): Promise<Status> => {
    return apiClient.get<Status>(`/statuses/${id}`);
  },
};

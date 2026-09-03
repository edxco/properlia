import { apiClient } from '../../lib/api-client';
import type { PaginatedResponse, State } from '../../types';

export const stateApi = {
  // Get all states (there are only 32, request them in a single page)
  getAll: async (): Promise<PaginatedResponse<State>> => {
    return apiClient.get<PaginatedResponse<State>>('/states?items=100');
  },

  // Get a single state by ID
  getById: async (id: string): Promise<State> => {
    return apiClient.get<State>(`/states/${id}`);
  },
};

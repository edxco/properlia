import { apiClient, type CacheOptions } from '../../lib/api-client';
import type { PaginatedResponse, State } from '../../types';

export const stateApi = {
  // Get all states (there are only 32, request them in a single page)
  getAll: async (cache?: CacheOptions): Promise<PaginatedResponse<State>> => {
    return apiClient.get<PaginatedResponse<State>>('/states?items=100', false, cache);
  },

  // Get a single state by ID
  getById: async (id: string): Promise<State> => {
    return apiClient.get<State>(`/states/${id}`);
  },
};

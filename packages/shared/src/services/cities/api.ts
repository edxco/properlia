import { apiClient } from '../../lib/api-client';
import type { PaginatedResponse, City } from '../../types';

export const cityApi = {
  // Get all cities, optionally scoped to a state (for the dependent State -> City dropdown)
  getAll: async (params?: { state_id?: string }): Promise<PaginatedResponse<City>> => {
    const query = new URLSearchParams({ items: '500' });
    if (params?.state_id) query.set('state_id', params.state_id);

    return apiClient.get<PaginatedResponse<City>>(`/cities?${query.toString()}`);
  },

  // Get a single city by ID
  getById: async (id: string): Promise<City> => {
    return apiClient.get<City>(`/cities/${id}`);
  },
};

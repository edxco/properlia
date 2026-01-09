import { apiClient } from '../../lib/api-client';
import type { PaginatedResponse, ListingType } from '../../types';

export const listingTypeApi = {
  // Get all listing types
  getAll: async (): Promise<PaginatedResponse<ListingType>> => {
    return apiClient.get<PaginatedResponse<ListingType>>('/listing_types');
  },

  // Get a single listing type by ID
  getById: async (id: string): Promise<ListingType> => {
    return apiClient.get<ListingType>(`/listing_types/${id}`);
  },
};

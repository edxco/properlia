import { apiClient } from '../../lib/api-client';
import type { PaginatedResponse, PropertyType } from '../../types';

export const propertyTypeApi = {
  // Get all property types
  getAll: async (): Promise<PaginatedResponse<PropertyType>> => {
    return apiClient.get<PaginatedResponse<PropertyType>>('/property_types');
  },

  // Get a single property type by ID
  getById: async (id: string): Promise<PropertyType> => {
    return apiClient.get<PropertyType>(`/property_types/${id}`);
  },
};

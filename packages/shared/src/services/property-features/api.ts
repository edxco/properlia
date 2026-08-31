import { apiClient } from '../../lib/api-client';
import type { PropertyFeature, PropertyFeaturePayload } from '../../types';

export interface PropertyFeaturesResponse {
  data: PropertyFeature[];
}

export const propertyFeatureApi = {
  // Get all property features
  getAll: async (): Promise<PropertyFeaturesResponse> => {
    return apiClient.get<PropertyFeaturesResponse>('/property_features');
  },

  // Create a new property feature
  create: async (payload: PropertyFeaturePayload): Promise<PropertyFeature> => {
    return apiClient.post<PropertyFeature>('/property_features', {
      property_feature: payload,
    });
  },

  // Delete a property feature
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/property_features/${id}`);
  },
};

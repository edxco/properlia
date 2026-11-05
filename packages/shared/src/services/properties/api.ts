import { apiClient, type CacheOptions } from '../../lib/api-client';
import type {
  CreatePropertyDto,
  GenerateContentParams,
  GenerateContentResult,
  PaginatedResponse,
  Property,
  PropertyPayload,
  UpdatePropertyDto,
} from '../../types';

export type PropertyQueryParams = {
  public?: boolean;
  featured?: boolean;
  status_id?: string;
  property_type_id?: string;
  listing_type_id?: string;
  page?: number;
  items?: number;
  // Location filters
  city_id?: string;
  state_id?: string;
  neighborhood?: string;
  // Price range filters
  price_min?: number;
  price_max?: number;
  // Room filters
  rooms_min?: number;
  bathrooms_min?: number;
  land_area_min?: number;
  land_area_max?: number;
  listing_type?: string;
  // Text search
  search?: string;
  // Category filters
  category_slug?: string;
  property_type_name?: string;
};

const buildAuthHeaders = (token?: string) => {
  if (token) return { Authorization: `Bearer ${token}` };

  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) return { Authorization: `Bearer ${storedToken}` };
  }

  return undefined;
};

const hasMedia = (payload: Partial<PropertyPayload>) =>
  (payload.images?.length ?? 0) > 0 || (payload.videos?.length ?? 0) > 0;

const buildFormData = (payload: Partial<PropertyPayload>) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => formData.append('property[images][]', file));
      return;
    }

    if (key === 'videos' && Array.isArray(value)) {
      value.forEach((file) => formData.append('property[videos][]', file));
      return;
    }

    // Handle array fields (e.g., property_category_ids, property_feature_ids)
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`property[${key}][]`, item.toString()));
      return;
    }

    formData.append(`property[${key}]`, value.toString());
  });

  return formData;
};

export const propertyApi = {
  // Get all properties
  getAll: async (
    params?: PropertyQueryParams,
    cache?: CacheOptions
  ): Promise<PaginatedResponse<Property>> => {
    const query = new URLSearchParams();

    if (params?.page) query.set('page', String(params.page));
    if (params?.items) query.set('items', String(params.items));
    if (params?.public) query.set('public', 'true');
    if (params?.featured !== undefined) query.set('featured', String(params.featured));
    if (params?.status_id) query.set('status_id', params.status_id);
    if (params?.property_type_id) query.set('property_type_id', params.property_type_id);
    if (params?.listing_type_id) query.set('listing_type_id', params.listing_type_id);
    // Location filters
    if (params?.city_id) query.set('city_id', params.city_id);
    if (params?.state_id) query.set('state_id', params.state_id);
    if (params?.neighborhood) query.set('neighborhood', params.neighborhood);
    // Price range filters
    if (params?.price_min !== undefined) query.set('price_min', String(params.price_min));
    if (params?.price_max !== undefined) query.set('price_max', String(params.price_max));
    // Room filters
    if (params?.rooms_min !== undefined) query.set('rooms_min', String(params.rooms_min));
    if (params?.bathrooms_min !== undefined) query.set('bathrooms_min', String(params.bathrooms_min));
    if (params?.land_area_min !== undefined) query.set('land_area_min', String(params.land_area_min));
    if (params?.land_area_max !== undefined) query.set('land_area_max', String(params.land_area_max));
    if (params?.listing_type) query.set('listing_type', params.listing_type);
    // Text search
    if (params?.search) query.set('search', params.search);
    // Category filters
    if (params?.category_slug) query.set('category_slug', params.category_slug);
    if (params?.property_type_name) query.set('property_type_name', params.property_type_name);

    const queryString = query.toString();
    const endpoint = queryString ? `/properties?${queryString}` : '/properties';

    return apiClient.get<PaginatedResponse<Property>>(endpoint, false, cache);
  },

  // Get a single property by ID
  getById: async (id: string, cache?: CacheOptions): Promise<Property> => {
    return apiClient.get<Property>(`/properties/${id}`, false, cache);
  },

  // Create a new property
  create: async (data: CreatePropertyDto, token?: string): Promise<Property> => {
    if (hasMedia(data)) {
      return apiClient.request<Property>('/properties', {
        method: 'POST',
        body: buildFormData(data),
        headers: buildAuthHeaders(token),
        requiresAuth: true,
      });
    }

    return apiClient.request<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify({ property: data }),
      headers: buildAuthHeaders(token),
      requiresAuth: true,
    });
  },

  // Update an existing property
  update: async (
    id: string,
    data: UpdatePropertyDto,
    token?: string
  ): Promise<Property> => {
    if (hasMedia(data)) {
      return apiClient.request<Property>(`/properties/${id}`, {
        method: 'PUT',
        body: buildFormData(data),
        headers: buildAuthHeaders(token),
        requiresAuth: true,
      });
    }

    return apiClient.request<Property>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ property: data }),
      headers: buildAuthHeaders(token),
      requiresAuth: true,
    });
  },

  // Delete an attachment (images/videos share the same endpoint)
  deleteAttachment: async (
    propertyId: string,
    attachmentId: string,
    token?: string
  ): Promise<void> => {
    return apiClient.request<void>(`/properties/${propertyId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(token),
      requiresAuth: true,
    });
  },

  // Generate a bilingual title/description draft from the form's current values
  generateContent: async (
    data: GenerateContentParams,
    token?: string
  ): Promise<GenerateContentResult> => {
    return apiClient.request<GenerateContentResult>('/properties/generate_content', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: buildAuthHeaders(token),
      requiresAuth: true,
    });
  },

  // Reorder images for a property
  reorderImages: async (
    propertyId: string,
    imageIds: string[],
    token?: string
  ): Promise<Property> => {
    return apiClient.request<Property>(`/properties/${propertyId}/reorder_images`, {
      method: 'PUT',
      body: JSON.stringify({ image_ids: imageIds }),
      headers: buildAuthHeaders(token),
      requiresAuth: true,
    });
  },
};

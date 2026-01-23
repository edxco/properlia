import { apiClient } from '../../lib/api-client';
import type {
  CreatePropertyDto,
  PaginatedResponse,
  Property,
  PropertyPayload,
  UpdatePropertyDto,
} from '../../types';

type PropertyQueryParams = {
  featured?: boolean;
  status_id?: string;
  property_type_id?: string;
  listing_type_id?: string;
  page?: number;
  items?: number;
  include_suspended?: boolean;
  // Location filters
  city?: string;
  state?: string;
  neighborhood?: string;
  // Price range filters
  price_min?: number;
  price_max?: number;
  // Room filters
  rooms_min?: number;
  bathrooms_min?: number;
  // Text search
  search?: string;
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

    formData.append(`property[${key}]`, value.toString());
  });

  return formData;
};

export const propertyApi = {
  // Get all properties
  getAll: async (
    params?: PropertyQueryParams
  ): Promise<PaginatedResponse<Property>> => {
    const query = new URLSearchParams();

    if (params?.page) query.set('page', String(params.page));
    if (params?.items) query.set('items', String(params.items));
    if (params?.featured !== undefined) query.set('featured', String(params.featured));
    if (params?.status_id) query.set('status_id', params.status_id);
    if (params?.property_type_id) query.set('property_type_id', params.property_type_id);
    if (params?.listing_type_id) query.set('listing_type_id', params.listing_type_id);
    if (params?.include_suspended !== undefined) query.set('include_suspended', String(params.include_suspended));
    // Location filters
    if (params?.city) query.set('city', params.city);
    if (params?.state) query.set('state', params.state);
    if (params?.neighborhood) query.set('neighborhood', params.neighborhood);
    // Price range filters
    if (params?.price_min !== undefined) query.set('price_min', String(params.price_min));
    if (params?.price_max !== undefined) query.set('price_max', String(params.price_max));
    // Room filters
    if (params?.rooms_min !== undefined) query.set('rooms_min', String(params.rooms_min));
    if (params?.bathrooms_min !== undefined) query.set('bathrooms_min', String(params.bathrooms_min));
    // Text search
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/properties?${queryString}` : '/properties';

    return apiClient.get<PaginatedResponse<Property>>(endpoint);
  },

  // Get a single property by ID
  getById: async (id: string): Promise<Property> => {
    return apiClient.get<Property>(`/properties/${id}`);
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
};

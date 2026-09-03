// Common types shared across frontend and dashboard

// Auth types
export * from '../services/auth/types';

// Lead types
export * from '../services/leads/types';

export interface CommonEntity {
  id: string;
  name: string;
  es_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  content_type: string;
}

export interface PropertyCategory {
  id: string;
  name: string;
  es_name: string;
  slug: string;
}

export interface PropertyFeature {
  id: string;
  name: string;
  es_name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface PropertyFeaturePayload {
  name: string;
  es_name: string;
  slug: string;
}

export interface Property {
  id: string;
  featured: boolean;
  exclusive_listing: boolean;
  title: string;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  land_area?: number | null;
  built_area?: number | null;
  rooms: number;
  bathrooms: number;
  half_bathrooms: number;
  parking_spaces: number;
  price: number;
  address?: string;
  city_id?: string | null;
  state_id?: string | null;
  zip_code?: string | null;
  neighborhood?: string | null;
  coordinates?: string | null;
  property_type_id: string;
  status_id?: string | null;
  listing_type_id: string;
  property_type?: CommonEntity | null;
  status?: CommonEntity | null;
  listing_type?: CommonEntity | null;
  state?: CommonEntity | null;
  city?: CommonEntity | null;
  property_categories?: PropertyCategory[];
  property_features?: PropertyFeature[];
  images: Attachment[];
  videos: Attachment[];
  created_at?: string;
  updated_at?: string;
}

export interface PropertyType extends CommonEntity {
  property_categories?: PropertyCategory[];
}

export interface Status extends CommonEntity {}

export interface ListingType extends CommonEntity {}

export interface State extends CommonEntity {}

export interface City extends CommonEntity {
  state_id: string;
}

export interface PropertyPayload {
  featured?: boolean;
  exclusive_listing?: boolean;
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  land_area?: number;
  built_area?: number;
  rooms?: number;
  bathrooms?: number;
  half_bathrooms?: number;
  parking_spaces?: number;
  price: number;
  address: string;
  city_id?: string;
  state_id?: string;
  zip_code?: string;
  neighborhood?: string;
  coordinates?: string;
  property_type_id: string;
  status_id?: string;
  listing_type_id: string;
  property_category_ids?: string[];
  property_feature_ids?: string[];
  images?: File[];
  videos?: File[];
  image_order?: string[];
}

export type CreatePropertyDto = PropertyPayload;
export type UpdatePropertyDto = Partial<PropertyPayload>;

export interface GenerateContentParams {
  property_type_id: string;
  listing_type_id: string;
  property_category_ids?: string[];
  property_feature_ids?: string[];
  address?: string;
  neighborhood?: string;
  city_id?: string;
  state_id?: string;
  price?: number;
  land_area?: number;
  built_area?: number;
  rooms?: number;
  bathrooms?: number;
  half_bathrooms?: number;
  parking_spaces?: number;
}

export interface GenerateContentResult {
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationMeta {
  count: number;
  page: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMeta;
}

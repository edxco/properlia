// Common types shared across frontend and dashboard

// Auth types
export * from '../services/auth/types';

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

export interface Property {
  id: string;
  featured: boolean;
  title: string;
  description?: string | null;
  land_area?: number | null;
  built_area?: number | null;
  rooms: number;
  bathrooms: number;
  half_bathrooms: number;
  parking_spaces: number;
  price: number;
  address: string;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  neighborhood?: string | null;
  coordinates?: string | null;
  property_type_id: string;
  status_id?: string | null;
  property_type?: CommonEntity | null;
  status?: CommonEntity | null;
  images: Attachment[];
  videos: Attachment[];
  created_at?: string;
  updated_at?: string;
}

export interface PropertyType extends CommonEntity {}

export interface Status extends CommonEntity {}

export interface PropertyPayload {
  featured?: boolean;
  title: string;
  description?: string;
  land_area?: number;
  built_area?: number;
  rooms?: number;
  bathrooms?: number;
  half_bathrooms?: number;
  parking_spaces?: number;
  price: number;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood?: string;
  coordinates?: string;
  property_type_id: string;
  status_id?: string;
  images?: File[];
  videos?: File[];
}

export type CreatePropertyDto = PropertyPayload;
export type UpdatePropertyDto = Partial<PropertyPayload>;

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

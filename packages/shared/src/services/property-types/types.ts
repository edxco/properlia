export interface PropertyType {
  id: string;
  name: string;
  es_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyTypeDto {
  property_type: {
    name: string;
    es_name: string;
  };
}

export interface UpdatePropertyTypeDto {
  property_type: {
    name?: string;
    es_name?: string;
  };
}

export interface PaginationMetadata {
  count: number;
  page: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

export interface PropertyTypesResponse {
  data: PropertyType[];
  metadata: PaginationMetadata;
}

export interface PropertyTypeResponse {
  success: boolean;
  message?: string;
  data: PropertyType;
}

export interface ApiError {
  success: false;
  message?: string;
  errors: string[];
}

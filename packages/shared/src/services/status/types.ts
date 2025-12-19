export interface ICommonProps {
  id: string;
  name: string;
  es_name: string;
  created_at: string;
  updated_at: string;
}

export interface IAttachment {
  id: string;
  url: string;
  filename: string;
  content_type: string;
}

export interface IProperty {
  id: string;
  featured: boolean;
  title: string;
  description: string | null;
  land_area: number | null;
  built_area: number | null;
  rooms: number;
  bathrooms: number;
  half_bathrooms: number;
  parking_spaces: number;
  price: number;
  status: ICommonProps;
  status_id: string;
  address: string;
  city: string | null;
  state: string | null;
  coordinates: string | null;
  property_type: ICommonProps;
  property_type_id: string;
  images: IAttachment[];
  videos: IAttachment[];
}

export interface ICreatePropertyDto {
  property: {
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
    status?: string;
    address: string;
    city?: string;
    state?: string;
    coordinates?: string;
    property_type_id: string;
    images?: File[];
    videos?: File[];
  };
}

export interface IUpdatePropertyDto {
  property: {
    featured?: boolean;
    title?: string;
    description?: string;
    land_area?: number;
    built_area?: number;
    rooms?: number;
    bathrooms?: number;
    half_bathrooms?: number;
    parking_spaces?: number;
    price?: number;
    status?: string;
    address?: string;
    city?: string;
    state?: string;
    coordinates?: string;
    property_type_id?: string;
    images?: File[];
    videos?: File[];
  };
}

export interface IPaginationMetadata {
  count: number;
  page: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

export interface IPropertiesResponse {
  data: IProperty[];
  metadata: IPaginationMetadata;
}

export interface PropertyResponse {
  success: boolean;
  message?: string;
  data: IProperty;
}

export interface ApiError {
  success: false;
  message?: string;
  errors: string[];
}

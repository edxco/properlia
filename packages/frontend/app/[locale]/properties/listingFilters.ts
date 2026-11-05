import type { PropertyQueryParams } from "@properlia/shared/services/properties/api";

export const ITEMS_PER_PAGE = 12;

export interface Filters {
  rooms?: number;
  bathrooms?: number;
  city?: string;
  state?: string;
  priceMin?: number;
  priceMax?: number;
  landAreaMin?: number;
  landAreaMax?: number;
  searchQuery?: string;
  listingType?: string;
  category?: string;
}

type SearchParamsInput = Record<string, string | string[] | undefined>;

const URL_KEYS: Record<keyof Filters, string> = {
  rooms: "rooms",
  bathrooms: "bathrooms",
  city: "city",
  state: "state",
  priceMin: "price_min",
  priceMax: "price_max",
  landAreaMin: "land_min",
  landAreaMax: "land_max",
  searchQuery: "search",
  listingType: "type",
  category: "category",
};

const NUMERIC_KEYS = new Set<keyof Filters>([
  "rooms",
  "bathrooms",
  "priceMin",
  "priceMax",
  "landAreaMin",
  "landAreaMax",
]);

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export function parseFilters(searchParams: SearchParamsInput): Filters {
  const filters: Filters = {};
  for (const [key, urlKey] of Object.entries(URL_KEYS) as [keyof Filters, string][]) {
    const raw = first(searchParams[urlKey]);
    if (!raw) continue;
    if (NUMERIC_KEYS.has(key)) {
      const num = Number(raw);
      if (Number.isFinite(num) && num > 0) (filters[key] as number) = num;
    } else {
      (filters[key] as string) = raw;
    }
  }
  return filters;
}

export function parsePage(searchParams: SearchParamsInput): number {
  const page = Number(first(searchParams.page));
  return Number.isInteger(page) && page > 1 ? page : 1;
}

export function buildListingQuery(filters: Filters, page = 1): string {
  const query = new URLSearchParams();
  for (const [key, urlKey] of Object.entries(URL_KEYS) as [keyof Filters, string][]) {
    const value = filters[key];
    if (value !== undefined && value !== "") query.set(urlKey, String(value));
  }
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function hasActiveFilters(filters: Filters): boolean {
  return Object.values(filters).some((value) => value !== undefined);
}

export function toApiParams(filters: Filters): PropertyQueryParams {
  const params: PropertyQueryParams = {};
  if (filters.searchQuery) params.search = filters.searchQuery;
  if (filters.city) params.city = filters.city;
  if (filters.state) params.state = filters.state;
  if (filters.priceMin) params.price_min = filters.priceMin;
  if (filters.priceMax) params.price_max = filters.priceMax;
  if (filters.rooms) params.rooms_min = filters.rooms;
  if (filters.bathrooms) params.bathrooms_min = filters.bathrooms;
  if (filters.landAreaMin) params.land_area_min = filters.landAreaMin;
  if (filters.landAreaMax) params.land_area_max = filters.landAreaMax;
  if (filters.listingType) params.listing_type = filters.listingType === "buy" ? "sale" : filters.listingType;
  if (filters.category === "land") params.property_type_name = "land";
  else if (filters.category) params.category_slug = filters.category;
  return params;
}

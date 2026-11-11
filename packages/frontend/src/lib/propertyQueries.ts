import { propertyApi, type PropertyQueryParams } from "@properlia/shared/services/properties/api";
import { stateApi } from "@properlia/shared/services/states/api";
import { cityApi } from "@properlia/shared/services/cities/api";
import { ApiError } from "@properlia/shared/lib/api-client";
import type { City, Property, PublicPaths, State } from "@properlia/shared/types";
import { hasPublicLocation } from "@properlia/shared/lib/slugify";

export const PROPERTIES_CACHE = { revalidate: 300, tags: ["properties"] };

export async function getPublicProperties(params: PropertyQueryParams = {}) {
  try {
    const result = await propertyApi.getAll({ ...params, public: true }, PROPERTIES_CACHE);
    return { ...result, data: result.data.filter(hasPublicLocation) };
  } catch {
    return null;
  }
}

// Shared, cached pool used for "similar properties"
export async function getPublicPropertiesPool(): Promise<Property[]> {
  return (await getPublicProperties({ items: 100 }))?.data ?? [];
}

/** Null only when the code does not exist (or is not public); API outages throw so the page answers 5xx, not 404. */
export async function getPropertyByCode(code: string): Promise<Property | null> {
  try {
    return await propertyApi.getByCode(code, PROPERTIES_CACHE);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

const EMPTY_PATHS: PublicPaths = { properties: [], states: [], cities: [] };

export async function getPublicPaths(): Promise<PublicPaths> {
  try {
    return await propertyApi.getPublicPaths(PROPERTIES_CACHE);
  } catch {
    return EMPTY_PATHS;
  }
}

// Location slugs change with property revalidation (new cities appear with new listings).
const LOCATIONS_CACHE = { revalidate: 300, tags: ["properties"] };

export async function getStates(): Promise<State[]> {
  try {
    return (await stateApi.getAll(LOCATIONS_CACHE)).data;
  } catch {
    return [];
  }
}

export async function getCities(stateId?: string): Promise<City[]> {
  if (!stateId) return [];
  try {
    return (await cityApi.getAll({ state_id: stateId }, LOCATIONS_CACHE)).data;
  } catch {
    return [];
  }
}

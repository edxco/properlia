import { propertyApi, type PropertyQueryParams } from "@properlia/shared/services/properties/api";
import { stateApi } from "@properlia/shared/services/states/api";
import { cityApi } from "@properlia/shared/services/cities/api";
import type { City, Property, State } from "@properlia/shared/types";
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

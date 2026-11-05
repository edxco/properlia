import { propertyApi, type PropertyQueryParams } from "@properlia/shared/services/properties/api";
import type { Property } from "@properlia/shared/types";
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

// Shared, cached pool used for "similar properties" and filter options
export async function getPublicPropertiesPool(): Promise<Property[]> {
  return (await getPublicProperties({ items: 100 }))?.data ?? [];
}

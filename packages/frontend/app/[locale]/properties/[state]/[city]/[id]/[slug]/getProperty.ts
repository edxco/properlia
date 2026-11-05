import { cache } from "react";
import { propertyApi } from "@properlia/shared/services/properties/api";
import type { Property } from "@properlia/shared/types";

export const getProperty = cache(async (id: string): Promise<Property | null> => {
  try {
    return await propertyApi.getById(id);
  } catch {
    return null;
  }
});

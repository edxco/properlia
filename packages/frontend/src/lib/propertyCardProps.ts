import type { ComponentProps } from "react";
import type { Property } from "@properlia/shared/types";
import { getAbsoluteImageUrl } from "@properlia/shared/lib/api-client";
import { localizedTitle } from "@properlia/shared/lib/propertyText";
import { buildPropertyUrl } from "@properlia/shared/lib/slugify";
import type { PropertyCard } from "@/components/ui";

const UNKNOWN = { id: "", name: "Unknown", es_name: "Desconocido" };

export type PropertyCardProps = ComponentProps<typeof PropertyCard>;

export function toPropertyCardProps(property: Property, locale: string): PropertyCardProps {
  return {
    id: property.id,
    href: buildPropertyUrl(property, locale),
    title: property.title,
    displayTitle: localizedTitle(property, locale),
    property_type: property.property_type ?? UNKNOWN,
    status: property.status ?? UNKNOWN,
    listing_types: property.listing_type ?? UNKNOWN,
    images: property.images.map((img) => getAbsoluteImageUrl(img.url)),
    landArea: property.land_area ?? 0,
    builtArea: property.built_area ?? 0,
    price: property.price,
    rooms: property.rooms,
    bathrooms: property.bathrooms,
    half_bathrooms: property.half_bathrooms,
    property_features: property.property_features,
    property_categories: property.property_categories,
    neighborhood: property.neighborhood,
    city: property.city,
    state: property.state,
  };
}

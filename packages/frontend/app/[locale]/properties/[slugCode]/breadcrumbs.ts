import type { BreadcrumbItem } from "@properlia/shared/components/Breadcrumbs";
import type { LocationEntity, Property } from "@properlia/shared/types";
import { geoPath, localizedPath } from "@properlia/shared/lib/routes";
import { dictionaryFor } from "@/src/lib/metadata";

// Home › Properties › State › City › Neighborhood
export function buildPropertyBreadcrumbs(property: Property, locale: string): BreadcrumbItem[] {
  const dict = dictionaryFor(locale);
  const label = (entity: LocationEntity) => (locale === "es" && entity.es_name) || entity.name;
  const items: BreadcrumbItem[] = [
    { label: dict.breadcrumbHome, href: localizedPath(locale, "home") },
    { label: dict.properties, href: localizedPath(locale, "properties") },
  ];
  if (property.state) {
    items.push({ label: label(property.state), href: geoPath(locale, property.state) });
    if (property.city) {
      items.push({ label: label(property.city), href: geoPath(locale, property.state, property.city) });
    }
  }
  if (property.neighborhood) items.push({ label: property.neighborhood });
  return items;
}

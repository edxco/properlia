import type { BreadcrumbItem } from "@properlia/shared/components/Breadcrumbs";
import type { CommonEntity, Property } from "@properlia/shared/types";
import { buildListingQuery } from "../../../../listingFilters";
import { enMessages, esMessages } from "@properlia/shared";

export function buildPropertyBreadcrumbs(property: Property, locale: string): BreadcrumbItem[] {
  const dict: Record<string, string> = locale === "en" ? enMessages : esMessages;
  const listing = `/${locale}/properties`;
  const items: BreadcrumbItem[] = [
    { label: dict.breadcrumbHome, href: `/${locale}` },
    { label: dict.properties, href: listing },
  ];
  const label = (entity: CommonEntity) => (locale === "es" && entity.es_name) || entity.name;
  if (property.state) {
    const stateQuery = buildListingQuery({ state_id: property.state.id });
    items.push({ label: label(property.state), href: `${listing}${stateQuery}` });
    if (property.city) {
      const cityQuery = buildListingQuery({ state_id: property.state.id, city_id: property.city.id });
      items.push({ label: label(property.city), href: `${listing}${cityQuery}` });
    }
  }
  if (property.neighborhood) items.push({ label: property.neighborhood });
  return items;
}

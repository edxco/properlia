import type { BreadcrumbItem } from "@properlia/shared/components/Breadcrumbs";
import type { Property } from "@properlia/shared/types";
import { enMessages, esMessages } from "@properlia/shared";

export function buildPropertyBreadcrumbs(property: Property, locale: string): BreadcrumbItem[] {
  const dict: Record<string, string> = locale === "en" ? enMessages : esMessages;
  const listing = `/${locale}/properties`;
  const items: BreadcrumbItem[] = [
    { label: dict.breadcrumbHome, href: `/${locale}` },
    { label: dict.properties, href: listing },
  ];
  if (property.state) {
    items.push({ label: property.state, href: `${listing}?state=${encodeURIComponent(property.state)}` });
  }
  if (property.city) {
    items.push({ label: property.city, href: `${listing}?city=${encodeURIComponent(property.city)}` });
  }
  if (property.neighborhood) items.push({ label: property.neighborhood });
  return items;
}

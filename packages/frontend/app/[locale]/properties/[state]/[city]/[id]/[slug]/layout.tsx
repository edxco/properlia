import type { Metadata } from "next";
import { getAbsoluteImageUrl } from "@properlia/shared/lib/api-client";
import { buildMetadata } from "@/src/lib/metadata";
import { buildPropertyUrl } from "@properlia/shared/lib/slugify";
import { isPubliclyVisible } from "@properlia/shared/lib/propertyVisibility";
import type { Property } from "@properlia/shared/types";
import {
  localizedDescription,
  localizedMetaDescription,
  localizedTitle,
} from "@properlia/shared/lib/propertyText";
import { getProperty } from "./getProperty";
import { buildPropertyBreadcrumbs } from "./breadcrumbs";

const BASE_URL = "https://properlia.com";

function buildPropertyJsonLd(property: Property, locale: string) {
  const path = buildPropertyUrl(property);
  const listingType = property.listing_type?.name?.toLowerCase();
  const isSale = !listingType || listingType !== "rent";
  const image = property.images?.[0]?.url
    ? getAbsoluteImageUrl(property.images[0].url)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: localizedTitle(property, locale),
    description: localizedDescription(property, locale) ?? undefined,
    url: `${BASE_URL}/${locale}${path}`,
    ...(image && { image }),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      businessFunction: isSale
        ? "https://schema.org/Sell"
        : "https://schema.org/LeaseOut",
    },
    address: {
      "@type": "PostalAddress",
      ...(property.address && { streetAddress: property.address }),
      ...(property.neighborhood && { addressLocality: property.neighborhood }),
      ...(property.city && {
        addressLocality: locale === "es" ? property.city.es_name : property.city.name,
      }),
      ...(property.state && {
        addressRegion: locale === "es" ? property.state.es_name : property.state.name,
      }),
      addressCountry: "MX",
      ...(property.zip_code && { postalCode: property.zip_code }),
    },
    numberOfRooms: property.rooms,
    numberOfBathroomsTotal: property.bathrooms + property.half_bathrooms,
    floorSize: property.built_area
      ? { "@type": "QuantitativeValue", value: property.built_area, unitCode: "MTK" }
      : undefined,
    broker: { "@id": "https://properlia.com/#organization" },
  };
}

function buildBreadcrumbJsonLd(property: Property, locale: string) {
  const items = buildPropertyBreadcrumbs(property, locale);
  const path = buildPropertyUrl(property);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...items.filter((item) => item.href),
      { label: localizedTitle(property, locale), href: `/${locale}${path}` },
    ].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${BASE_URL}${item.href}`,
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;

  const property = await getProperty(id);
  if (!property) {
    return buildMetadata(locale, `/properties/${id}`, "metaTitle", "metaDescription");
  }

  const base = buildMetadata(locale, buildPropertyUrl(property), "metaTitle", "metaDescription");
  return {
    ...base,
    title: `${localizedTitle(property, locale)} | Properlia`,
    description: localizedMetaDescription(property, locale) || base.description,
  };
}

export default async function PropertyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const property = await getProperty(id);
  const jsonLd =
    property && isPubliclyVisible(property)
      ? [buildPropertyJsonLd(property, locale), buildBreadcrumbJsonLd(property, locale)]
      : [];

  return (
    <>
      {jsonLd.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      {children}
    </>
  );
}

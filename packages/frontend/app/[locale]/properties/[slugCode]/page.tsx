import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getAbsoluteImageUrl } from "@properlia/shared/lib/api-client";
import { isPubliclyVisible } from "@properlia/shared/lib/propertyVisibility";
import { buildPropertyUrl, hasPublicLocation, parsePropertyCode, propertySlug } from "@properlia/shared/lib/slugify";
import {
  localizedDescription,
  localizedMetaDescription,
  localizedTitle,
} from "@properlia/shared/lib/propertyText";
import type { Property } from "@properlia/shared/types";
import { PropertyDetailView } from "@/components/property/PropertyDetailView";
import { SimilarProperties } from "@/src/components/SimilarProperties";
import { absoluteUrl, buildMetadata } from "@/src/lib/metadata";
import { getPropertyByCode, getPublicPropertiesPool } from "@/src/lib/propertyQueries";
import { buildPropertyBreadcrumbs } from "./breadcrumbs";
import { JsonLdScripts, breadcrumbJsonLd } from "@/src/lib/jsonLd";

type PageProps = { params: Promise<{ locale: string; slugCode: string }> };

// Code-based lookup: title, city or state edits never break the URL.
const getPublicProperty = cache(async (slugCode: string): Promise<Property | null> => {
  const code = parsePropertyCode(slugCode);
  if (!code) return null;
  const property = await getPropertyByCode(code);
  return property && isPubliclyVisible(property) && hasPublicLocation(property) ? property : null;
});

function buildPropertyJsonLd(property: Property, locale: string) {
  const listingType = property.listing_type?.name?.toLowerCase();
  const isSale = !listingType || listingType !== "rent";
  const image = property.images?.[0]?.url ? getAbsoluteImageUrl(property.images[0].url) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: localizedTitle(property, locale),
    description: localizedDescription(property, locale) ?? undefined,
    url: absoluteUrl(buildPropertyUrl(property, locale)),
    identifier: property.code,
    ...(image && { image }),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      businessFunction: isSale ? "https://schema.org/Sell" : "https://schema.org/LeaseOut",
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
  return breadcrumbJsonLd([
    ...buildPropertyBreadcrumbs(property, locale).flatMap((item) => (item.href ? [{ label: item.label, href: item.href }] : [])),
    { label: localizedTitle(property, locale), href: buildPropertyUrl(property, locale) },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slugCode } = await params;
  const property = await getPublicProperty(slugCode);
  if (!property) return { robots: { index: false, follow: true } };

  const paths = { es: buildPropertyUrl(property, "es"), en: buildPropertyUrl(property, "en") };
  const base = buildMetadata(locale, paths, "metaTitle", "metaDescription");
  return {
    ...base,
    title: `${localizedTitle(property, locale)} | Properlia`,
    description: localizedMetaDescription(property, locale) || base.description,
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const { locale, slugCode } = await params;
  const [property, pool] = await Promise.all([getPublicProperty(slugCode), getPublicPropertiesPool()]);
  if (!property) notFound();

  // The proxy already 301s outdated slugs; this covers it if its path index is unavailable.
  if (propertySlug(property, locale) !== slugCode) permanentRedirect(buildPropertyUrl(property, locale));

  const jsonLd = [buildPropertyJsonLd(property, locale), buildBreadcrumbJsonLd(property, locale)];

  return (
    <>
      <JsonLdScripts data={jsonLd} />
      <PropertyDetailView
        property={property}
        locale={locale}
        title={localizedTitle(property, locale)}
        description={localizedDescription(property, locale)}
        breadcrumbs={buildPropertyBreadcrumbs(property, locale)}
      />
      <SimilarProperties property={property} pool={pool} locale={locale} />
    </>
  );
}

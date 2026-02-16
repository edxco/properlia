import type { Metadata } from "next";
import { propertyApi } from "@properlia/shared/services/properties/api";
import { getAbsoluteImageUrl } from "@properlia/shared/lib/api-client";
import { buildMetadata } from "@/src/lib/metadata";
import { buildPropertyUrl } from "@properlia/shared/lib/slugify";
import type { Property } from "@properlia/shared/types";

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
    name: property.title,
    description: property.description ?? undefined,
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
      ...(property.city && { addressRegion: property.city }),
      ...(property.state && { addressRegion: property.state }),
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;

  try {
    const property = await propertyApi.getById(id);
    const path = buildPropertyUrl(property);
    const base = buildMetadata(locale, path, "metaTitle", "metaDescription");

    return {
      ...base,
      title: `${property.title} | Properlia`,
      description: property.description?.slice(0, 160) ?? base.description,
    };
  } catch {
    return buildMetadata(locale, `/properties/${id}`, "metaTitle", "metaDescription");
  }
}

export default async function PropertyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  let jsonLd = null;
  try {
    const property = await propertyApi.getById(id);
    jsonLd = buildPropertyJsonLd(property, locale);
  } catch {
    // Property not found — skip JSON-LD
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}

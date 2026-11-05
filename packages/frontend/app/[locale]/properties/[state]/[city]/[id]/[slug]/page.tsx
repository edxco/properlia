import { isPubliclyVisible } from "@properlia/shared/lib/propertyVisibility";
import { buildPropertyUrl, hasPublicLocation } from "@properlia/shared/lib/slugify";
import { localizedDescription, localizedTitle } from "@properlia/shared/lib/propertyText";
import { notFound, permanentRedirect } from "next/navigation";
import { PropertyDetailView } from "@/components/property/PropertyDetailView";
import { getPublicPropertiesPool } from "@/src/lib/propertyQueries";
import { SimilarProperties } from "@/src/components/SimilarProperties";
import { getProperty } from "./getProperty";
import { buildPropertyBreadcrumbs } from "./breadcrumbs";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; state: string; city: string; id: string; slug: string }>;
}) {
  const { locale, state, city, id, slug } = await params;

  const [property, pool] = await Promise.all([getProperty(id), getPublicPropertiesPool()]);

  if (!property || !isPubliclyVisible(property) || !hasPublicLocation(property)) notFound();

  const canonicalPath = buildPropertyUrl(property);
  if (canonicalPath !== `/properties/${state}/${city}/${id}/${slug}`) {
    permanentRedirect(`/${locale}${canonicalPath}`);
  }

  return (
    <>
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

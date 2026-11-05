import type { Metadata } from "next";
import { enMessages, esMessages } from "@properlia/shared";
import { PageTitle } from "@properlia/shared/components/ui";
import type { City, State } from "@properlia/shared/types";
import PropertiesClient from "./PropertiesClient";
import { buildMetadata } from "@/src/lib/metadata";
import { getCities, getPublicProperties, getStates } from "@/src/lib/propertyQueries";
import {
  ITEMS_PER_PAGE,
  hasActiveFilters,
  parseFilters,
  parsePage,
  toApiParams,
  type Filters,
} from "./listingFilters";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function fetchListing(filters: Filters, page: number) {
  return getPublicProperties({ ...toApiParams(filters), page, items: ITEMS_PER_PAGE });
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const metadata = buildMetadata(locale, "/properties", "propertiesMetaTitle", "propertiesMetaDescription");

  const filters = parseFilters(sp);
  const page = parsePage(sp);
  if (!hasActiveFilters(filters)) {
    if (page === 1) return metadata;
    const canonical = `${metadata.alternates?.canonical}?page=${page}`;
    return { ...metadata, alternates: { ...metadata.alternates, canonical } };
  }

  const result = await fetchListing(filters, page);
  if (result && result.metadata.count === 0) {
    return { ...metadata, robots: { index: false, follow: true } };
  }
  return metadata;
}

export default async function PropertiesPage({ params, searchParams }: PageProps) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const dict: Record<string, string> = locale === "en" ? enMessages : esMessages;
  const filters = parseFilters(sp);
  const page = parsePage(sp);

  const [listing, states, cities] = await Promise.all([
    fetchListing(filters, page),
    getStates(),
    getCities(filters.state_id),
  ]);

  const hasNoResults = hasActiveFilters(filters) && listing?.metadata.count === 0;
  const result = hasNoResults ? await fetchListing({}, 1) : listing;

  const locationLabel = (entity: State | City) => (locale === "es" && entity.es_name) || entity.name;
  const byLabel = (a: State | City, b: State | City) => locationLabel(a).localeCompare(locationLabel(b), locale);

  const title = (filters.category && dict[`propertiesListingTitle_${filters.category}`]) || dict.propertiesListingTitle;

  return (
    <PropertiesClient
      header={
        <header className="mb-8">
          <PageTitle className="mb-3 text-3xl md:text-4xl">{title}</PageTitle>
          <p className="max-w-3xl text-brand-carbon/70">{dict.propertiesListingIntro}</p>
        </header>
      }
      locale={locale}
      filters={filters}
      properties={result?.data ?? []}
      page={hasNoResults ? 1 : page}
      totalPages={result?.metadata.pages ?? 0}
      totalCount={result?.metadata.count ?? 0}
      hasNoResults={hasNoResults}
      isError={!result}
      cities={[...cities].sort(byLabel)}
      states={[...states].sort(byLabel)}
    />
  );
}

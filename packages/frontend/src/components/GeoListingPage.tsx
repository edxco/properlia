import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { OPERATIONS, geoPath, localizedPath, type OperationKey } from "@properlia/shared/lib/routes";
import { Alert, PageTitle, chipClasses } from "@properlia/shared/components/ui";
import { Breadcrumbs } from "@properlia/shared/components/Breadcrumbs";
import type { City, State } from "@properlia/shared/types";
import PropertiesClient from "@/app/[locale]/properties/PropertiesClient";
import { ITEMS_PER_PAGE, parsePage, toApiParams, type Filters } from "@/app/[locale]/properties/listingFilters";
import { buildMetadata, dictionaryFor } from "@/src/lib/metadata";
import { MIN_INDEXABLE_LISTINGS, geoChildren, locationLabel, resolveGeo, type GeoMatch } from "@/src/lib/geo";
import { JsonLdScripts, breadcrumbJsonLd, itemListJsonLd, type JsonLdCrumb } from "@/src/lib/jsonLd";
import { getCities, getPublicProperties, getStates } from "@/src/lib/propertyQueries";

// Shared by /{state}, /{state}/{city} and /{state}/{city}/{operation}.

export interface GeoParams {
  locale: string;
  state: string;
  city?: string;
  operation?: string;
}

type SearchParams = Record<string, string | string[] | undefined>;

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

function placeName(match: Pick<GeoMatch, "state" | "city">, locale: string) {
  const state = locationLabel(match.state, locale);
  return match.city ? `${locationLabel(match.city, locale)}, ${state}` : state;
}

function pageTitle(match: GeoMatch, locale: string) {
  const dict = dictionaryFor(locale);
  const template = (match.operation && dict[`geoTitle_${match.operation}`]) || dict.geoTitle;
  return fill(template, { place: placeName(match, locale) });
}

function lockedFilters(match: Pick<GeoMatch, "state" | "city" | "operation">): Filters {
  return {
    state_id: match.state.id,
    ...(match.city && { city_id: match.city.id }),
    ...(match.operation && { listingType: OPERATIONS[match.operation].filter }),
  };
}

/** Home › Properties › State › City › Operation (the last crumb is the current page). */
function geoBreadcrumbs(match: GeoMatch, locale: string): JsonLdCrumb[] {
  const dict = dictionaryFor(locale);
  const crumbs: JsonLdCrumb[] = [
    { label: dict.breadcrumbHome, href: localizedPath(locale, "home") },
    { label: dict.properties, href: localizedPath(locale, "properties") },
    { label: locationLabel(match.state, locale), href: geoPath(locale, match.state) },
  ];
  if (match.city) {
    crumbs.push({ label: locationLabel(match.city, locale), href: geoPath(locale, match.state, match.city) });
    if (match.operation) {
      crumbs.push({
        label: dict[`geoOperation_${match.operation}`],
        href: geoPath(locale, match.state, match.city, match.operation),
      });
    }
  }
  return crumbs;
}

/**
 * Next level up when a page has no listings: operation → city → state → all properties.
 * Returns null for the general listing (no place to name).
 */
function parentLevel(match: GeoMatch, locale: string) {
  if (match.operation) {
    const parent = { state: match.state, city: match.city, operation: null };
    return { filters: lockedFilters(parent), place: placeName(parent, locale), href: geoPath(locale, match.state, match.city) };
  }
  if (match.city) {
    const parent = { state: match.state, city: null, operation: null };
    return { filters: lockedFilters(parent), place: placeName(parent, locale), href: geoPath(locale, match.state) };
  }
  return null;
}

export async function generateGeoMetadata(params: GeoParams, searchParams: SearchParams): Promise<Metadata> {
  const { locale } = params;
  const match = await resolveGeo(locale, params.state, params.city, params.operation);
  if (!match) return { robots: { index: false, follow: true } };

  const dict = dictionaryFor(locale);
  const page = parsePage(searchParams);
  const title = pageTitle(match, locale);
  const base = buildMetadata(locale, match.paths, "metaTitle", "metaDescription", page > 1 ? `?page=${page}` : "");
  // Thin pages and any query beyond pagination are not indexed.
  const hasOtherParams = Object.keys(searchParams).some((key) => key !== "page");
  const indexable = match.count >= MIN_INDEXABLE_LISTINGS && !hasOtherParams;

  return {
    ...base,
    title: fill(dict.geoMetaTitle, { title }),
    description: fill(dict.geoMetaDescription, { count: match.count, place: placeName(match, locale) }),
    ...(!indexable && { robots: { index: false, follow: true } }),
  };
}

export async function GeoListingPage({ params, searchParams }: { params: GeoParams; searchParams: SearchParams }) {
  const { locale } = params;
  const match = await resolveGeo(locale, params.state, params.city, params.operation);
  if (!match) notFound();
  // The proxy already 301s outdated slugs; this covers it if its path index is unavailable.
  if (!match.isCanonical) permanentRedirect(match.paths[locale === "en" ? "en" : "es"]);

  const dict = dictionaryFor(locale);
  const filters = lockedFilters(match);
  const page = parsePage(searchParams);
  const title = pageTitle(match, locale);

  const [own, states, cities, children] = await Promise.all([
    getPublicProperties({ ...toApiParams(filters), page, items: ITEMS_PER_PAGE }),
    getStates(),
    getCities(match.state.id),
    geoChildren(locale, match),
  ]);

  // Empty page: show the next level up instead of a dead end (the page is noindex anyway).
  const isEmpty = own?.metadata.count === 0;
  const parent = isEmpty ? parentLevel(match, locale) : null;
  const listing = isEmpty
    ? await getPublicProperties({ ...toApiParams(parent?.filters ?? {}), page, items: ITEMS_PER_PAGE })
    : own;

  const crumbs = geoBreadcrumbs(match, locale);
  const jsonLd = [
    breadcrumbJsonLd(crumbs),
    ...(!isEmpty && own ? [itemListJsonLd(title, own.data, locale, (page - 1) * ITEMS_PER_PAGE)] : []),
  ];

  const byLabel = (a: State | City, b: State | City) =>
    locationLabel(a, locale).localeCompare(locationLabel(b, locale), locale);
  const childrenTitle = match.city ? dict.geoOperationsTitle : dict.geoCitiesTitle;
  const childLabel = (label: string) => (match.city ? dict[`geoOperation_${label as OperationKey}`] : label);

  const emptyNotice = (() => {
    if (!isEmpty) return null;
    if (!parent) {
      return (
        <>
          {dict.geoEmptyNoticeAll}{" "}
          <Link href={localizedPath(locale, "properties")} className="font-medium underline underline-offset-2">
            {dict.viewAllProperties}
          </Link>
        </>
      );
    }
    const [before, after] = dict.geoEmptyNotice.split("{place}");
    return (
      <>
        {before}
        <Link href={parent.href} className="font-medium underline underline-offset-2">
          {parent.place}
        </Link>
        {after}
      </>
    );
  })();

  return (
    <>
      <JsonLdScripts data={jsonLd} />
      <PropertiesClient
        header={
          <header className="mb-8">
            <Breadcrumbs items={crumbs.map((crumb, index) => (index === crumbs.length - 1 ? { label: crumb.label } : crumb))} className="mb-4" />
            <PageTitle className="mb-3 text-3xl md:text-4xl">{title}</PageTitle>
            <p className="max-w-3xl text-brand-carbon/70">
              {fill(dict.geoIntro, { place: placeName(match, locale) })}
            </p>
            {children.length > 0 && (
              <nav aria-label={childrenTitle} className="mt-5 flex flex-wrap gap-2">
                {children.map((child) => (
                  <Link key={child.key} href={child.href} className={chipClasses({ size: "md" })}>
                    {childLabel(child.label)}
                    <span className="tabular-nums text-brand-gray">{child.count}</span>
                  </Link>
                ))}
              </nav>
            )}
            {emptyNotice && <Alert className="mt-5 max-w-3xl">{emptyNotice}</Alert>}
          </header>
        }
        locale={locale}
        listingPath={localizedPath(locale, "properties")}
        lockedFilters={filters}
        filters={filters}
        properties={listing?.data ?? []}
        page={page}
        totalPages={listing?.metadata.pages ?? 0}
        totalCount={listing?.metadata.count ?? 0}
        hasNoResults={false}
        isError={!listing}
        cities={[...cities].sort(byLabel)}
        states={[...states].sort(byLabel)}
      />
    </>
  );
}

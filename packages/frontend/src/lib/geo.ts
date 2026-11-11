import { OPERATIONS, findOperationBySegment, geoPath, geoPaths, localePrefix, type LocalizedPaths, type OperationKey } from "@properlia/shared/lib/routes";
import type { PublicLocationPath, PublicPaths } from "@properlia/shared/types";
import { matchesSlug } from "./pathIndex";
import { getPublicPaths } from "./propertyQueries";

/** Geo pages with fewer public listings than this are noindex and stay out of the sitemap. */
export const MIN_INDEXABLE_LISTINGS = 3;

type CityPath = PublicLocationPath & { state_id: string };

export interface GeoMatch {
  state: PublicLocationPath;
  city: CityPath | null;
  operation: OperationKey | null;
  /** Public listings in this state/city/operation. */
  count: number;
  paths: LocalizedPaths;
  /** False when the URL used an outdated or other-locale slug. */
  isCanonical: boolean;
}

export const locationLabel = (location: { name: string; es_name: string }, locale: string) =>
  (locale === "es" && location.es_name) || location.name;

export function countListings(
  paths: PublicPaths,
  stateId: string,
  cityId?: string | null,
  operation?: OperationKey | null
): number {
  const listingType = operation ? OPERATIONS[operation].listingType : null;
  return paths.properties.filter(
    (p) =>
      p.state_id === stateId &&
      (!cityId || p.city_id === cityId) &&
      (!listingType || p.listing_type === listingType)
  ).length;
}

export async function resolveGeo(
  locale: string,
  stateSlug: string,
  citySlug?: string,
  operationSlug?: string
): Promise<GeoMatch | null> {
  const paths = await getPublicPaths();

  const state = paths.states.find((s) => matchesSlug(s, stateSlug));
  if (!state) return null;

  const city = citySlug
    ? paths.cities.find((c) => c.state_id === state.id && matchesSlug(c, citySlug)) ?? null
    : null;
  if (citySlug && !city) return null;

  const operation = operationSlug ? findOperationBySegment(operationSlug) ?? null : null;
  if (operationSlug && !operation) return null;

  const requested = `${localePrefix(locale)}/${[stateSlug, citySlug, operationSlug].filter(Boolean).join("/")}`;
  return {
    state,
    city,
    operation,
    count: countListings(paths, state.id, city?.id, operation),
    paths: geoPaths(state, city, operation),
    isCanonical: geoPath(locale, state, city, operation) === requested,
  };
}

/** Child links of a geo page: cities of a state, or operations of a city (only those with listings). */
export async function geoChildren(locale: string, match: GeoMatch) {
  const paths = await getPublicPaths();

  if (!match.city) {
    return paths.cities
      .filter((city) => city.state_id === match.state.id)
      .map((city) => ({ city, count: countListings(paths, match.state.id, city.id) }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => locationLabel(a.city, locale).localeCompare(locationLabel(b.city, locale), locale))
      .map(({ city, count }) => ({
        key: city.id,
        label: locationLabel(city, locale),
        href: geoPath(locale, match.state, city),
        count,
      }));
  }

  if (!match.operation) {
    return (Object.keys(OPERATIONS) as OperationKey[])
      .map((operation) => ({ operation, count: countListings(paths, match.state.id, match.city!.id, operation) }))
      .filter(({ count }) => count > 0)
      .map(({ operation, count }) => ({
        key: operation,
        label: operation,
        href: geoPath(locale, match.state, match.city, operation),
        count,
      }));
  }

  return [];
}

export interface GeoLink {
  key: string;
  label: string;
  href: string;
}

/** Indexable city pages with the most listings, for sitewide links (footer). */
export async function topCityLinks(locale: string, limit = 6): Promise<GeoLink[]> {
  const paths = await getPublicPaths();
  const statesById = new Map(paths.states.map((state) => [state.id, state]));

  return paths.cities
    .map((city) => ({ city, state: statesById.get(city.state_id), count: countListings(paths, city.state_id, city.id) }))
    .filter(({ state, count }) => state && count >= MIN_INDEXABLE_LISTINGS)
    .sort((a, b) => b.count - a.count || locationLabel(a.city, locale).localeCompare(locationLabel(b.city, locale), locale))
    .slice(0, limit)
    .map(({ city, state }) => ({ key: city.id, label: locationLabel(city, locale), href: geoPath(locale, state!, city) }));
}

import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  OPERATIONS,
  ROUTES,
  findOperationByFilter,
  findOperationBySegment,
  findRouteBySegment,
  geoPath,
  isLocale,
  locationSlug,
  type Locale,
} from "@properlia/shared/lib/routes";
import { parsePropertyCode, propertyPathFromSlug } from "@properlia/shared/lib/slugify";
import { findCity, findState, getPathIndex } from "@/src/lib/pathIndex";

// Public URLs are localized and Spanish lives at the root (/propiedades, /contacto; English
// under /en/properties…) while app/[locale]/ keeps one folder per page. This proxy:
//  - 301s every outdated URL (/es/... prefix, English segments without /en, legacy property
//    and filter URLs, old title/location slugs, uppercase) to its final URL in one hop;
//  - rewrites public localized URLs to the internal app/[locale]/ folders.
// resolve() works with locale-prefixed paths; toPublicPath() drops the Spanish prefix.

const LEGACY_GEO_PARAMS = new Set(["state_id", "city_id", "type", "page"]);

interface Resolution {
  publicPath: string;
  /** Replaces the query string when set (e.g. legacy filters folded into the path). */
  search?: string;
  /** app/[locale]/ path that renders the page, when it differs from publicPath. */
  internalPath?: string;
}

const toPublicPath = (locale: Locale, path: string): string =>
  locale === DEFAULT_LOCALE ? path.slice(`/${locale}`.length) || "/" : path;

const unchanged = (locale: Locale, rest: string[]): Resolution => ({
  publicPath: `/${[locale, ...rest].join("/")}`,
});

/** /properties?state_id=…[&city_id=…[&type=…]][&page=N] => /{state}[/{city}[/{operation}]] */
async function resolveLegacyGeoQuery(locale: Locale, params: URLSearchParams): Promise<Resolution | null> {
  const keys = [...params.keys()].filter((key) => key !== "_rsc");
  const stateId = params.get("state_id");
  const cityId = params.get("city_id");
  const type = params.get("type");
  if (!stateId || keys.some((key) => !LEGACY_GEO_PARAMS.has(key))) return null;
  if (type && !cityId) return null;

  const index = await getPathIndex();
  const state = index?.statesById.get(stateId);
  const city = cityId ? index?.citiesById.get(cityId) : null;
  const operation = type ? findOperationByFilter(type) : null;
  if (!state || (cityId && city?.state_id !== state.id) || (type && !operation)) return null;

  const page = Number(params.get("page"));
  return {
    publicPath: geoPath(locale, state, city, operation),
    search: Number.isInteger(page) && page > 1 ? `?page=${page}` : "",
  };
}

async function resolveProperties(locale: Locale, rest: string[], params: URLSearchParams): Promise<Resolution> {
  const publicBase = `/${locale}/${ROUTES.properties[locale]}`;
  const internalBase = `/${locale}/${ROUTES.properties.internal}`;

  // Listing
  if (rest.length === 1) {
    return (
      (await resolveLegacyGeoQuery(locale, params)) ?? { publicPath: publicBase, internalPath: internalBase }
    );
  }

  // Detail: /{title-slug}-{code}; the slug follows the current title
  if (rest.length === 2) {
    const code = parsePropertyCode(rest[1]);
    const entry = code ? (await getPathIndex())?.propertiesByCode.get(code) : undefined;
    const slug = entry ? (locale === "en" ? entry.slug_en : entry.slug_es) : rest[1];
    return { publicPath: `${publicBase}/${slug}`, internalPath: `${internalBase}/${slug}` };
  }

  // Legacy detail: /properties/{state}/{city}/{uuid}/{slug}
  if (rest.length === 5) {
    const entry = (await getPathIndex())?.propertiesById.get(rest[3]);
    if (entry) {
      return { publicPath: propertyPathFromSlug(locale, locale === "en" ? entry.slug_en : entry.slug_es) };
    }
  }

  return unchanged(locale, rest);
}

/** /{state}[/{city}[/{operation}]] with current slugs for the locale. */
async function resolveGeo(locale: Locale, rest: string[]): Promise<Resolution> {
  if (rest.length > 3) return unchanged(locale, rest);

  const index = await getPathIndex();
  const state = index && findState(index, rest[0]);
  if (!index || !state) return unchanged(locale, rest);

  const parts = [locationSlug(state, locale)];
  if (rest[1]) {
    const city = findCity(index, state.id, rest[1]);
    if (!city) return unchanged(locale, rest);
    parts.push(locationSlug(city, locale));
  }
  if (rest[2]) {
    const operation = findOperationBySegment(rest[2]);
    if (!operation) return unchanged(locale, rest);
    parts.push(OPERATIONS[operation][locale]);
  }
  return { publicPath: `/${[locale, ...parts].join("/")}` };
}

async function resolve(locale: Locale, rest: string[], params: URLSearchParams): Promise<Resolution> {
  if (rest.length === 0) return { publicPath: `/${locale}` };

  const route = findRouteBySegment(rest[0]);
  if (route === "properties") return resolveProperties(locale, rest, params);
  if (route) {
    const tail = rest.slice(1);
    return {
      publicPath: `/${[locale, ROUTES[route][locale], ...tail].join("/")}`,
      internalPath: `/${[locale, ROUTES[route].internal, ...tail].join("/")}`,
    };
  }
  return resolveGeo(locale, rest);
}

export async function proxy(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean).map((segment) => segment.toLowerCase());
  const hasLocale = isLocale(segments[0]);

  // Unknown locale-like prefix (/fr/...): plain 404 instead of redirecting to /es/fr/...
  if (!hasLocale && /^[a-z]{2}(-[a-z]{2})?$/.test(segments[0] ?? "") && !findRouteBySegment(segments[0])) {
    return NextResponse.next();
  }

  const locale: Locale = hasLocale ? (segments[0] as Locale) : DEFAULT_LOCALE;
  const rest = hasLocale ? segments.slice(1) : segments;
  const resolution = await resolve(locale, rest, searchParams);

  const target = `${toPublicPath(locale, resolution.publicPath)}${resolution.search ?? search}`;
  if (target !== `${pathname}${search}`) {
    return NextResponse.redirect(new URL(target, req.url), 301);
  }

  const internalPath = resolution.internalPath ?? resolution.publicPath;
  return internalPath !== pathname
    ? NextResponse.rewrite(new URL(`${internalPath}${search}`, req.url))
    : NextResponse.next();
}

export const config = {
  // Everything except Next internals, API routes and files with an extension (robots.txt, sitemap.xml, images…)
  matcher: ["/((?!_next|api|.*\\.[a-zA-Z0-9]+$).*)"],
};

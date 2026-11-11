import { OPERATIONS, geoPaths, routePaths, type LocalizedPaths, type OperationKey, type RouteKey } from "@properlia/shared/lib/routes";
import { propertyPathFromSlug } from "@properlia/shared/lib/slugify";
import { propertyApi } from "@properlia/shared/services/properties/api";
import type { PublicPaths } from "@properlia/shared/types";
import { absoluteUrl } from "./metadata";
import { MIN_INDEXABLE_LISTINGS, countListings } from "./geo";
import { PROPERTIES_CACHE } from "./propertyQueries";

// Split sitemap: /sitemap.xml is an index of /sitemaps/{static,geo,properties-N}.xml.
// Only indexable, current URLs; every entry lists its es/en/x-default alternates.

/** Properties per sitemap file (each yields an es and an en URL; the protocol limit is 50,000). */
export const PROPERTIES_PER_SITEMAP = 5000;

type ChangeFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface SitemapEntry {
  paths: LocalizedPaths;
  lastModified?: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
}

const STATIC_ROUTES: { key: RouteKey; priority: number; changeFrequency: ChangeFrequency }[] = [
  { key: "home", priority: 1.0, changeFrequency: "weekly" },
  { key: "properties", priority: 0.8, changeFrequency: "daily" },
  { key: "buyerConsultation", priority: 0.7, changeFrequency: "monthly" },
  { key: "sellerConsultation", priority: 0.7, changeFrequency: "monthly" },
  { key: "services", priority: 0.6, changeFrequency: "monthly" },
  { key: "contact", priority: 0.6, changeFrequency: "monthly" },
  { key: "privacy", priority: 0.2, changeFrequency: "yearly" },
  { key: "terms", priority: 0.2, changeFrequency: "yearly" },
];

/** Throws on API errors so a failed fetch never publishes a sitemap without properties. */
export const fetchSitemapPaths = (): Promise<PublicPaths> => propertyApi.getPublicPaths(PROPERTIES_CACHE);

export function latestUpdate(paths: PublicPaths, propertyIds?: Set<string>): Date | undefined {
  return paths.properties.reduce<Date | undefined>((latest, property) => {
    if (propertyIds && !propertyIds.has(property.id)) return latest;
    const date = new Date(property.updated_at);
    return !latest || date > latest ? date : latest;
  }, undefined);
}

export function staticEntries(paths: PublicPaths): SitemapEntry[] {
  const listingUpdate = latestUpdate(paths);
  return STATIC_ROUTES.map(({ key, priority, changeFrequency }) => ({
    paths: routePaths(key),
    priority,
    changeFrequency,
    ...(key === "properties" && listingUpdate && { lastModified: listingUpdate }),
  }));
}

/** State, city and city + operation pages with enough listings (same threshold as their robots tag). */
export function geoEntries(paths: PublicPaths): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const add = (count: number, geo: LocalizedPaths, priority: number) => {
    if (count >= MIN_INDEXABLE_LISTINGS) entries.push({ paths: geo, priority, changeFrequency: "daily" });
  };

  for (const state of paths.states) {
    add(countListings(paths, state.id), geoPaths(state), 0.7);
    for (const city of paths.cities.filter((c) => c.state_id === state.id)) {
      add(countListings(paths, state.id, city.id), geoPaths(state, city), 0.7);
      for (const operation of Object.keys(OPERATIONS) as OperationKey[]) {
        add(countListings(paths, state.id, city.id, operation), geoPaths(state, city, operation), 0.6);
      }
    }
  }
  return entries;
}

export const propertyChunkCount = (paths: PublicPaths) =>
  Math.max(1, Math.ceil(paths.properties.length / PROPERTIES_PER_SITEMAP));

/** Properties of the 1-based chunk `page`. */
export function propertyChunk(paths: PublicPaths, page: number) {
  const start = (page - 1) * PROPERTIES_PER_SITEMAP;
  return paths.properties.slice(start, start + PROPERTIES_PER_SITEMAP);
}

export function propertyEntries(properties: PublicPaths["properties"]): SitemapEntry[] {
  return properties.map((property) => ({
    paths: { es: propertyPathFromSlug("es", property.slug_es), en: propertyPathFromSlug("en", property.slug_en) },
    lastModified: new Date(property.updated_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));
}

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** <urlset> with one <url> per locale, each listing es / en / x-default alternates. */
export function renderUrlSet(entries: SitemapEntry[]): string {
  const urls = entries.flatMap((entry) => {
    const alternates = [
      ["es", entry.paths.es],
      ["en", entry.paths.en],
      ["x-default", entry.paths.es],
    ]
      .map(([lang, path]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(absoluteUrl(path))}"/>`)
      .join("");
    const lastmod = entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : "";

    return (["es", "en"] as const).map(
      (locale) =>
        `<url><loc>${escapeXml(absoluteUrl(entry.paths[locale]))}</loc>${alternates}${lastmod}` +
        `<changefreq>${entry.changeFrequency}</changefreq><priority>${entry.priority.toFixed(1)}</priority></url>`
    );
  });

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join("\n") +
    "\n</urlset>\n"
  );
}

export function renderSitemapIndex(sitemaps: { path: string; lastModified?: Date }[]): string {
  const items = sitemaps.map(
    ({ path, lastModified }) =>
      `<sitemap><loc>${escapeXml(absoluteUrl(path))}</loc>${
        lastModified ? `<lastmod>${lastModified.toISOString()}</lastmod>` : ""
      }</sitemap>`
  );
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    items.join("\n") +
    "\n</sitemapindex>\n"
  );
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

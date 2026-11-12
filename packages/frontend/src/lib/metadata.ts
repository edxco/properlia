import type { Metadata } from "next";
import { enMessages as en, esMessages as es } from "@properlia/shared";
import { routePaths, toLocale, type LocalizedPaths, type Locale, type RouteKey } from "@properlia/shared/lib/routes";

export const BASE_URL = "https://properlia.com";

const dictionaries: Record<Locale, Record<string, string>> = { en, es };

export const dictionaryFor = (locale: string) => dictionaries[toLocale(locale)];

export const absoluteUrl = (path: string) => `${BASE_URL}${path}`;

const OG_IMAGE = { url: absoluteUrl("/og-home.jpg"), width: 1200, height: 630 };
const OG_LOCALES: Record<Locale, string> = { es: "es_MX", en: "en_US" };

/**
 * Title, description, self-referencing canonical and hreflang (es / en / x-default).
 * `route` is a fixed page key or the page's path in each locale (paths differ per language).
 * `query` (e.g. "?page=2") is appended to the canonical and alternates.
 */
export function buildMetadata(
  locale: string,
  route: RouteKey | LocalizedPaths,
  titleKey: string,
  descriptionKey: string,
  query = ""
): Metadata {
  const loc = toLocale(locale);
  const dict = dictionaries[loc];
  const paths = typeof route === "string" ? routePaths(route) : route;

  const title = dict[titleKey] ?? titleKey;
  const description = dict[descriptionKey] ?? descriptionKey;
  const canonical = absoluteUrl(`${paths[loc]}${query}`);

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Properlia",
      locale: OG_LOCALES[loc],
      title,
      description,
      url: canonical,
      images: [{ ...OG_IMAGE, alt: dict.heroImageAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
    alternates: {
      canonical,
      languages: {
        es: absoluteUrl(`${paths.es}${query}`),
        en: absoluteUrl(`${paths.en}${query}`),
        "x-default": absoluteUrl(`${paths.es}${query}`),
      },
    },
  };
}

import type { Metadata } from "next";
import { enMessages as en, esMessages as es } from "@properlia/shared";
import { routePaths, toLocale, type LocalizedPaths, type Locale, type RouteKey } from "@properlia/shared/lib/routes";

export const BASE_URL = "https://properlia.com";

const dictionaries: Record<Locale, Record<string, string>> = { en, es };

export const dictionaryFor = (locale: string) => dictionaries[toLocale(locale)];

export const absoluteUrl = (path: string) => `${BASE_URL}${path}`;

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

  return {
    title: dict[titleKey] ?? titleKey,
    description: dict[descriptionKey] ?? descriptionKey,
    alternates: {
      canonical: absoluteUrl(`${paths[loc]}${query}`),
      languages: {
        es: absoluteUrl(`${paths.es}${query}`),
        en: absoluteUrl(`${paths.en}${query}`),
        "x-default": absoluteUrl(`${paths.es}${query}`),
      },
    },
  };
}

import type { Metadata } from "next";
import { enMessages as en, esMessages as es } from "@properlia/shared";

const SUPPORTED_LOCALES = ["es", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const dictionaries: Record<Locale, Record<string, string>> = { en, es };
const BASE_URL = "https://properlia.com";

export function buildMetadata(
  locale: string,
  path: string,
  titleKey: string,
  descriptionKey: string
): Metadata {
  const normalizedLocale = SUPPORTED_LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : "es";
  const dict = dictionaries[normalizedLocale];
  const cleanPath = path === "/" ? "" : path;

  return {
    title: dict[titleKey],
    description: dict[descriptionKey],
    alternates: {
      canonical: `${BASE_URL}/${normalizedLocale}${cleanPath}`,
      languages: {
        es: `${BASE_URL}/es${cleanPath}`,
        en: `${BASE_URL}/en${cleanPath}`,
        "x-default": `${BASE_URL}/es${cleanPath}`,
      },
    },
  };
}

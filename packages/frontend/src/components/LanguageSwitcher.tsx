"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const SUPPORTED_LOCALES = ["es", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = (pathname.split("/")[1] as Locale) || "en";
  const nextLocale: Locale = currentLocale === "es" ? "en" : "es";

  const currentLabel = LOCALE_LABELS[currentLocale];
  const ariaLabel =
    currentLocale === "es"
      ? "Cambiar idioma a inglés"
      : "Switch language to Spanish";

  function switchLanguage() {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;

    const segments = pathname.split("/");
    segments[1] = nextLocale;

    router.push(segments.join("/"));
  }

  return (
    <button
      onClick={switchLanguage}
      aria-label={ariaLabel}
      className="flex items-center gap-2 px-3 py-2 text-stone-700 text-sm font-medium tracking-wide rounded-md transition-all duration-200 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
    >
      <Languages className="w-4 h-4" aria-hidden="true" />
      <span>{currentLabel}</span>
    </button>
  );
}

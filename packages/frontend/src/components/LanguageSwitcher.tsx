"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@properlia/shared/components/ui";

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
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLanguage}
      aria-label={ariaLabel}
      className="px-3 tracking-wide text-brand-carbon hover:bg-brand-bg hover:text-brand-navy active:bg-brand-border"
    >
      <Languages className="w-4 h-4" aria-hidden="true" />
      <span>{currentLabel}</span>
    </Button>
  );
}

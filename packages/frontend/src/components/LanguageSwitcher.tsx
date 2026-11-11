"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { buttonClasses } from "@properlia/shared/components/ui";
import { switchLocalePath, type Locale } from "@properlia/shared/lib/routes";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

// Crawlable link to the same page in the other language. Fixed segments are
// translated here; location and title slugs are corrected by the proxy (301).
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const currentLocale: Locale = segment === "en" ? "en" : "es";
  const nextLocale: Locale = currentLocale === "es" ? "en" : "es";

  const ariaLabel = currentLocale === "es" ? "Cambiar idioma a inglés" : "Switch language to Spanish";

  return (
    <Link
      href={switchLocalePath(pathname, nextLocale)}
      hrefLang={nextLocale}
      aria-label={ariaLabel}
      className={buttonClasses({
        variant: "ghost",
        size: "sm",
        className: "px-3 tracking-wide text-brand-carbon hover:bg-brand-bg hover:text-brand-navy active:bg-brand-border",
      })}
    >
      <Languages className="w-4 h-4" aria-hidden="true" />
      <span>{LOCALE_LABELS[currentLocale]}</span>
    </Link>
  );
}

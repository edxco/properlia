"use client";

import { usePathname, useRouter } from "next/navigation";

const SUPPORTED_LOCALES = ["es", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split("/")[1] as Locale;
  const nextLocale: Locale = currentLocale === "es" ? "en" : "es";

  const flag = nextLocale === "es" ? "🇲🇽" : "🇺🇸";

  // const label = nextLocale === "es" ? `Change to ${flag}` : `Cambiar a ${flag}`;

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
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "2.9rem",
      }}
    >
      {flag}
    </button>
  );
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["es", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: Locale = "es";

function extractLocale(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return SUPPORTED_LOCALES.includes(segment as Locale)
    ? (segment as Locale)
    : null;
}

function detectBrowserLocale(req: NextRequest): Locale | null {
  const header = req.headers.get("accept-language");
  if (!header) return null;

  const langs = header.split(",").map((lang) => lang.trim().slice(0, 2));

  for (const lang of langs) {
    if (SUPPORTED_LOCALES.includes(lang as Locale)) return lang as Locale;
  }

  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const currentLocale = extractLocale(pathname);

  if (currentLocale) {
    const res = NextResponse.next();
    const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;

    if (cookieLocale !== currentLocale) {
      res.cookies.set("NEXT_LOCALE", currentLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  }

  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value as
    | Locale
    | undefined;

  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return NextResponse.redirect(
      new URL(`/${cookieLocale}${pathname}`, req.url)
    );
  }

  const browserLocale = detectBrowserLocale(req);

  if (browserLocale) {
    return NextResponse.redirect(
      new URL(`/${browserLocale}${pathname}`, req.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/${DEFAULT_LOCALE}${pathname}`, req.url)
  );
}

export const config = {
  matcher: ["/((?!_next|static|images|favicon.ico|api).*)"],
};

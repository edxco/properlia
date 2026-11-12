import type { Metadata } from "next";
import "@properlia/shared/styles/globals.css";
import { Playfair_Display, Inter } from "next/font/google";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  variable: "--font-editorial-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-editorial-body",
  display: "swap",
});

import { enMessages as en, esMessages as es } from "@properlia/shared";
import { QueryProvider } from "@/src/providers/QueryProvider";
import { TranslationProvider } from "@properlia/shared/components/TranslationProvider";
import { Navigation } from "@/src/components/Navigation";
import { Footer } from "@/src/components/Footer";
import { GoogleAnalytics, GoogleTagManager } from "@properlia/shared";
import { buildMetadata } from "@/src/lib/metadata";
import { topCityLinks } from "@/src/lib/geo";
import { getGeneralInfo } from "@/src/lib/generalInfo";
import { JsonLdScripts } from "@/src/lib/jsonLd";
import { siteJsonLd } from "@/src/lib/structuredData";

const SUPPORTED_LOCALES = ["es", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const dictionaries: Record<Locale, any> = { en, es };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "home", "metaTitle", "metaDescription");
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const { locale } = await params;

  const normalizedLocale = SUPPORTED_LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : "es";

  const dict = dictionaries[normalizedLocale];
  const [cityLinks, generalInfo] = await Promise.all([topCityLinks(normalizedLocale), getGeneralInfo()]);

  return (
    <html lang={normalizedLocale} className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <head>
        <JsonLdScripts data={[siteJsonLd(normalizedLocale, generalInfo)]} />
      </head>
      <body suppressHydrationWarning>
        <GoogleTagManager gtmId={gtmId} />
        <GoogleAnalytics gaId={gaId} />
        <QueryProvider>
          <TranslationProvider dictionary={dict} locale={normalizedLocale}>
            <a
              href="#contenido"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-navy focus:shadow-overlay focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {dict.skipToContent}
            </a>
            <Navigation />
            <main id="contenido" className="pt-20">{children}</main>
            <Footer locale={normalizedLocale} cityLinks={cityLinks} />
          </TranslationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

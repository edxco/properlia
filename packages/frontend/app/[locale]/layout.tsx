import type { Metadata } from "next";
import "@properlia/shared/styles/globals.css";

import { enMessages as en, esMessages as es } from "@properlia/shared";
import { QueryProvider } from "@/src/providers/QueryProvider";
import { TranslationProvider } from "@properlia/shared/components/TranslationProvider";
import { Navigation } from "@/src/components/Navigation";
import { Footer } from "@/src/components/Footer";
import { GoogleAnalytics, GoogleTagManager } from "@properlia/shared";
import { buildMetadata } from "@/src/lib/metadata";

const SUPPORTED_LOCALES = ["es", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const dictionaries: Record<Locale, any> = { en, es };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": "https://properlia.com/#organization",
      name: "Properlia",
      url: "https://properlia.com",
      logo: "https://properlia.com/properlia.png",
      image: "https://properlia.com/properlia.png",
      description:
        "Properlia is a real estate platform in Puebla, Mexico. We help buyers find their ideal property and sellers get the best price.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Torre Ejecutiva JV II, Atlixcáyotl 5208, Piso 15",
        addressLocality: "San Bernardino Tlaxcalancingo",
        addressRegion: "Puebla",
        addressCountry: "MX",
      },
      areaServed: {
        "@type": "State",
        name: "Puebla",
      },
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": "https://properlia.com/#website",
      url: "https://properlia.com",
      name: "Properlia",
      publisher: { "@id": "https://properlia.com/#organization" },
      inLanguage: ["es", "en"],
    },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "/", "metaTitle", "metaDescription");
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

  return (
    <html lang={normalizedLocale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <GoogleTagManager gtmId={gtmId} />
        <GoogleAnalytics gaId={gaId} />
        <QueryProvider>
          <TranslationProvider dictionary={dict} locale={normalizedLocale}>
            <Navigation />
            <main className="pt-20">{children}</main>
            <Footer />
          </TranslationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "@properlia/shared/styles/globals.css";

import { enMessages as en, esMessages as es } from "@properlia/shared";
import { QueryProvider } from "@/src/providers/QueryProvider";
import { TranslationProvider } from "@properlia/shared/components/TranslationProvider";
import { Navigation } from "@/src/components/Navigation";
import { Footer } from "@/src/components/Footer";
import GoogleAnalytics from "@/src/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Properlia",
  description: "Real Estate Management Platform",
};

const SUPPORTED_LOCALES = ["es", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const dictionaries: Record<Locale, any> = { en, es };

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
  const { locale } = await params;

  const normalizedLocale = SUPPORTED_LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : "es";

  const dict = dictionaries[normalizedLocale];

  return (
    <html lang={normalizedLocale} suppressHydrationWarning>
      <body suppressHydrationWarning>
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

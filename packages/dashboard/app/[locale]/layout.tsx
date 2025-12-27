import type { Metadata } from "next";
import "../globals.css";

import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { TranslationProvider } from "@/src/components/TranslationProvider";
import { QueryProvider } from "@/src/providers/QueryProvider";
import { AuthProvider } from "@/src/contexts/AuthContext";

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
  const { locale } = await params;

  const normalizedLocale = SUPPORTED_LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : "es";

  const dict = dictionaries[normalizedLocale];

  return (
    <html lang={normalizedLocale}>
      <body>
        <QueryProvider>
          <AuthProvider>
            <TranslationProvider dictionary={dict} locale={normalizedLocale}>
              {children}
            </TranslationProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

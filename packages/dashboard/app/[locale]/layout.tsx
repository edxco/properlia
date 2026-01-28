import type { Metadata } from "next";
import "@properlia/shared/styles/globals.css";

import { enMessages as en, esMessages as es } from "@properlia/shared";
import { QueryProvider } from "@/src/providers/QueryProvider";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { ToastProvider } from "@/src/contexts/ToastContext";
import { ToastContainer } from "@/src/components/Toast";
import { TranslationProvider } from "@properlia/shared/components/TranslationProvider";

export const metadata: Metadata = {
  title: "Properlia Dashboard",
  description: "Real Estate Management Platform",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
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
              <ToastProvider>
                {children}
                <ToastContainer />
              </ToastProvider>
            </TranslationProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

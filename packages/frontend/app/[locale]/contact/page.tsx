import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { buildMetadata } from "@/src/lib/metadata";
import ContactClient from "./ContactClient";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-editorial-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-editorial-body",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "/contact", "contactMetaTitle", "contactMetaDescription");
}

export default function ContactPage() {
  return (
    <div className={`${playfairDisplay.variable} ${inter.variable}`}>
      <ContactClient />
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import BuyerConsultationClient from "./BuyerConsultationClient";
import { buildMetadata } from "@/src/lib/metadata";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
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
  return buildMetadata(locale, "/buyer-consultation", "buyerMetaTitle", "buyerMetaDescription");
}

export default function BuyerConsultationPage() {
  return (
    <div className={`${playfairDisplay.variable} ${inter.variable}`}>
      <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
        <BuyerConsultationClient />
      </Suspense>
    </div>
  );
}

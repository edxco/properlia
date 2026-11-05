import type { Metadata } from "next";
import { Suspense } from "react";
import BuyerConsultationClient from "./BuyerConsultationClient";
import { buildMetadata } from "@/src/lib/metadata";

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
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <BuyerConsultationClient />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import SellPropertyClient from "./SellPropertyClient";
import { buildMetadata } from "@/src/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "/seller-consultation", "sellerMetaTitle", "sellerMetaDescription");
}

export default function SellPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <SellPropertyClient />
    </Suspense>
  );
}

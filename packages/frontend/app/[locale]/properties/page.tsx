import type { Metadata } from "next";
import { Suspense } from "react";
import PropertiesClient from "./PropertiesClient";
import { buildMetadata } from "@/src/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "/properties", "propertiesMetaTitle", "propertiesMetaDescription");
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <PropertiesClient />
    </Suspense>
  );
}

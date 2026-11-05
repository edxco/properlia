import type { Metadata } from "next";
import { buildMetadata } from "@/src/lib/metadata";
import ContactClient from "./ContactClient";

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
    <ContactClient />
  );
}

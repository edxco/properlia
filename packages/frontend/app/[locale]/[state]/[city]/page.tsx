import type { Metadata } from "next";
import { GeoListingPage, generateGeoMetadata } from "@/src/components/GeoListingPage";

type PageProps = {
  params: Promise<{ locale: string; state: string; city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  return generateGeoMetadata(await params, await searchParams);
}

export default async function Page({ params, searchParams }: PageProps) {
  return <GeoListingPage params={await params} searchParams={await searchParams} />;
}

import { HomeAbout } from "@/src/components/home/HomeAbout";
import { HomeCta } from "@/src/components/home/HomeCta";
import { HomeFeatured } from "@/src/components/home/HomeFeatured";
import { HomeHero } from "@/src/components/home/HomeHero";
import { HomeInsights } from "@/src/components/home/HomeInsights";
import { HomeReviews } from "@/src/components/home/HomeReviews";
import { HomeServices } from "@/src/components/home/HomeServices";
import { HomeTypes } from "@/src/components/home/HomeTypes";
import { HomeZones } from "@/src/components/home/HomeZones";
import { JsonLdScripts } from "@/src/lib/jsonLd";
import { homeWebPageJsonLd } from "@/src/lib/structuredData";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <JsonLdScripts data={[homeWebPageJsonLd(locale)]} />
      <HomeHero locale={locale} />
      <HomeFeatured locale={locale} />
      <HomeTypes locale={locale} />
      <HomeServices locale={locale} />
      <HomeZones locale={locale} />
      <HomeAbout locale={locale} />
      <HomeReviews locale={locale} />
      <HomeInsights locale={locale} />
      <HomeCta locale={locale} />
    </>
  );
}

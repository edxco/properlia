import { Hero } from "../../src/components/Hero";
import { MainAbout } from "@/src/components/MainAbout";
import { FeaturedProperties } from "@/src/components/FeaturedProperties";
import { ServiceTiles } from "@/src/components/ServiceTiles";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <Hero />
      <ServiceTiles />
      <FeaturedProperties locale={locale} />
      {/* <MainAbout /> */}
    </>
  );
}
import { Hero } from "../../src/components/Hero";
import { MainAbout } from "@/src/components/MainAbout";
import { FeaturedProperties } from "@/src/components/FeaturedProperties";
import { ServiceTiles } from "@/src/components/ServiceTiles";

export default function Page() {
  return (
    <>
      <Hero />
      <ServiceTiles />
      <FeaturedProperties />
      {/* <MainAbout /> */}
    </>
  );
}
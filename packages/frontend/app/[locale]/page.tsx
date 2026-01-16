import { Hero } from "../../src/components/Hero";
import { MainAbout } from "@/src/components/MainAbout";
import { FeaturedProperties } from "@/src/components/FeaturedProperties";

export default function Page() {
  return (
    <>
      <Hero />
      <FeaturedProperties />
      <MainAbout />
    </>
  );
};
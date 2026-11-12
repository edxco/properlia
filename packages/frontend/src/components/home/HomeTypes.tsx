import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Container, Section } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";
import { dictionaryFor } from "@/src/lib/metadata";
import HouseImage from "@/public/home/house.webp";
import LandImage from "@/public/home/land.webp";
import RetailImage from "@/public/home/retail.webp";
import WarehouseImage from "@/public/home/warehouse.webp";
import { SectionHeader } from "./SectionHeader";

const TYPES = [
  { key: "Residential", category: "residential", image: HouseImage },
  { key: "Commercial", category: "commercial", image: RetailImage },
  { key: "Industrial", category: "industrial", image: WarehouseImage },
  { key: "Land", category: "land", image: LandImage },
] as const;

export function HomeTypes({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <Section tone="white">
      <Container>
        <SectionHeader eyebrow={dict.homeTypesEyebrow} title={dict.homeTypesTitle} className="mb-10" />

        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {TYPES.map((type) => (
            <li key={type.key} className="group relative aspect-[3/4] overflow-hidden rounded-card shadow-card">
              <Image
                src={type.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 280px, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-6">
                <h3 className="font-display text-2xl font-medium md:text-3xl">{dict[`homeType${type.key}Title`]}</h3>
                <p className="mt-1 hidden text-sm text-white/85 sm:block">{dict[`homeType${type.key}Text`]}</p>
                <Link
                  href={localizedPath(locale, "properties", `?category=${type.category}`)}
                  className="mt-3 inline-flex items-start gap-1.5 text-sm font-medium text-white underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset"
                >
                  {dict[`homeType${type.key}Link`]}
                  <IconArrowRight size={16} stroke={1.75} aria-hidden="true" className="mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

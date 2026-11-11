import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Container, Section } from "@properlia/shared/components/ui";
import { homeZones } from "@/src/lib/geo";
import { dictionaryFor } from "@/src/lib/metadata";
import { SectionHeader } from "./SectionHeader";

export async function HomeZones({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const zones = await homeZones(locale);

  return (
    <Section tone="pale">
      <Container>
        <SectionHeader eyebrow={dict.homeZonesEyebrow} title={dict.homeZonesTitle} intro={dict.homeZonesIntro} className="mb-12" />

        <ul className="grid border-t border-brand-navy/15 md:grid-cols-2 md:gap-x-16">
          {zones.map((zone) => (
            <li
              key={zone.slug}
              className="group relative flex flex-col gap-3 border-b border-brand-navy/15 py-8 transition-colors"
            >
              <h3 className="font-display text-2xl font-medium text-brand-navy md:text-3xl">{zone.label}</h3>
              <p className="max-w-md text-brand-carbon/80">{dict[zone.textKey]}</p>
              {zone.href && (
                <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <Link
                    href={zone.href}
                    className="inline-flex items-center gap-1.5 font-medium text-brand-blue underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    {dict.homeZoneLink} {zone.label}
                    <IconArrowRight size={16} stroke={1.75} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </Link>
                  <span className="shrink-0 tabular-nums text-brand-carbon/70">
                    {zone.count} {zone.count === 1 ? dict.homeZoneCountOne : dict.homeZoneCountMany}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

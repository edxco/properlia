import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Container, Eyebrow, Section, SectionTitle } from "@properlia/shared/components/ui";
import { homeZones } from "@/src/lib/geo";
import { dictionaryFor } from "@/src/lib/metadata";

export async function HomeZones({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const zones = await homeZones(locale);

  return (
    <Section tone="pale">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow>{dict.homeZonesEyebrow}</Eyebrow>
            <SectionTitle className="mt-3">{dict.homeZonesTitle}</SectionTitle>
          </div>
          <p className="text-base text-brand-carbon/80 md:text-lg lg:col-span-5">{dict.homeZonesIntro}</p>
        </div>

        <ul className="mt-14 border-t border-brand-navy/20">
          {zones.map((zone) => (
            <li
              key={zone.slug}
              className="group relative grid gap-3 border-b border-brand-navy/20 py-8 transition-colors hover:bg-white/50 md:grid-cols-12 md:items-center md:gap-8 md:px-4"
            >
              <h3 className="font-display text-4xl font-medium text-brand-navy md:col-span-5 md:text-5xl">{zone.label}</h3>
              <div className="md:col-span-5">
                <p className="max-w-md text-brand-carbon/80">{dict[zone.textKey]}</p>
                {zone.href && (
                  <Link
                    href={zone.href}
                    className="mt-3 inline-flex items-start gap-1 text-sm font-medium text-brand-blue underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    {dict.homeZoneLink} {zone.label}
                    <IconArrowUpRight size={16} stroke={1.75} aria-hidden="true" className="mt-0.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </Link>
                )}
              </div>
              {zone.href && (
                <p className="text-sm tabular-nums text-brand-carbon/70 md:col-span-2 md:text-right">
                  {zone.count} {zone.count === 1 ? dict.homeZoneCountOne : dict.homeZoneCountMany}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

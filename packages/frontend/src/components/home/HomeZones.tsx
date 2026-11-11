import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Container, Eyebrow, Section, SectionTitle } from "@properlia/shared/components/ui";
import { homeZones } from "@/src/lib/geo";
import mapaMexico from "@/public/home/mapa-mexico.png";
import { dictionaryFor } from "@/src/lib/metadata";

export async function HomeZones({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const zones = await homeZones(locale);

  return (
    <Section tone="pale">
      <Container>
        <div>
          <Eyebrow>{dict.homeZonesEyebrow}</Eyebrow>
          <SectionTitle className="mt-3">{dict.homeZonesTitle}</SectionTitle>
          <p className="mt-6 text-base text-brand-carbon/80 md:text-lg">{dict.homeZonesIntro}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <ul className="border-t border-brand-navy/20 lg:col-span-5">
            {zones.map((zone) => (
              <li key={zone.slug} className="group relative border-b border-brand-navy/20 transition-colors hover:bg-white/60">
                <div className="flex items-baseline justify-between gap-4 px-2 py-6 md:px-4">
                  {zone.href ? (
                    <Link
                      href={zone.href}
                      className="inline-flex items-start gap-1 text-base font-medium text-brand-blue underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue md:text-lg"
                    >
                      {dict.homeZoneLink} {zone.label}
                      <IconArrowUpRight size={18} stroke={1.75} aria-hidden="true" className="mt-1 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </Link>
                  ) : (
                    <span className="text-base text-brand-carbon/70 md:text-lg">{zone.label}</span>
                  )}
                  {zone.href && (
                    <span className="shrink-0 text-sm tabular-nums text-brand-carbon/70">
                      {zone.count} {zone.count === 1 ? dict.homeZoneCountOne : dict.homeZoneCountMany}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="lg:col-span-7">
            <Image src={mapaMexico} alt={dict.homeZonesMapLabel} className="mx-auto h-auto w-full max-w-xl" sizes="(min-width: 1024px) 560px, 100vw" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

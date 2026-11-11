import Link from "next/link";
import { IconMapPin } from "@tabler/icons-react";
import { Card, CardTitle, Container, Section, buttonClasses } from "@properlia/shared/components/ui";
import { homeZones } from "@/src/lib/geo";
import { dictionaryFor } from "@/src/lib/metadata";
import { SectionHeader } from "./SectionHeader";

export async function HomeZones({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const zones = await homeZones(locale);

  return (
    <Section tone="pale">
      <Container>
        <SectionHeader eyebrow={dict.homeZonesEyebrow} title={dict.homeZonesTitle} intro={dict.homeZonesIntro} />

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {zones.map((zone) => (
            <Card key={zone.slug} padding="sm" className="flex flex-col">
              <IconMapPin size={24} stroke={1.5} className="text-brand-blue" aria-hidden="true" />
              <CardTitle className="mt-4 text-xl">{zone.label}</CardTitle>
              <p className="mt-2 text-sm text-brand-carbon/80">{dict[zone.textKey]}</p>
              <div className="mt-auto pt-5">
                {zone.href ? (
                  <>
                    <p className="mb-2 text-sm tabular-nums text-brand-carbon/70">
                      {zone.count} {zone.count === 1 ? dict.homeZoneCountOne : dict.homeZoneCountMany}
                    </p>
                    <Link href={zone.href} className={buttonClasses({ variant: "link", className: "justify-start text-left" })}>
                      {dict.homeZoneLink} {zone.label}
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-brand-carbon/70">{dict.homeZoneSoon}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

import Image from "next/image";
import { Container, Eyebrow, Section, SectionTitle } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";
import { dictionaryFor } from "@/src/lib/metadata";
import TowerImage from "@/public/home/tower.webp";
import { HOME_PROCESS_STEPS } from "./homeContent";
import { TextLink } from "./TextLink";

export function HomeAbout({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <Section tone="white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-card lg:col-span-5 lg:aspect-auto lg:min-h-full">
            <Image
              src={TowerImage}
              alt={dict.homeAboutImageAlt}
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-7">
            <Eyebrow>{dict.homeAboutEyebrow}</Eyebrow>
            <SectionTitle className="mt-3">{dict.homeAboutTitle}</SectionTitle>
            <p className="mt-6 text-lg text-brand-carbon">{dict.homeAboutP1}</p>
            <p className="mt-4 text-base text-brand-carbon/80 md:text-lg">{dict.homeAboutP2}</p>
            <TextLink href={localizedPath(locale, "services")} className="mt-6">
              {dict.homeAboutCta}
            </TextLink>

            <h3 className="mt-14 font-display text-2xl font-medium text-brand-navy">{dict.homeProcessTitle}</h3>
            <ol className="mt-6 grid gap-x-8 sm:grid-cols-2">
              {HOME_PROCESS_STEPS.map((step) => (
                <li key={step} className="border-t border-brand-navy/20 py-5">
                  <span aria-hidden="true" className="font-display text-3xl font-medium tabular-nums lining-nums text-brand-blue">
                    {String(step).padStart(2, "0")}
                  </span>
                  <h4 className="mt-3 text-base font-medium text-brand-navy">{dict[`homeProcessStep${step}Title`]}</h4>
                  <p className="mt-1 text-sm text-brand-carbon/80">{dict[`homeProcessStep${step}Text`]}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}

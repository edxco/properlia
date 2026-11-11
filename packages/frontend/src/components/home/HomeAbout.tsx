import { Container, Eyebrow, Section, SectionTitle } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";
import { dictionaryFor } from "@/src/lib/metadata";
import { HOME_PROCESS_STEPS } from "./homeContent";
import { TextLink } from "./TextLink";

export function HomeAbout({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <Section tone="white">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow>{dict.homeAboutEyebrow}</Eyebrow>
            <SectionTitle className="mt-3">{dict.homeAboutTitle}</SectionTitle>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg text-brand-carbon">{dict.homeAboutP1}</p>
            <p className="mt-4 text-base text-brand-carbon/80 md:text-lg">{dict.homeAboutP2}</p>
            <TextLink href={localizedPath(locale, "services")} className="mt-6">
              {dict.homeAboutCta}
            </TextLink>
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <h3 className="font-display text-2xl font-medium text-brand-navy">{dict.homeProcessTitle}</h3>
          <ol className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_PROCESS_STEPS.map((step) => (
              <li key={step} className="border-t border-brand-navy/20 py-6">
                <span aria-hidden="true" className="font-display text-4xl font-medium tabular-nums lining-nums text-brand-blue">
                  {String(step).padStart(2, "0")}
                </span>
                <h4 className="mt-4 text-base font-medium text-brand-navy">{dict[`homeProcessStep${step}Title`]}</h4>
                <p className="mt-2 text-sm text-brand-carbon/80">{dict[`homeProcessStep${step}Text`]}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

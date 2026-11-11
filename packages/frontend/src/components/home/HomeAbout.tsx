import Link from "next/link";
import { Card, CardTitle, Container, Eyebrow, Section, SectionTitle, buttonClasses } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";
import { dictionaryFor } from "@/src/lib/metadata";
import { HOME_PROCESS_STEPS } from "./homeContent";

export function HomeAbout({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <Section tone="white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>{dict.homeAboutEyebrow}</Eyebrow>
            <SectionTitle className="mt-3">{dict.homeAboutTitle}</SectionTitle>
            <p className="mt-5 text-base text-brand-carbon/80 md:text-lg">{dict.homeAboutP1}</p>
            <p className="mt-4 text-base text-brand-carbon/80 md:text-lg">{dict.homeAboutP2}</p>
            <Link href={localizedPath(locale, "services")} className={buttonClasses({ variant: "secondary", className: "mt-8" })}>
              {dict.homeAboutCta}
            </Link>
          </div>

          <div>
            <h3 className="font-display text-2xl font-medium text-brand-navy">{dict.homeProcessTitle}</h3>
            <ol className="mt-6 flex flex-col gap-4">
              {HOME_PROCESS_STEPS.map((step) => (
                <li key={step}>
                  <Card padding="sm" className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-pale text-sm font-medium tabular-nums text-brand-blue">
                      {step}
                    </span>
                    <div>
                      <CardTitle className="text-lg">{dict[`homeProcessStep${step}Title`]}</CardTitle>
                      <p className="mt-1 text-sm text-brand-carbon/80">{dict[`homeProcessStep${step}Text`]}</p>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}

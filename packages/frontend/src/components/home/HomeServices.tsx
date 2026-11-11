import { Container, Eyebrow, Section, SectionTitle } from "@properlia/shared/components/ui";
import { localizedPath, type RouteKey } from "@properlia/shared/lib/routes";
import { dictionaryFor } from "@/src/lib/metadata";
import { SplitLayout } from "./SectionHeader";
import { TextLink } from "./TextLink";

const SERVICES: { titleKey: string; textKey: string; links: { route: RouteKey; labelKey: string }[] }[] = [
  {
    titleKey: "homeService1Title",
    textKey: "homeService1Text",
    links: [
      { route: "buyerConsultation", labelKey: "homeService1LinkBuy" },
      { route: "sellerConsultation", labelKey: "homeService1LinkSell" },
    ],
  },
  {
    titleKey: "homeService2Title",
    textKey: "homeService2Text",
    links: [{ route: "services", labelKey: "homeService2Link" }],
  },
  {
    titleKey: "homeService3Title",
    textKey: "homeService3Text",
    links: [{ route: "sellerConsultation", labelKey: "homeService3Link" }],
  },
];

export function HomeServices({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <Section tone="white">
      <Container>
        <SplitLayout
          aside={
            <>
              <Eyebrow>{dict.homeServicesEyebrow}</Eyebrow>
              <SectionTitle className="mt-3">{dict.homeServicesTitle}</SectionTitle>
              <p className="mt-4 text-base text-brand-carbon/80 md:text-lg">{dict.homeServicesIntro}</p>
              <TextLink href={localizedPath(locale, "services")} className="mt-6">
                {dict.homeServicesAllLink}
              </TextLink>
            </>
          }
        >
          <ol className="border-t border-brand-border">
            {SERVICES.map((service, index) => (
              <li key={service.titleKey} className="grid gap-3 border-b border-brand-border py-8 md:grid-cols-[5rem_1fr] md:gap-6">
                <span aria-hidden="true" className="font-display text-4xl font-medium tabular-nums lining-nums text-brand-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-medium text-brand-navy md:text-3xl">{dict[service.titleKey]}</h3>
                  <p className="mt-3 max-w-xl text-brand-carbon/80">{dict[service.textKey]}</p>
                  <ul className="mt-5 flex flex-col gap-2">
                    {service.links.map((link) => (
                      <li key={link.labelKey}>
                        <TextLink href={localizedPath(locale, link.route)}>{dict[link.labelKey]}</TextLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </SplitLayout>
      </Container>
    </Section>
  );
}

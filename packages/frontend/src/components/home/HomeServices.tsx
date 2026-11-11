import { Container, Eyebrow, Section, SectionTitle } from "@properlia/shared/components/ui";
import { localizedPath, type RouteKey } from "@properlia/shared/lib/routes";
import { dictionaryFor } from "@/src/lib/metadata";
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
    <Section tone="navy">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow className="text-white/70">{dict.homeServicesEyebrow}</Eyebrow>
          <SectionTitle className="mt-3 text-white">{dict.homeServicesTitle}</SectionTitle>
          <p className="mt-4 text-base text-white/80 md:text-lg">{dict.homeServicesIntro}</p>
        </div>

        <ol className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
          {SERVICES.map((service, index) => (
            <li key={service.titleKey} className="flex flex-col border-t border-white/25 pt-6">
              <span aria-hidden="true" className="font-display text-7xl font-medium leading-none tabular-nums lining-nums text-white/20">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-2xl font-medium text-white md:text-3xl">{dict[service.titleKey]}</h3>
              <p className="mt-3 text-white/80">{dict[service.textKey]}</p>
              <ul className="mt-6 flex flex-col gap-2">
                {service.links.map((link) => (
                  <li key={link.labelKey}>
                    <TextLink inverse href={localizedPath(locale, link.route)}>
                      {dict[link.labelKey]}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <TextLink inverse href={localizedPath(locale, "services")}>
            {dict.homeServicesAllLink}
          </TextLink>
        </div>
      </Container>
    </Section>
  );
}

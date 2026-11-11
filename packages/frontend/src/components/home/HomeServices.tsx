import Link from "next/link";
import { IconChartLine, IconHome2, IconSpeakerphone, type Icon } from "@tabler/icons-react";
import { Card, CardTitle, Container, Section, buttonClasses } from "@properlia/shared/components/ui";
import { localizedPath, type RouteKey } from "@properlia/shared/lib/routes";
import { dictionaryFor } from "@/src/lib/metadata";
import { SectionHeader } from "./SectionHeader";

interface Service {
  icon: Icon;
  titleKey: string;
  textKey: string;
  links: { route: RouteKey; labelKey: string }[];
}

const SERVICES: Service[] = [
  {
    icon: IconHome2,
    titleKey: "homeService1Title",
    textKey: "homeService1Text",
    links: [
      { route: "buyerConsultation", labelKey: "homeService1LinkBuy" },
      { route: "sellerConsultation", labelKey: "homeService1LinkSell" },
    ],
  },
  {
    icon: IconChartLine,
    titleKey: "homeService2Title",
    textKey: "homeService2Text",
    links: [{ route: "services", labelKey: "homeService2Link" }],
  },
  {
    icon: IconSpeakerphone,
    titleKey: "homeService3Title",
    textKey: "homeService3Text",
    links: [{ route: "sellerConsultation", labelKey: "homeService3Link" }],
  },
];

export function HomeServices({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const linkClass = buttonClasses({ variant: "link", className: "justify-start text-left" });

  return (
    <Section tone="white">
      <Container>
        <SectionHeader eyebrow={dict.homeServicesEyebrow} title={dict.homeServicesTitle} intro={dict.homeServicesIntro} />

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
          {SERVICES.map(({ icon: ServiceIcon, titleKey, textKey, links }) => (
            <Card key={titleKey} className="flex flex-col">
              <span className="flex size-12 items-center justify-center rounded-full bg-brand-pale text-brand-blue">
                <ServiceIcon size={24} stroke={1.5} aria-hidden="true" />
              </span>
              <CardTitle className="mt-5 text-xl md:text-2xl">{dict[titleKey]}</CardTitle>
              <p className="mt-3 text-brand-carbon/80">{dict[textKey]}</p>
              <ul className="mt-auto flex flex-col gap-2 pt-6">
                {links.map((link) => (
                  <li key={link.labelKey}>
                    <Link href={localizedPath(locale, link.route)} className={linkClass}>
                      {dict[link.labelKey]}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <Link href={localizedPath(locale, "services")} className={buttonClasses({ variant: "secondary" })}>
            {dict.homeServicesAllLink}
          </Link>
        </div>
      </Container>
    </Section>
  );
}

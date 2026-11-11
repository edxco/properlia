import Link from "next/link";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { Container, Section, SectionTitle, buttonClasses } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";
import { getGeneralInfo, whatsappUrl } from "@/src/lib/generalInfo";
import { dictionaryFor } from "@/src/lib/metadata";

export async function HomeCta({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const whatsapp = whatsappUrl((await getGeneralInfo())?.whatsapp);

  return (
    <Section tone="base" spacing="md">
      <Container>
        <div className="grid gap-10 rounded-card bg-brand-navy p-8 shadow-card md:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:p-16">
          <div className="lg:max-w-xl">
            <SectionTitle className="text-white">{dict.homeCtaTitle}</SectionTitle>
            <p className="mt-4 max-w-xl text-base text-white/90 md:text-lg">{dict.homeCtaText}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0 lg:flex-col">
            <Link href={localizedPath(locale, "contact")} className={buttonClasses({ variant: "inverse", size: "lg" })}>
              {dict.homeCtaPrimary}
            </Link>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "outlineInverse", size: "lg" })}
              >
                <IconBrandWhatsapp size={20} stroke={1.5} aria-hidden="true" />
                {dict.homeCtaWhatsapp}
              </a>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

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
    <Section tone="navy">
      <Container>
        <div className="max-w-3xl">
          <SectionTitle className="text-white">{dict.homeCtaTitle}</SectionTitle>
          <p className="mt-4 text-base text-white/90 md:text-lg">{dict.homeCtaText}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

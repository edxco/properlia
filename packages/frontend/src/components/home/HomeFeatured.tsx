import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Container, Section, buttonClasses } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";
import { PropertyCard } from "@/components/ui";
import { dictionaryFor } from "@/src/lib/metadata";
import { toPropertyCardProps } from "@/src/lib/propertyCardProps";
import { getPublicProperties } from "@/src/lib/propertyQueries";
import { SectionHeader } from "./SectionHeader";

export async function HomeFeatured({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const result = await getPublicProperties({ items: 6, featured: true });
  const properties = result?.data ?? [];

  return (
    <Section id="propiedades" tone="base">
      <Container>
        <SectionHeader eyebrow={dict.homeFeaturedEyebrow} title={dict.homeFeaturedTitle} intro={dict.homeFeaturedIntro} />

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...toPropertyCardProps(property, locale)} />
            ))}
          </div>
        ) : (
          !result && <p className="text-brand-carbon/70">{dict.errorLoading}</p>
        )}

        <div className="mt-10">
          <Link href={localizedPath(locale, "properties")} className={buttonClasses({ variant: "secondary", size: "lg" })}>
            {dict.homeFeaturedCta}
            <IconArrowRight size={20} stroke={1.5} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}

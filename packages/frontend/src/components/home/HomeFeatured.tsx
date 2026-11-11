import { Container, Section } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";
import { PropertyCard } from "@/components/ui";
import { dictionaryFor } from "@/src/lib/metadata";
import { toPropertyCardProps } from "@/src/lib/propertyCardProps";
import { getPublicProperties } from "@/src/lib/propertyQueries";
import { SectionHeader } from "./SectionHeader";
import { TextLink } from "./TextLink";

export async function HomeFeatured({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const result = await getPublicProperties({ items: 6, featured: true });
  const properties = result?.data ?? [];

  return (
    <Section id="propiedades" tone="base">
      <Container>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader eyebrow={dict.homeFeaturedEyebrow} title={dict.homeFeaturedTitle} intro={dict.homeFeaturedIntro} />
          <TextLink href={localizedPath(locale, "properties")} className="shrink-0 md:pb-2">
            {dict.homeFeaturedCta}
          </TextLink>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...toPropertyCardProps(property, locale)} />
            ))}
          </div>
        ) : (
          !result && <p className="text-brand-carbon/70">{dict.errorLoading}</p>
        )}
      </Container>
    </Section>
  );
}

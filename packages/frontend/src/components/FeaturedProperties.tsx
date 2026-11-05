import Link from "next/link";
import { enMessages, esMessages } from "@properlia/shared";
import { SectionTitle, buttonClasses } from "@properlia/shared/components/ui";
import { PropertyCard } from "@/components/ui";
import { toPropertyCardProps } from "@/src/lib/propertyCardProps";
import { getPublicProperties } from "@/src/lib/propertyQueries";

export async function FeaturedProperties({ locale }: { locale: string }) {
  const dict: Record<string, string> = locale === "en" ? enMessages : esMessages;
  const result = await getPublicProperties({ items: 3, featured: true });
  const properties = result?.data ?? [];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionTitle className="mx-auto mb-12 max-w-4xl text-center text-3xl md:text-4xl">
          {dict.properliaBriefTitle}
        </SectionTitle>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <PropertyCard
                key={property.id}
                {...toPropertyCardProps(property, locale)}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          !result && <p className="text-center text-brand-carbon/70">{dict.errorLoading}</p>
        )}

        <div className="mt-10 text-center">
          <Link href={`/${locale}/properties`} className={buttonClasses({ variant: "secondary" })}>
            {dict.viewAllProperties}
          </Link>
        </div>
      </div>
    </section>
  );
}

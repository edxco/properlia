import type { Property } from "@properlia/shared/types";
import { SectionTitle } from "@properlia/shared/components/ui";
import { enMessages, esMessages } from "@properlia/shared";
import { PropertyCard } from "@/components/ui";
import { toPropertyCardProps } from "@/src/lib/propertyCardProps";

const MAX_ITEMS = 6;

function rankSimilar(property: Property, pool: Property[]): Property[] {
  const cityId = property.city?.id ?? property.city_id;
  const stateId = property.state?.id ?? property.state_id;
  const categoryIds = new Set(property.property_categories?.map((c) => c.id));

  const score = (candidate: Property) =>
    (cityId && (candidate.city?.id ?? candidate.city_id) === cityId ? 4 : 0) +
    (stateId && (candidate.state?.id ?? candidate.state_id) === stateId ? 2 : 0) +
    (candidate.property_categories?.some((c) => categoryIds.has(c.id)) ? 1 : 0);

  return pool
    .filter((candidate) => candidate.id !== property.id)
    .map((candidate, index) => ({ candidate, index, score: score(candidate) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_ITEMS)
    .map(({ candidate }) => candidate);
}

export function SimilarProperties({
  property,
  pool,
  locale,
}: {
  property: Property;
  pool: Property[];
  locale: string;
}) {
  const similar = rankSimilar(property, pool);
  if (similar.length === 0) return null;

  const dict: Record<string, string> = locale === "en" ? enMessages : esMessages;

  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
      <SectionTitle className="mb-6 text-2xl md:text-3xl">{dict.similarPropertiesTitle}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {similar.map((item) => (
          <PropertyCard key={item.id} {...toPropertyCardProps(item, locale)} compact />
        ))}
      </div>
    </section>
  );
}

"use client";
import { ResidentialCard } from "@/components/ui";
import { useLocale, useT } from "./TranslationProvider";
import { useProperties } from "../services/properties/queries";
import { useStatuses } from "../services/status/queries";

export function FeaturedProperties() {
  const locale = useLocale();
  const t = useT();
  const { data: propertiesData, isLoading, isError } = useProperties({ items: 3 });
  const { data: statusesData } = useStatuses();
  console.log('propertiesData', propertiesData);
  if (isLoading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-8">
              {t("properliaBriefTitle")}
            </h2>
            <div className="text-stone-600">Loading properties...</div>
          </div>
        </div>
      </section>
    );
  }

  if (isError || !propertiesData?.data) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-8">
              {t("properliaBriefTitle")}
            </h2>
            <div className="text-stone-600">Unable to load properties at this time.</div>
          </div>
        </div>
      </section>
    );
  }

  const properties = propertiesData.data.map((property) => ({
    id: property.id,
    title: property.title,
    property_type: (locale === 'es' ? property?.property_type?.es_name : property?.property_type?.name) ?? 'Unknown',
    status: (locale === 'es' ? property?.status?.es_name : property?.status?.name) ?? 'Unknown',
    images: property.images.map((img) => img.url),
    landArea: property.land_area ?? 0,
    builtArea: property.built_area ?? 0,
    price: property.price,
    rooms: property.rooms,
    bathrooms: property.bathrooms,
    slug: property.id,
  }));

  console.log('properties', properties);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-8">
            {t("properliaBriefTitle")}
          </h2>

          <div className="space-y-6 text-stone-700 font-light text-lg leading-relaxed">
            {properties.map((property) => (
              <ResidentialCard key={property.id} {...property} />
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-stone-900 text-white px-8 py-3.5 hover:bg-stone-800 transition-colors text-sm tracking-wider">
              Learn More About Us
            </button>
            <button className="border border-stone-900 text-stone-900 px-8 py-3.5 hover:bg-stone-50 transition-colors text-sm tracking-wider">
              Schedule a Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

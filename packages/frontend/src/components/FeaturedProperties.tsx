"use client";
import { PropertyCard } from "@/components/ui";
import { useProperties } from "../services/properties/queries";
import { useStatuses } from "../services/status/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { getAbsoluteImageUrl } from "@properlia/shared";

export function FeaturedProperties() {
  const t = useT();
  const {
    data: propertiesData,
    isLoading,
    isError,
  } = useProperties({ items: 3, featured: true });
  const { data: statusesData } = useStatuses();
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
            <div className="text-stone-600">
              Unable to load properties at this time.
            </div>
          </div>
        </div>
      </section>
    );
  }

  const properties = propertiesData.data.map((property) => ({
    id: property.id,
    title: property.title,
    property_type: property?.property_type ?? {
      id: "",
      name: "Unknown",
      es_name: "Desconocido",
    },
    status: property?.status ?? {
      id: "",
      name: "Unknown",
      es_name: "Desconocido",
    },
    listing_types: property?.listing_type ?? {
      id: "",
      name: "Unknown",
      es_name: "Desconocido",
    },
    images: property.images.map((img) => getAbsoluteImageUrl(img.url)),
    landArea: property.land_area ?? 0,
    builtArea: property.built_area ?? 0,
    price: property.price,
    rooms: property.rooms,
    bathrooms: property.bathrooms,
    half_bathrooms: property.half_bathrooms,
    property_features: property.property_features,
    property_categories: property.property_categories,
    neighborhood: property.neighborhood,
    city: property.city,
    state: property.state,
  }));

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto lg:px-8">
        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-stone-700 font-light text-lg leading-relaxed">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

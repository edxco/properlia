"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyFiltersBar } from "@/components/filters/PropertyFiltersBar";
import { NoResultsAlert } from "@/components/alerts/NoResultsAlert";
import { useProperties } from "@/src/services/properties/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { Property } from "@properlia/shared/types";
import { PropertyCard } from "@/components/ui";

interface Filters {
  rooms?: number;
  bathrooms?: number;
  city?: string;
  state?: string;
  priceMin?: number;
  priceMax?: number;
  landAreaMin?: number;
  landAreaMax?: number;
  searchQuery?: string;
  listingType?: string;
}

export default function PropertiesClient() {
  const t = useT();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});

  // Initialize filters from URL params
  useEffect(() => {
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    if (search || type) {
      setFilters((prev) => ({
        ...prev,
        searchQuery: search || undefined,
        listingType: type || undefined,
      }));
    }
  }, [searchParams]);

  // Build API query params from filters
  const apiParams = useMemo(() => {
    const params: Record<string, any> = { items: 100 };

    if (filters.searchQuery) params.search = filters.searchQuery;
    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.priceMin) params.price_min = filters.priceMin;
    if (filters.priceMax) params.price_max = filters.priceMax;
    if (filters.rooms) params.rooms_min = filters.rooms;
    if (filters.bathrooms) params.bathrooms_min = filters.bathrooms;

    return params;
  }, [filters]);

  const {
    data: propertiesData,
    isLoading,
    isError,
  } = useProperties(apiParams);

  const { cities, states } = useMemo(() => {
    if (!propertiesData?.data) return { cities: [], states: [] };

    const citiesSet = new Set<string>();
    const statesSet = new Set<string>();

    propertiesData.data.forEach((prop: Property) => {
      if (prop.city) citiesSet.add(prop.city);
      if (prop.state) statesSet.add(prop.state);
    });

    return {
      cities: Array.from(citiesSet).sort(),
      states: Array.from(statesSet).sort(),
    };
  }, [propertiesData]);

  // Client-side filtering for fields not yet supported by backend
  const filteredProperties = useMemo(() => {
    if (!propertiesData?.data) return [];

    return propertiesData.data.filter((property: Property) => {
      // Listing type filter (client-side until backend supports name-based filtering)
      if (filters.listingType) {
        const listingTypeName = property.listing_type?.name?.toLowerCase();
        if (filters.listingType === "rent" && listingTypeName !== "rent")
          return false;
        if (filters.listingType === "buy" && listingTypeName !== "sale")
          return false;
      }

      // Land area filters (not yet in backend)
      if (
        filters.landAreaMin &&
        (property.land_area || 0) < filters.landAreaMin
      )
        return false;
      if (
        filters.landAreaMax &&
        (property.land_area || 0) > filters.landAreaMax
      )
        return false;

      return true;
    });
  }, [propertiesData, filters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => setFilters({});

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined
  ).length;
  const advancedFilterCount = [
    filters.city,
    filters.state,
    filters.landAreaMin,
    filters.landAreaMax,
  ].filter((v) => v !== undefined).length;

  const hasNoResults = filteredProperties.length === 0 && activeFilterCount > 0;
  const propertiesToDisplay = hasNoResults
    ? propertiesData?.data || []
    : filteredProperties;

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <PropertyFiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          advancedFilterCount={advancedFilterCount}
          currentCount={filteredProperties.length}
          totalCount={propertiesData?.data.length || 0}
          cities={cities}
          states={states}
        />

        {hasNoResults && (
          <NoResultsAlert
            filters={filters}
            onClearFilters={clearFilters}
            autoDismissSeconds={10}
          />
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-stone-600">
              {t("loading") || "Loading properties"}...
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="text-red-600">
              {t("errorLoading") || "Error loading properties"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesToDisplay.map((property: Property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                property_type={
                  property?.property_type ?? {
                    id: "",
                    name: "Unknown",
                    es_name: "Desconocido",
                  }
                }
                status={
                  property?.status ?? {
                    id: "",
                    name: "Unknown",
                    es_name: "Desconocido",
                  }
                }
                listing_types={
                  property?.listing_type ?? {
                    id: "",
                    name: "Unknown",
                    es_name: "Desconocido",
                  }
                }
                images={property.images.map((img) => img.url)}
                landArea={property.land_area ?? 0}
                builtArea={property.built_area ?? 0}
                price={property.price}
                rooms={property.rooms}
                bathrooms={property.bathrooms}
                slug={property.id}
                compact={true}
                half_bathrooms={property.half_bathrooms}
                property_features={property.property_features}
                property_categories={property.property_categories}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

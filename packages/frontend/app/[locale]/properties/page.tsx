"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCardCompact } from "@/components/ui/propertyCardCompact";
import { PropertyFiltersBar } from "@/components/filters/PropertyFiltersBar";
import { NoResultsAlert } from "@/components/alerts/NoResultsAlert";
import { useProperties } from "@/src/services/properties/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { Property } from "@properlia/shared/types";

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

export default function PropertiesPage() {
  const t = useT();
  const searchParams = useSearchParams();
  const { data: propertiesData, isLoading, isError } = useProperties({ items: 100 });

  const [filters, setFilters] = useState<Filters>({});

  // Apply URL search parameters on mount
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

  // Get unique cities and states for filter dropdowns
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

  // Filter properties based on selected filters
  const filteredProperties = useMemo(() => {
    if (!propertiesData?.data) return [];

    return propertiesData.data.filter((property: Property) => {
      // Search query filter (searches in title, city, state)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();

        // Check if query matches "City, State" format
        const cityStateParts = query.split(',').map(p => p.trim());
        const isCityStateFormat = cityStateParts.length === 2;

        if (isCityStateFormat) {
          // Exact match for "City, State" format
          const [searchCity, searchState] = cityStateParts;
          const matchesCity = property.city?.toLowerCase() === searchCity;
          const matchesState = property.state?.toLowerCase() === searchState;

          if (!(matchesCity && matchesState)) return false;
        } else {
          // Flexible search across title, city, state
          const matchesTitle = property.title?.toLowerCase().includes(query);
          const matchesCity = property.city?.toLowerCase().includes(query);
          const matchesState = property.state?.toLowerCase().includes(query);

          if (!matchesTitle && !matchesCity && !matchesState) return false;
        }
      }

      // Listing type filter (rent/buy)
      if (filters.listingType) {
        const listingTypeName = property.listing_type?.name?.toLowerCase();
        if (filters.listingType === "rent" && listingTypeName !== "rent") return false;
        if (filters.listingType === "buy" && listingTypeName !== "sale") return false;
      }

      // Rooms filter
      if (filters.rooms && property.rooms < filters.rooms) return false;

      // Bathrooms filter
      if (filters.bathrooms && property.bathrooms < filters.bathrooms) return false;

      // City filter
      if (filters.city && property.city !== filters.city) return false;

      // State filter
      if (filters.state && property.state !== filters.state) return false;

      // Price range filter
      if (filters.priceMin && property.price < filters.priceMin) return false;
      if (filters.priceMax && property.price > filters.priceMax) return false;

      // Land area range filter
      if (filters.landAreaMin && (property.land_area || 0) < filters.landAreaMin) return false;
      if (filters.landAreaMax && (property.land_area || 0) > filters.landAreaMax) return false;

      return true;
    });
  }, [propertiesData, filters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length;
  const advancedFilterCount = [filters.city, filters.state, filters.landAreaMin, filters.landAreaMax].filter(v => v !== undefined).length;

  const hasNoResults = filteredProperties.length === 0 && activeFilterCount > 0;
  const propertiesToDisplay = hasNoResults ? (propertiesData?.data || []) : filteredProperties;

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Primary Filters Bar */}
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

          {/* No Results Alert */}
          {hasNoResults && (
            <NoResultsAlert
              filters={filters}
              onClearFilters={clearFilters}
              autoDismissSeconds={10}
            />
          )}

          {/* Properties Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-stone-600">{t("loading") || "Loading properties"}...</div>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <div className="text-red-600">{t("errorLoading") || "Error loading properties"}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesToDisplay.map((property: Property) => (
                <PropertyCardCompact
                  key={property.id}
                  id={property.id}
                  title={property.title}
                  property_type={property?.property_type ?? { id: '', name: 'Unknown', es_name: 'Desconocido' }}
                  status={property?.status ?? { id: '', name: 'Unknown', es_name: 'Desconocido' }}
                  listing_types={property?.listing_type ?? { id: '', name: 'Unknown', es_name: 'Desconocido' }}
                  images={property.images.map((img) => img.url)}
                  landArea={property.land_area ?? 0}
                  builtArea={property.built_area ?? 0}
                  price={property.price}
                  rooms={property.rooms}
                  bathrooms={property.bathrooms}
                  slug={property.id}
                />
              ))}
            </div>
          )}
      </div>
    </section>
  );
}

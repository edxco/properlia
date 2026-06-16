"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyFiltersBar } from "@/components/filters/PropertyFiltersBar";
import { NoResultsAlert } from "@/components/alerts/NoResultsAlert";
import { useProperties } from "@/src/services/properties/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { Property } from "@properlia/shared/types";
import { getAbsoluteImageUrl } from "@properlia/shared";
import { PropertyCard, Banner } from "@/components/ui";

const ITEMS_PER_PAGE = 9;

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
  category?: string;
}

export default function PropertiesClient() {
  const t = useT();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize filters from URL params
  useEffect(() => {
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    if (search || type || category) {
      setFilters((prev) => ({
        ...prev,
        searchQuery: search || undefined,
        listingType: type || undefined,
        category: category || undefined,
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

    if (filters.category) {
      if (filters.category === "land") {
        params.property_type_name = "land";
      } else {
        params.category_slug = filters.category;
      }
    }

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
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

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
  const allProperties = hasNoResults
    ? propertiesData?.data || []
    : filteredProperties;

  const totalPages = Math.ceil(allProperties.length / ITEMS_PER_PAGE);
  const propertiesToDisplay = allProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <PropertyFiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          advancedFilterCount={advancedFilterCount}
          currentCount={propertiesToDisplay.length}
          totalCount={propertiesData?.data.length || 0}
          cities={cities}
          states={states}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <Banner
            title={t("bannerSearchTitle")}
            description={t("bannerSearchDescription")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            }
          />
          <Banner
            title={t("bannerGuidanceTitle")}
            description={t("bannerGuidanceDescription")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            }
          />
        </div>

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
          <>
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
                  images={property.images.map((img) => getAbsoluteImageUrl(img.url))}
                  landArea={property.land_area ?? 0}
                  builtArea={property.built_area ?? 0}
                  price={property.price}
                  rooms={property.rooms}
                  bathrooms={property.bathrooms}
                  compact={true}
                  half_bathrooms={property.half_bathrooms}
                  property_features={property.property_features}
                  property_categories={property.property_categories}
                  neighborhood={property.neighborhood}
                  city={property.city}
                  state={property.state}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("previous") || "Previous"}
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg border ${
                        currentPage === page
                          ? "bg-stone-800 text-white border-stone-800"
                          : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("next") || "Next"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

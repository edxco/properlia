"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";

interface PropertyFilters {
  rooms?: number;
  bathrooms?: number;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  state?: string;
  landAreaMin?: number;
  landAreaMax?: number;
}

interface PropertyFiltersBarProps {
  filters: PropertyFilters;
  onFilterChange: (key: keyof PropertyFilters, value: any) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  advancedFilterCount: number;
  currentCount: number;
  totalCount: number;
  cities: string[];
  states: string[];
}

export function PropertyFiltersBar({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
  advancedFilterCount,
  currentCount,
  totalCount,
  cities,
  states,
}: PropertyFiltersBarProps) {
  const t = useT();
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [priceMinDisplay, setPriceMinDisplay] = useState(
    filters.priceMin ? filters.priceMin.toLocaleString() : ""
  );
  const [priceMaxDisplay, setPriceMaxDisplay] = useState(
    filters.priceMax ? filters.priceMax.toLocaleString() : ""
  );

  useEffect(() => {
    if (!filters.priceMin) setPriceMinDisplay("");
  }, [filters.priceMin]);

  useEffect(() => {
    if (!filters.priceMax) setPriceMaxDisplay("");
  }, [filters.priceMax]);

  const handlePriceChange = (
    key: "priceMin" | "priceMax",
    raw: string,
    setDisplay: (v: string) => void
  ) => {
    const digits = raw.replace(/[^0-9]/g, "");
    const num = digits ? Number(digits) : undefined;
    setDisplay(num !== undefined ? num.toLocaleString() : "");
    onFilterChange(key, num);
  };

  // Build location text
  const locationText = () => {
    const parts: string[] = [];
    if (filters.city) parts.push(filters.city);
    if (filters.state) parts.push(filters.state);
    return parts.length > 0 ? ` ${t("in") || "in"} ${parts.join(", ")}` : "";
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        {/* Label Row */}
        <p className="text-sm text-gray-600">
          {t("showing") || "Showing"}{" "}
          <span className="font-semibold text-gray-900">{currentCount}</span>{" "}
          {t("of") || "of"}{" "}
          <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
          {t("properties")?.toLowerCase() || "properties"}
          {locationText()}
        </p>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Price Range */}
          <div className="flex gap-1 items-center">
          <input
            type="text"
            inputMode="numeric"
            value={priceMinDisplay}
            onChange={(e) => handlePriceChange("priceMin", e.target.value, setPriceMinDisplay)}
            placeholder={t("minPrice") || "Min $"}
            className="w-28 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="text"
            inputMode="numeric"
            value={priceMaxDisplay}
            onChange={(e) => handlePriceChange("priceMax", e.target.value, setPriceMaxDisplay)}
            placeholder={t("maxPrice") || "Max $"}
            className="w-28 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
          />
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Rooms Filter */}
          <select
          value={filters.rooms || ""}
          onChange={(e) =>
            onFilterChange(
              "rooms",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className={`px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 ${
            !filters.rooms ? "text-gray-500" : "text-gray-900"
          }`}
        >
          <option value="" className="text-gray-500">
            {capitalizeFirstWord(t("rooms") || "Rooms")}
          </option>
          <option value="1" className="text-gray-900">1+</option>
          <option value="2" className="text-gray-900">2+</option>
          <option value="3" className="text-gray-900">3+</option>
          <option value="4" className="text-gray-900">4+</option>
          <option value="5" className="text-gray-900">5+</option>
          </select>

          {/* Bathrooms Filter */}
          <select
          value={filters.bathrooms || ""}
          onChange={(e) =>
            onFilterChange(
              "bathrooms",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className={`px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 ${
            !filters.bathrooms ? "text-gray-500" : "text-gray-900"
          }`}
        >
          <option value="" className="text-gray-500">
            {capitalizeFirstWord(t("baths") || "Baths")}
          </option>
          <option value="1" className="text-gray-900">1+</option>
          <option value="2" className="text-gray-900">2+</option>
          <option value="3" className="text-gray-900">3+</option>
          <option value="4" className="text-gray-900">4+</option>
          </select>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* More Filters Button */}
          <button
            onClick={() => setShowMoreFilters(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs relative text-gray-700 hover:text-gray-900"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{capitalizeFirstWord(t("moreFilters") || "More")}</span>
            {advancedFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-stone-900 text-white text-xs rounded-full min-w-[18px] text-center">
                {advancedFilterCount}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 underline"
            >
              {t("clear") || "Clear"}
            </button>
          )}
        </div>
      </div>

      {/* More Filters Overlay Modal */}
      {showMoreFilters && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMoreFilters(false)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("moreFilters") || "More Filters"}
              </h2>
              <button
                onClick={() => setShowMoreFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Location Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {t("location") || "Location"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* City Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("city") || "City"}
                    </label>
                    <select
                      value={filters.city || ""}
                      onChange={(e) => onFilterChange("city", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="">{t("all") || "All"}</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("state") || "State"}
                    </label>
                    <select
                      value={filters.state || ""}
                      onChange={(e) => onFilterChange("state", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="">{t("all") || "All"}</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Land Area Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {t("landArea") || "Land Area"} (m²)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Land Area Min Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("minimum") || "Minimum"}
                    </label>
                    <input
                      type="number"
                      value={filters.landAreaMin || ""}
                      onChange={(e) =>
                        onFilterChange(
                          "landAreaMin",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="0 m²"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  {/* Land Area Max Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("maximum") || "Maximum"}
                    </label>
                    <input
                      type="number"
                      value={filters.landAreaMax || ""}
                      onChange={(e) =>
                        onFilterChange(
                          "landAreaMax",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="∞ m²"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  onFilterChange("city", undefined);
                  onFilterChange("state", undefined);
                  onFilterChange("landAreaMin", undefined);
                  onFilterChange("landAreaMax", undefined);
                }}
                className="px-4 py-2 text-sm text-stone-700 hover:text-stone-900 font-medium"
              >
                {t("clearFilters") || "Clear filters"}
              </button>
              <button
                onClick={() => setShowMoreFilters(false)}
                className="px-6 py-2 bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors font-medium"
              >
                {t("showResults") || "Show Results"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

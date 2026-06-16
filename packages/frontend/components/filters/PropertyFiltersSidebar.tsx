"use client";

import { useEffect, useState } from "react";
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

interface PropertyFiltersSidebarProps {
  filters: PropertyFilters;
  onFilterChange: (key: keyof PropertyFilters, value: any) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  currentCount: number;
  totalCount: number;
  cities: string[];
  states: string[];
}

export function PropertyFiltersSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
  currentCount,
  totalCount,
  cities,
  states,
}: PropertyFiltersSidebarProps) {
  const t = useT();
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

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {t("filters") || "Filters"}
          </h2>
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-xs text-stone-600 hover:text-stone-900 underline"
            >
              {t("clear") || "Clear all"}
            </button>
          )}
        </div>

        {/* Count */}
        <p className="text-xs text-gray-500">
          {t("showing") || "Showing"}{" "}
          <span className="font-semibold text-gray-800">{currentCount}</span>{" "}
          {t("of") || "of"}{" "}
          <span className="font-semibold text-gray-800">{totalCount}</span>{" "}
          {t("properties")?.toLowerCase() || "properties"}
        </p>

        <hr className="border-gray-100" />

        {/* Price */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {t("priceRange") || "Price Range"}
          </h3>
          <div className="space-y-2">
            <input
              type="text"
              inputMode="numeric"
              value={priceMinDisplay}
              onChange={(e) =>
                handlePriceChange("priceMin", e.target.value, setPriceMinDisplay)
              }
              placeholder={t("minPrice") || "Min $"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
            />
            <input
              type="text"
              inputMode="numeric"
              value={priceMaxDisplay}
              onChange={(e) =>
                handlePriceChange("priceMax", e.target.value, setPriceMaxDisplay)
              }
              placeholder={t("maxPrice") || "Max $"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Rooms & Baths */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {t("roomsAndBaths") || "Rooms & Baths"}
          </h3>
          <div className="space-y-2">
            <select
              value={filters.rooms || ""}
              onChange={(e) =>
                onFilterChange("rooms", e.target.value ? Number(e.target.value) : undefined)
              }
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 ${
                !filters.rooms ? "text-gray-500" : "text-gray-900"
              }`}
            >
              <option value="" className="text-gray-500">
                {capitalizeFirstWord(t("rooms") || "Rooms")}
              </option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>

            <select
              value={filters.bathrooms || ""}
              onChange={(e) =>
                onFilterChange("bathrooms", e.target.value ? Number(e.target.value) : undefined)
              }
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 ${
                !filters.bathrooms ? "text-gray-500" : "text-gray-900"
              }`}
            >
              <option value="" className="text-gray-500">
                {capitalizeFirstWord(t("baths") || "Baths")}
              </option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Location */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {t("location") || "Location"}
          </h3>
          <div className="space-y-2">
            <select
              value={filters.city || ""}
              onChange={(e) => onFilterChange("city", e.target.value || undefined)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 ${
                !filters.city ? "text-gray-500" : "text-gray-900"
              }`}
            >
              <option value="" className="text-gray-500">
                {t("city") || "City"}
              </option>
              {cities.map((city) => (
                <option key={city} value={city} className="text-gray-900">
                  {city}
                </option>
              ))}
            </select>

            <select
              value={filters.state || ""}
              onChange={(e) => onFilterChange("state", e.target.value || undefined)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 ${
                !filters.state ? "text-gray-500" : "text-gray-900"
              }`}
            >
              <option value="" className="text-gray-500">
                {t("state") || "State"}
              </option>
              {states.map((state) => (
                <option key={state} value={state} className="text-gray-900">
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Land Area */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {t("landArea") || "Land Area"} (m²)
          </h3>
          <div className="space-y-2">
            <input
              type="number"
              value={filters.landAreaMin || ""}
              onChange={(e) =>
                onFilterChange("landAreaMin", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder={t("minimum") || "Min m²"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
            />
            <input
              type="number"
              value={filters.landAreaMax || ""}
              onChange={(e) =>
                onFilterChange("landAreaMax", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder={t("maximum") || "Max m²"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

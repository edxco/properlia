"use client";

import { useEffect, useState } from "react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";
import { cn } from "@properlia/shared/lib/utils";
import { Button, Card, Input, Select } from "@properlia/shared/components/ui";

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
    <div>
      <Card padding="sm" className="space-y-6 shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-brand-navy">
            {t("filters") || "Filters"}
          </h2>
          {activeFilterCount > 0 && (
            <Button variant="link" onClick={onClearFilters} className="text-xs">
              {t("clear") || "Clear all"}
            </Button>
          )}
        </div>

        {/* Count */}
        <p className="text-xs text-brand-gray">
          {t("showing") || "Showing"}{" "}
          <span className="font-medium text-brand-carbon">{currentCount}</span>{" "}
          {t("of") || "of"}{" "}
          <span className="font-medium text-brand-carbon">{totalCount}</span>{" "}
          {t("properties")?.toLowerCase() || "properties"}
        </p>

        <hr className="border-brand-border" />

        {/* Price */}
        <div>
          <h3 className="text-xs font-medium text-brand-carbon uppercase tracking-wide mb-3">
            {t("priceRange") || "Price Range"}
          </h3>
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              value={priceMinDisplay}
              onChange={(e) =>
                handlePriceChange("priceMin", e.target.value, setPriceMinDisplay)
              }
              placeholder={t("minPrice") || "Min $"}
              className="h-10"
            />
            <Input
              type="text"
              inputMode="numeric"
              value={priceMaxDisplay}
              onChange={(e) =>
                handlePriceChange("priceMax", e.target.value, setPriceMaxDisplay)
              }
              placeholder={t("maxPrice") || "Max $"}
              className="h-10"
            />
          </div>
        </div>

        <hr className="border-brand-border" />

        {/* Rooms & Baths */}
        <div>
          <h3 className="text-xs font-medium text-brand-carbon uppercase tracking-wide mb-3">
            {t("roomsAndBaths") || "Rooms & Baths"}
          </h3>
          <div className="space-y-2">
            <Select
              value={filters.rooms || ""}
              onChange={(e) =>
                onFilterChange("rooms", e.target.value ? Number(e.target.value) : undefined)
              }
              className={cn("h-10", !filters.rooms ? "text-brand-gray" : "text-brand-carbon")}
            >
              <option value="" className="text-brand-gray">
                {capitalizeFirstWord(t("rooms") || "Rooms")}
              </option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </Select>

            <Select
              value={filters.bathrooms || ""}
              onChange={(e) =>
                onFilterChange("bathrooms", e.target.value ? Number(e.target.value) : undefined)
              }
              className={cn("h-10", !filters.bathrooms ? "text-brand-gray" : "text-brand-carbon")}
            >
              <option value="" className="text-brand-gray">
                {capitalizeFirstWord(t("baths") || "Baths")}
              </option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </Select>
          </div>
        </div>

        <hr className="border-brand-border" />

        {/* Location */}
        <div>
          <h3 className="text-xs font-medium text-brand-carbon uppercase tracking-wide mb-3">
            {t("location") || "Location"}
          </h3>
          <div className="space-y-2">
            <Select
              value={filters.city || ""}
              onChange={(e) => onFilterChange("city", e.target.value || undefined)}
              className={cn("h-10", !filters.city ? "text-brand-gray" : "text-brand-carbon")}
            >
              <option value="" className="text-brand-gray">
                {t("city") || "City"}
              </option>
              {cities.map((city) => (
                <option key={city} value={city} className="text-brand-carbon">
                  {city}
                </option>
              ))}
            </Select>

            <Select
              value={filters.state || ""}
              onChange={(e) => onFilterChange("state", e.target.value || undefined)}
              className={cn("h-10", !filters.state ? "text-brand-gray" : "text-brand-carbon")}
            >
              <option value="" className="text-brand-gray">
                {t("state") || "State"}
              </option>
              {states.map((state) => (
                <option key={state} value={state} className="text-brand-carbon">
                  {state}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <hr className="border-brand-border" />

        {/* Land Area */}
        <div>
          <h3 className="text-xs font-medium text-brand-carbon uppercase tracking-wide mb-3">
            {t("landArea") || "Land Area"} (m²)
          </h3>
          <div className="space-y-2">
            <Input
              type="number"
              value={filters.landAreaMin || ""}
              onChange={(e) =>
                onFilterChange("landAreaMin", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder={t("minimum") || "Min m²"}
              className="h-10"
            />
            <Input
              type="number"
              value={filters.landAreaMax || ""}
              onChange={(e) =>
                onFilterChange("landAreaMax", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder={t("maximum") || "Max m²"}
              className="h-10"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

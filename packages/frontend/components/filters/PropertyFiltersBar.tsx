"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLocale, useT } from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";
import type { City, State } from "@properlia/shared/types";
import { cn } from "@properlia/shared/lib/utils";
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  cardClasses,
} from "@properlia/shared/components/ui";

interface PropertyFilters {
  rooms?: number;
  bathrooms?: number;
  priceMin?: number;
  priceMax?: number;
  city_id?: string;
  state_id?: string;
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
  cities: City[];
  states: State[];
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
  const locale = useLocale();
  const locationLabel = (entity: State | City) =>
    (locale === "es" && entity.es_name) || entity.name;
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
    const selectedCity = cities.find((c) => c.id === filters.city_id);
    const selectedState = states.find((s) => s.id === filters.state_id);
    if (selectedCity) parts.push(locationLabel(selectedCity));
    if (selectedState) parts.push(locationLabel(selectedState));
    return parts.length > 0 ? ` ${t("in") || "in"} ${parts.join(", ")}` : "";
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        {/* Label Row */}
        <p className="text-sm text-brand-carbon/70">
          {t("showing") || "Showing"}{" "}
          <span className="font-medium text-brand-carbon">{currentCount}</span>{" "}
          {t("of") || "of"}{" "}
          <span className="font-medium text-brand-carbon">{totalCount}</span>{" "}
          {t("properties")?.toLowerCase() || "properties"}
          {locationText()}
        </p>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Price Range */}
          <div className="flex gap-1 items-center">
          <Input
            controlSize="sm"
            type="text"
            inputMode="numeric"
            value={priceMinDisplay}
            onChange={(e) => handlePriceChange("priceMin", e.target.value, setPriceMinDisplay)}
            placeholder={t("minPrice") || "Min $"}
            className="w-28 tabular-nums"
          />
          <span className="text-brand-gray text-xs">-</span>
          <Input
            controlSize="sm"
            type="text"
            inputMode="numeric"
            value={priceMaxDisplay}
            onChange={(e) => handlePriceChange("priceMax", e.target.value, setPriceMaxDisplay)}
            placeholder={t("maxPrice") || "Max $"}
            className="w-28 tabular-nums"
          />
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-input"></div>

          {/* Rooms Filter */}
          <Select
          controlSize="sm"
          value={filters.rooms || ""}
          onChange={(e) =>
            onFilterChange(
              "rooms",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className={cn("w-auto", !filters.rooms ? "text-brand-gray" : "text-brand-carbon")}
        >
          <option value="" className="text-brand-gray">
            {capitalizeFirstWord(t("rooms") || "Rooms")}
          </option>
          <option value="1" className="text-brand-carbon">1+</option>
          <option value="2" className="text-brand-carbon">2+</option>
          <option value="3" className="text-brand-carbon">3+</option>
          <option value="4" className="text-brand-carbon">4+</option>
          <option value="5" className="text-brand-carbon">5+</option>
          </Select>

          {/* Bathrooms Filter */}
          <Select
          controlSize="sm"
          value={filters.bathrooms || ""}
          onChange={(e) =>
            onFilterChange(
              "bathrooms",
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className={cn("w-auto", !filters.bathrooms ? "text-brand-gray" : "text-brand-carbon")}
        >
          <option value="" className="text-brand-gray">
            {capitalizeFirstWord(t("baths") || "Baths")}
          </option>
          <option value="1" className="text-brand-carbon">1+</option>
          <option value="2" className="text-brand-carbon">2+</option>
          <option value="3" className="text-brand-carbon">3+</option>
          <option value="4" className="text-brand-carbon">4+</option>
          </Select>

          {/* Separator */}
          <div className="h-6 w-px bg-input"></div>

          {/* More Filters Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMoreFilters(true)}
            className="relative gap-1.5 px-3 text-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{capitalizeFirstWord(t("moreFilters") || "More")}</span>
            {advancedFilterCount > 0 && (
              <Badge tone="navy" className="ml-1 min-w-[18px] justify-center px-1.5 tabular-nums">
                {advancedFilterCount}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="px-3 text-xs"
            >
              {t("clear") || "Clear"}
            </Button>
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
          <div
            className={cardClasses({
              padding: "none",
              className:
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 shadow-overlay z-50 w-full max-w-2xl max-h-[80vh] overflow-y-auto",
            })}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-medium text-brand-navy">
                {t("moreFilters") || "More Filters"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMoreFilters(false)}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Location Section */}
              <div>
                <h3 className="text-sm font-medium text-brand-carbon mb-3">
                  {t("location") || "Location"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* State Filter */}
                  <div>
                    <Label className="mb-2">
                      {t("state") || "State"}
                    </Label>
                    <Select
                      value={filters.state_id || ""}
                      onChange={(e) => onFilterChange("state_id", e.target.value)}
                    >
                      <option value="">{t("all") || "All"}</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {locationLabel(state)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* City Filter */}
                  <div>
                    <Label className="mb-2">
                      {t("city") || "City"}
                    </Label>
                    <Select
                      value={filters.city_id || ""}
                      onChange={(e) => onFilterChange("city_id", e.target.value)}
                      disabled={!filters.state_id}
                    >
                      <option value="">{t("all") || "All"}</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {locationLabel(city)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Land Area Section */}
              <div>
                <h3 className="text-sm font-medium text-brand-carbon mb-3">
                  {t("landArea") || "Land Area"} (m²)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Land Area Min Filter */}
                  <div>
                    <Label className="mb-2">
                      {t("minimum") || "Minimum"}
                    </Label>
                    <Input
                      type="number"
                      value={filters.landAreaMin || ""}
                      onChange={(e) =>
                        onFilterChange(
                          "landAreaMin",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="0 m²"
                    />
                  </div>

                  {/* Land Area Max Filter */}
                  <div>
                    <Label className="mb-2">
                      {t("maximum") || "Maximum"}
                    </Label>
                    <Input
                      type="number"
                      value={filters.landAreaMax || ""}
                      onChange={(e) =>
                        onFilterChange(
                          "landAreaMax",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="∞ m²"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-brand-border">
              <Button
                variant="ghost"
                onClick={() => {
                  onFilterChange("city_id", undefined);
                  onFilterChange("state_id", undefined);
                  onFilterChange("landAreaMin", undefined);
                  onFilterChange("landAreaMax", undefined);
                }}
              >
                {t("clearFilters") || "Clear filters"}
              </Button>
              <Button onClick={() => setShowMoreFilters(false)}>
                {t("showResults") || "Show Results"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useT } from "@properlia/shared/components/TranslationProvider";

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

interface NoResultsAlertProps {
  filters: Filters;
  onClearFilters: () => void;
  autoDismissSeconds?: number;
}

export function NoResultsAlert({
  filters,
  onClearFilters,
  autoDismissSeconds = 10,
}: NoResultsAlertProps) {
  const t = useT();
  const [showAlert, setShowAlert] = useState(true);

  // Auto-dismiss alert after specified seconds
  useEffect(() => {
    if (autoDismissSeconds > 0) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, autoDismissSeconds * 10000);

      return () => clearTimeout(timer);
    }
  }, [autoDismissSeconds]);

  if (!showAlert) return null;

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="mb-2">
            {t("noPropertiesFoundLooking") || "No properties found"}
          </span>

          {filters.listingType && (
            <span className="font-semibold">{" "}{filters.listingType === "rent" ? t("rent") : t("buy")}</span>
          )}
          {filters.searchQuery && <>{" "}{t('in')}{" "}<span className="font-semibold">{filters.searchQuery}</span></>}
          <div className="text-red-700 text-sm space-y-1">
            {(filters.rooms ||
              filters.bathrooms ||
              filters.priceMin ||
              filters.priceMax ||
              filters.city ||
              filters.state ||
              filters.landAreaMin ||
              filters.landAreaMax) && (
              <p className="font-medium">
                {t("activeFilters") || "Active filters"}:
              </p>
            )}
            {filters.rooms && (
              <p className="ml-4">
                • {t("rooms") || "Rooms"}: {filters.rooms}+
              </p>
            )}
            {filters.bathrooms && (
              <p className="ml-4">
                • {t("bathrooms") || "Bathrooms"}: {filters.bathrooms}+
              </p>
            )}
            {filters.city && (
              <p className="ml-4">
                • {t("city") || "City"}: {filters.city}
              </p>
            )}
            {filters.state && (
              <p className="ml-4">
                • {t("state") || "State"}: {filters.state}
              </p>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <p className="ml-4">
                • {t("priceRange") || "Price"}:
                {filters.priceMin && ` ${filters.priceMin.toLocaleString()}+`}
                {filters.priceMax && ` - ${filters.priceMax.toLocaleString()}`}
              </p>
            )}
            {(filters.landAreaMin || filters.landAreaMax) && (
              <p className="ml-4">
                • {t("landArea") || "Land Area"}:
                {filters.landAreaMin &&
                  ` ${filters.landAreaMin.toLocaleString()}+`}
                {filters.landAreaMax &&
                  ` - ${filters.landAreaMax.toLocaleString()}`}{" "}
                m²
              </p>
            )}
          </div>
          <p className="text-red-700 text-sm mt-3">
            {t("showingAllProperties") ||
              "Showing all available properties below"}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            {t("clearFilters") || "Clear filters"}
          </button>
          <button
            onClick={() => setShowAlert(false)}
            className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
          >
            {t("dismiss") || "Dismiss"}
          </button>
        </div>
      </div>
    </div>
  );
}

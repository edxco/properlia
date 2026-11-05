"use client";

import { useEffect, useState } from "react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { Alert, Button } from "@properlia/shared/components/ui";

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
      }, autoDismissSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoDismissSeconds]);

  if (!showAlert) return null;

  return (
    <Alert tone="danger" role="status" className="mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="mb-2">
            {t("noPropertiesFoundLooking") || "No properties found"}
          </span>

          {filters.listingType && (
            <span className="font-medium">{" "}{filters.listingType === "rent" ? t("rent") : t("buy")}</span>
          )}
          {filters.searchQuery && <>{" "}{t('in')}{" "}<span className="font-medium">{filters.searchQuery}</span></>}
          <div className="text-danger text-sm space-y-1">
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
          <p className="text-danger text-sm mt-3">
            {t("showingAllProperties") ||
              "Showing all available properties below"}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button variant="destructive" size="sm" onClick={onClearFilters} className="px-3">
            {t("clearFilters") || "Clear filters"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAlert(false)}
            className="px-3 text-danger hover:bg-danger/10"
          >
            {t("dismiss") || "Dismiss"}
          </Button>
        </div>
      </div>
    </Alert>
  );
}

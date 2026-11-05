"use client";

import { useT } from "@properlia/shared/components/TranslationProvider";
import { PropertyCategory } from "@properlia/shared/types";
import { Home, LandPlot, Bed, ShowerHead, Toilet, Car } from "lucide-react";

interface PropertyStatsGridProps {
  property_category: PropertyCategory[];
  property_type: string;
  rooms: number;
  bathrooms: number;
  half_bathrooms: number;
}

/**
 * Compact grid with icons only (no labels)
 * Displays property statistics in a 4-column grid
 */
export function PropertyLabelStats({
  property_category,
  property_type,
  rooms,
  bathrooms,
  half_bathrooms,
}: PropertyStatsGridProps) {
  const t = useT();
  const RESIDENTIAL_ID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  const LAND_TYPE_ID = "23d3905f-a5c1-4372-995e-362b2c10f77f";

  const isLand = property_type === LAND_TYPE_ID;

  const isResidential =
    property_category.some((cat) => cat.id === RESIDENTIAL_ID) && !isLand;

  return (
    <>
      {isResidential && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-brand-carbon/70">
            <Bed className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium tabular-nums text-brand-carbon">{rooms}</span>
              <span className="text-xs ml-1">{t("rooms")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-brand-carbon/70">
            <ShowerHead className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium tabular-nums text-brand-carbon">{bathrooms}</span>
              <span className="text-xs ml-1">{t("baths")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-brand-carbon/70">
            <Toilet className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium tabular-nums text-brand-carbon">
                {half_bathrooms}
              </span>
              <span className="text-xs ml-1">{t("guestBaths")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-brand-carbon/70">
            <Car className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium tabular-nums text-brand-carbon">{rooms}</span>
              <span className="text-xs ml-1">{t("car")}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

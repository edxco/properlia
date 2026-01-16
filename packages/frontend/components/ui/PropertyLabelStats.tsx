"use client";

import { useT } from "@properlia/shared/components/TranslationProvider";
import { Home, LandPlot, Bed, ShowerHead, Toilet, Car } from "lucide-react";

interface PropertyStatsGridProps {
  landArea: number;
  builtArea: number;
  rooms: number;
  bathrooms: number;
  half_bathrooms: number;
}

/**
 * Compact grid with icons only (no labels)
 * Displays property statistics in a 4-column grid
 */
export function PropertyLabelStats({
  landArea,
  builtArea,
  rooms,
  bathrooms,
  half_bathrooms,
}: PropertyStatsGridProps) {
  const t = useT();
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Home className="w-4 h-4 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              {landArea.toLocaleString()}
            </span>
            <span className="text-xs ml-1">m² {t("land")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <LandPlot className="w-4 h-4 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              {builtArea.toLocaleString()}
            </span>
            <span className="text-xs ml-1">m² {t("built")}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Bed className="w-4 h-4 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">{rooms}</span>
            <span className="text-xs ml-1">{t("rooms")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <ShowerHead className="w-4 h-4 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">{bathrooms}</span>
            <span className="text-xs ml-1">{t("guestBaths")}</span>
          </div>
        </div>
         <div className="flex items-center gap-2 text-gray-600">
          <Toilet className="w-4 h-4 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">{half_bathrooms}</span>
            <span className="text-xs ml-1">{t("guestBaths")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Car className="w-4 h-4 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">{rooms}</span>
            <span className="text-xs ml-1">{t("car")}</span>
          </div>
        </div>
      </div>
    </>
  );
}

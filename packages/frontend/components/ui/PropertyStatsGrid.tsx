"use client";

import { Bed, ShowerHead, Toilet } from "lucide-react";

interface PropertyStatsGridProps {
  rooms: number;
  bathrooms: number;
  half_bathrooms: number;
  property_type: string;
}

/**
 * Compact grid with icons only (no labels)
 * Displays property statistics in a 4-column grid
 */
export function PropertyStatsGrid({
  rooms,
  bathrooms,
  half_bathrooms,
  property_type,
}: PropertyStatsGridProps) {
  const isResidential = [
    "0221da24-d7df-4052-a63d-2d16501ec360",
    "6431658b-1ebc-4805-ac61-97bf39699353",
  ].includes(property_type);

  return (
    <div className="grid grid-cols-7 gap-2 mb-4">
      {isResidential ? (
        <>
          {/* Rooms */}
          <div className="flex items-center justify-center gap-1.5 bg-brand-bg rounded-lg py-2">
            <Bed className="w-4 h-4" />
            <span className="text-sm font-medium tabular-nums text-brand-carbon">{rooms}</span>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center justify-center gap-1.5 bg-brand-bg rounded-lg py-2">
            <ShowerHead className="w-4 h-4" />
            <span className="text-sm font-medium tabular-nums text-brand-carbon">
              {bathrooms}
            </span>
          </div>

          {/* Toilets */}
          <div className="flex items-center justify-center gap-1.5 bg-brand-bg rounded-lg py-2">
            <Toilet className="w-4 h-4" />
            <span className="text-sm font-medium tabular-nums text-brand-carbon">
              {half_bathrooms}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

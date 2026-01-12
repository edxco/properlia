"use client";

import { useMemo, useState } from "react";
import type { Property, Status } from "@properlia/shared/types";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import {
  capitalizeFirstWord,
  formatLargeNumber,
  getBadge,
} from "@properlia/shared";
import PropertyActionsDropdown from "./PropertyActionsDropdown";

interface PropertiesTableProps {
  properties: Property[];
  isLoading: boolean;
  metadata?: {
    count: number;
    page: number;
    pages: number;
  };
  statuses?: Status[];
  filters: { status_id?: string };
  onFilterChange: (filters: { status_id?: string }) => void;
  onEditProperty: (property: Property) => void;
}

export default function PropertiesTable({
  properties,
  isLoading,
  metadata,
  statuses,
  filters,
  onFilterChange,
  onEditProperty,
}: PropertiesTableProps) {
  const t = useT();
  const locale = useLocale();
  const [showFactSheetModal, setShowFactSheetModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const totalPrice = useMemo(() => {
    return properties.reduce((sum, property) => {
      const price = Number(property.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [properties]);

  return (
    <div className="space-y-4">
      {/* Status Filter Submenu */}
      <div className="pb-3">
        <div className="flex items-center justify-end gap-2 overflow-x-auto">
          <button
            onClick={() => onFilterChange({ status_id: undefined })}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              !filters.status_id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstWord(t("all"))}
          </button>
          {statuses?.map((status) => (
            <button
              key={status.id}
              onClick={() => onFilterChange({ status_id: status.id })}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.status_id === status.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {capitalizeFirstWord(
                locale === "es" ? status.es_name : status.name
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {metadata?.count ?? 0} {t("properties")}
            </p>
            <p className="text-xs text-gray-500">
              Total: ${formatLargeNumber(totalPrice)} ($
              {totalPrice.toLocaleString()})
            </p>
          </div>
          {metadata && (
            <div className="text-right text-xs text-gray-500">
              Page {metadata.page} of {metadata.pages}
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center px-6 py-12 text-gray-500">
              Loading properties...
            </div>
          ) : properties.length ? (
            <div className="divide-y divide-gray-200">
              {properties.map((property) => (
                <div key={property.id} className="relative group pb-2">
                  <a
                    href={`/dashboard/properties/${property.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-4 pr-16 hover:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-2">
                      {/* Row 1: Title and Price */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 flex gap-1 items-center">
                          <h3
                            className={`font-semibold text-base ${
                              property.status_id ===
                              "7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64"
                                ? "text-gray-500"
                                : "text-primary"
                            }`}
                          >
                            {property.title}
                          </h3>
                          {property.status &&
                            property.status_id &&
                            getBadge(property.status, locale)}
                          {property.featured && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${Number(property.price || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Location Details and Status */}
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3 text-gray-600 flex-wrap">
                          {property.neighborhood && (
                            <span className="font-medium">
                              {property.neighborhood}
                            </span>
                          )}
                          <span>•</span>
                          <span>{property.city || "—"}</span>
                          <span>•</span>
                          <span>{property.state || "—"}</span>
                          {property.zip_code && (
                            <>
                              <span>•</span>
                              <span>{property.zip_code}</span>
                            </>
                          )}
                        </div>
                        <div>
                          {property.property_type &&
                            property.property_type_id &&
                            getBadge(property.property_type, locale)}
                          {property.listing_type &&
                            property.listing_type_id &&
                            getBadge(property.listing_type, locale)}
                        </div>
                      </div>
                    </div>
                  </a>

                  <PropertyActionsDropdown
                    property={property}
                    onEdit={onEditProperty}
                    onFactSheetClick={(propertyId) => {
                      setSelectedPropertyId(propertyId);
                      setShowFactSheetModal(true);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="font-medium text-gray-700">
                No properties found
              </p>
              <p className="text-sm text-gray-500">
                Use the form on the left to create your first listing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fact Sheet Modal */}
      {showFactSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("factSheetOptions")}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700 mb-6">
                {t("displayProperliaInfo")}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowFactSheetModal(false);
                    setSelectedPropertyId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => {
                    if (selectedPropertyId) {
                      window.open(
                        `/dashboard/properties/${selectedPropertyId}/fact-sheet?properlia=false`,
                        "_blank"
                      );
                    }
                    setShowFactSheetModal(false);
                    setSelectedPropertyId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {t("no")}
                </button>
                <button
                  onClick={() => {
                    if (selectedPropertyId) {
                      window.open(
                        `/dashboard/properties/${selectedPropertyId}/fact-sheet?properlia=true`,
                        "_blank"
                      );
                    }
                    setShowFactSheetModal(false);
                    setSelectedPropertyId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  {t("yes")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

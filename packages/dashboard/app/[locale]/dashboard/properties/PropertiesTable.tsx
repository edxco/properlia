"use client";

import { useMemo, useState } from "react";
import type { Property, PropertyType, Status } from "@properlia/shared/types";
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
import FactSheetModal from "./FactSheetModal";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface PropertiesTableProps {
  properties: Property[];
  isLoading: boolean;
  metadata?: {
    count: number;
    page: number;
    pages: number;
  };
  statuses?: Status[];
  propertyTypes?: PropertyType[];
  filters: { status_id?: string; property_type_id?: string };
  onFilterChange: (filters: { status_id?: string; property_type_id?: string }) => void;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export default function PropertiesTable({
  properties,
  isLoading,
  metadata,
  statuses,
  propertyTypes,
  filters,
  onFilterChange,
  onPageChange,
  pageSize,
  onPageSizeChange,
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
      {/* Filter Bar */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Filters
          </span>
          {(filters.status_id || filters.property_type_id) && (
            <button
              onClick={() => onFilterChange({})}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-y-3 gap-x-6">
          {/* Status group */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
              Status
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => onFilterChange({ ...filters, status_id: undefined })}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                  !filters.status_id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {capitalizeFirstWord(t("all"))}
              </button>
              {statuses?.map((status) => (
                <button
                  key={status.id}
                  onClick={() => onFilterChange({ ...filters, status_id: status.id })}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    filters.status_id === status.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {capitalizeFirstWord(locale === "es" ? status.es_name : status.name)}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

          {/* Property type group */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
              Type
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => onFilterChange({ ...filters, property_type_id: undefined })}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                  !filters.property_type_id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {capitalizeFirstWord(t("all"))}
              </button>
              {propertyTypes?.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onFilterChange({ ...filters, property_type_id: type.id })}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    filters.property_type_id === type.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {capitalizeFirstWord(locale === "es" ? type.es_name : type.name)}
                </button>
              ))}
            </div>
          </div>
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

        <div>
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
                    className="block px-3 py-3 pr-14 sm:pl-6 sm:py-4 sm:pr-16 hover:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-2">
                      {/* Row 1: Title and Price */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex-1 flex gap-1 items-center">
                          <h3
                            className={`font-semibold text-base line-clamp-2 sm:line-clamp-none ${
                              property.status_id ===
                              "7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64"
                                ? "text-gray-500"
                                : "text-primary"
                            }`}
                          >
                            {property.title}
                          </h3>
                          <span className="hidden sm:contents">
                            {property.status &&
                              property.status_id &&
                              getBadge(property.status, locale)}
                          </span>
                          {property.featured && (
                            <Star className="ml-2 w-5 h-5 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                        <div className="sm:text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${Number(property.price || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Location Details and Type Badges */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 text-sm">
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

                      {/* Row 3: Mobile only — status badge left, dots button aligns right */}
                      {property.status && property.status_id && (
                        <div className="flex sm:hidden items-center">
                          {getBadge(property.status, locale)}
                        </div>
                      )}
                    </div>
                  </a>

                  <PropertyActionsDropdown
                    property={property}
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
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{t("propertiesPerPage")}:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {[5, 10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {metadata && metadata.pages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(metadata.page - 1)}
              disabled={metadata.page <= 1}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: metadata.pages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === metadata.pages ||
                  Math.abs(p - metadata.page) <= 2
              )
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => onPageChange(item as number)}
                    className={`min-w-[2rem] h-8 px-2 rounded-md text-sm font-medium transition-colors ${
                      metadata.page === item
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => onPageChange(metadata.page + 1)}
              disabled={metadata.page >= metadata.pages}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fact Sheet Modal */}
      <FactSheetModal
        isOpen={showFactSheetModal}
        propertyId={selectedPropertyId}
        onClose={() => {
          setShowFactSheetModal(false);
          setSelectedPropertyId(null);
        }}
      />
    </div>
  );
}

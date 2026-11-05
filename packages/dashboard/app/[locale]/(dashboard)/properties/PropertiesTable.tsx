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
import { Button, Card, Chip, Select } from "@properlia/shared/components/ui";
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
      <Card padding="none" className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-brand-gray">
            Filters
          </span>
          {(filters.status_id || filters.property_type_id) && (
            <Button
              variant="link"
              onClick={() => onFilterChange({})}
              className="h-auto text-xs text-brand-gray hover:text-brand-carbon hover:no-underline"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-y-3 gap-x-6">
          {/* Status group */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-brand-gray whitespace-nowrap">
              Status
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <Chip
                selected={!filters.status_id}
                onClick={() => onFilterChange({ ...filters, status_id: undefined })}
              >
                {capitalizeFirstWord(t("all"))}
              </Chip>
              {statuses?.map((status) => (
                <Chip
                  key={status.id}
                  selected={filters.status_id === status.id}
                  onClick={() => onFilterChange({ ...filters, status_id: status.id })}
                >
                  {capitalizeFirstWord(locale === "es" ? status.es_name : status.name)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="w-px bg-brand-border self-stretch hidden sm:block" />

          {/* Property type group */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-brand-gray whitespace-nowrap">
              Type
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <Chip
                selected={!filters.property_type_id}
                onClick={() => onFilterChange({ ...filters, property_type_id: undefined })}
              >
                {capitalizeFirstWord(t("all"))}
              </Chip>
              {propertyTypes?.map((type) => (
                <Chip
                  key={type.id}
                  selected={filters.property_type_id === type.id}
                  onClick={() => onFilterChange({ ...filters, property_type_id: type.id })}
                >
                  {capitalizeFirstWord(locale === "es" ? type.es_name : type.name)}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-visible">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <div>
            <p className="text-sm font-medium text-brand-carbon">
              {metadata?.count ?? 0} {t("properties")}
            </p>
            <p className="text-xs text-brand-gray">
              Total: ${formatLargeNumber(totalPrice)} ($
              {totalPrice.toLocaleString()})
            </p>
          </div>
          {metadata && (
            <div className="text-right text-xs text-brand-gray">
              Page {metadata.page} of {metadata.pages}
            </div>
          )}
        </div>

        <div>
          {isLoading ? (
            <div className="flex justify-center px-6 py-12 text-brand-gray">
              Loading properties...
            </div>
          ) : properties.length ? (
            <div className="divide-y divide-brand-border">
              {properties.map((property) => (
                <div key={property.id} className="relative group pb-2">
                  <a
                    href={`/properties/${property.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-3 pr-14 sm:pl-6 sm:py-4 sm:pr-16 hover:bg-brand-bg transition-colors"
                  >
                    <div className="space-y-2">
                      {/* Row 1: Title and Price */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex-1 flex gap-1 items-center">
                          <h3
                            className={`font-medium text-base line-clamp-2 sm:line-clamp-none ${
                              property.status_id ===
                              "7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64"
                                ? "text-brand-gray"
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
                            <Star className="ml-2 w-5 h-5 fill-brand-blue text-brand-blue" />
                          )}
                        </div>
                        <div className="sm:text-right">
                          <div className="text-lg font-medium text-brand-carbon">
                            ${Number(property.price || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Location Details and Type Badges */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 text-sm">
                        <div className="flex items-center gap-3 text-brand-carbon/70 flex-wrap">
                          {property.neighborhood && (
                            <span className="font-medium">
                              {property.neighborhood}
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {(locale === "es" ? property.city?.es_name : property.city?.name) || "—"}
                          </span>
                          <span>•</span>
                          <span>
                            {(locale === "es" ? property.state?.es_name : property.state?.name) || "—"}
                          </span>
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
            <div className="px-6 py-12 text-center text-brand-gray">
              <p className="font-medium text-brand-carbon">
                No properties found
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-brand-carbon/70">
          <span>{t("propertiesPerPage")}:</span>
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            controlSize="sm"
            className="w-auto tabular-nums"
          >
            {[5, 10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </Select>
        </div>

        {metadata && metadata.pages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(metadata.page - 1)}
              disabled={metadata.page <= 1}
              className="size-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

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
                  <span key={`ellipsis-${i}`} className="px-2 text-brand-gray">
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={metadata.page === item ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(item as number)}
                    className="h-8 min-w-8 px-2 tabular-nums"
                  >
                    {item}
                  </Button>
                )
              )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(metadata.page + 1)}
              disabled={metadata.page >= metadata.pages}
              className="size-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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

"use client";

import { useMemo, useState } from "react";
import type { Property } from "@properlia/shared/types";

import {
  useProperties,
} from "@/src/services/properties/queries";
import { useStatuses } from "@/src/services/statuses/queries";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import {
  capitalizeFirstWord,
} from "@properlia/shared";
import PropertyForm from "./PropertyForm";
import PropertiesTable from "./PropertiesTable";

export default function PropertiesPage() {
  const t = useT();
  const locale = useLocale();
  const [filters, setFilters] = useState<{ status_id?: string }>({});
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const { data, isLoading, error } = useProperties({
    status_id: filters.status_id || undefined,
  });
  const { data: statuses } = useStatuses();

  const properties = useMemo(() => data?.data ?? [], [data]);
  const metadata = data?.metadata;

  const handleCancelEdit = () => {
    setEditingProperty(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Error loading properties: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase">
            {t("propertiesControlPanel")}
          </h2>
          <p className="text-sm text-gray-500">
            Connected to the Rails API: list, create, and update properties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">{t("filterByStatus")}</label>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={filters.status_id ?? ""}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                status_id: event.target.value || undefined,
              }))
            }
          >
            <option value="">{capitalizeFirstWord(t("all"))}</option>
            {statuses?.map((status) => (
              <option key={status.id} value={status.id}>
                {capitalizeFirstWord(
                  locale === "es" ? status.es_name : status.name
                )}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PropertyForm
            editingProperty={editingProperty}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        <div className="lg:col-span-2">
          <PropertiesTable
            properties={properties}
            isLoading={isLoading}
            metadata={metadata}
            statuses={statuses}
            filters={filters}
            onFilterChange={setFilters}
            onEditProperty={setEditingProperty}
          />
        </div>
      </div>
    </div>
  );
}

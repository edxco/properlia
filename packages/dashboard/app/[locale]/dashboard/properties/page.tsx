"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useProperties } from "@/src/services/properties/queries";
import { useStatuses } from "@/src/services/statuses/queries";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";
import PropertiesTable from "./PropertiesTable";

export default function PropertiesPage() {
  const t = useT();
  const locale = useLocale();
  const [filters, setFilters] = useState<{ status_id?: string }>({});

  const { data, isLoading, error } = useProperties({
    status_id: filters.status_id || undefined,
  });
  const { data: statuses } = useStatuses();

  const properties = useMemo(() => data?.data ?? [], [data]);
  const metadata = data?.metadata;

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
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/properties/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            {t("addNewProperty")}
          </Link>
        </div>
      </div>

      <PropertiesTable
        properties={properties}
        isLoading={isLoading}
        metadata={metadata}
        statuses={statuses}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}

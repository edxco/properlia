"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useProperties } from "@/src/services/properties/queries";
import { useStatuses } from "@/src/services/statuses/queries";
import { usePropertyTypes } from "@/src/services/property-types/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import PropertiesTable from "./PropertiesTable";

type Filters = { status_id?: string; property_type_id?: string };

export default function PropertiesPage() {
  const t = useT();
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading, error } = useProperties({
    status_id: filters.status_id || undefined,
    property_type_id: filters.property_type_id || undefined,
    page,
    items: pageSize,
  });

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const { data: statuses } = useStatuses();
  const { data: propertyTypes } = usePropertyTypes();

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
        propertyTypes={propertyTypes}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

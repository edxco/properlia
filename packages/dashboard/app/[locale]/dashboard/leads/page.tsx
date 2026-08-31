"use client";

import { useMemo, useState } from "react";
import type { LeadStatus, InterestOperation } from "@properlia/shared/types";

import { useLeads } from "@/src/services/leads/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import LeadsTable from "./LeadsTable";

export default function LeadsPage() {
  const t = useT();
  const [filters, setFilters] = useState<{
    status?: LeadStatus;
    interest_operation?: InterestOperation;
  }>({});

  const { data, isLoading, error } = useLeads({
    status: filters.status,
    interest_operation: filters.interest_operation,
  });

  const leads = useMemo(() => data?.data ?? [], [data]);
  const metadata = data?.metadata;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          {t('errorLoadingLeads')}: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase">
            {t('leadsControlPanel')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('leadsDescription')}
          </p>
        </div>
      </div>

      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        metadata={metadata}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}

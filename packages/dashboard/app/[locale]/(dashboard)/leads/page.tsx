"use client";

import { useMemo, useState } from "react";
import type { LeadStatus, InterestOperation } from "@properlia/shared/types";

import { useLeads } from "@/src/services/leads/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import LeadsTable from "./LeadsTable";
import { Alert, DashboardTitle } from "@properlia/shared/components/ui";

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
      <Alert tone="danger">
        {t('errorLoadingLeads')}: {error.message}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardTitle>
            {t('leadsControlPanel')}
          </DashboardTitle>
          <p className="text-sm text-brand-gray">
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

"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LeadStatus, InterestOperation, LeadSortColumn } from "@properlia/shared/types";

import { useLeads } from "@/src/services/leads/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import LeadsTable from "./LeadsTable";
import { DEFAULT_LEAD_SORT, toggleLeadSort, type LeadSort } from "./leadsSort";
import { Alert, DashboardTitle } from "@properlia/shared/components/ui";

function LeadsPageContent() {
  const t = useT();
  const router = useRouter();
  const propertyId = useSearchParams().get("property_id") ?? undefined;
  const [filters, setFilters] = useState<{
    status?: LeadStatus;
    interest_operation?: InterestOperation;
  }>({});
  const [sort, setSort] = useState<LeadSort>(DEFAULT_LEAD_SORT);

  const { data, isLoading, error } = useLeads({
    status: filters.status,
    interest_operation: filters.interest_operation,
    property_id: propertyId,
    sort: sort.column,
    direction: sort.direction,
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
        sort={sort}
        onSortChange={(column: LeadSortColumn) => setSort((current) => toggleLeadSort(current, column))}
        propertyFilterActive={Boolean(propertyId)}
        onClearPropertyFilter={() => router.replace("/leads")}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsPageContent />
    </Suspense>
  );
}

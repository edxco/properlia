"use client";

import { useMemo, useState } from "react";
import type { UserRole } from "@properlia/shared/services/users/types";
import { useAdminUsers } from "@/src/services/users/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import UsersTable from "./UsersTable";

export default function UsersPage() {
  const t = useT();
  const [filters, setFilters] = useState<{
    role?: UserRole;
    enabled?: boolean;
    search?: string;
  }>({});

  const { data, isLoading, error } = useAdminUsers({
    role: filters.role,
    enabled: filters.enabled,
    search: filters.search,
  });

  const users = useMemo(() => data?.data ?? [], [data]);
  const metadata = data?.metadata;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          {t('errorLoadingUsers')}: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase">
            {t('usersManagement')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('usersDescription')}
          </p>
        </div>
      </div>

      <UsersTable
        users={users}
        isLoading={isLoading}
        metadata={metadata}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}

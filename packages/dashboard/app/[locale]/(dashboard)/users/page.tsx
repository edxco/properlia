"use client";

import { useMemo, useState } from "react";
import type { AdminUserFilters } from "@properlia/shared/services/users/types";
import { useAdminUsers } from "@/src/services/users/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";
import UsersTable from "./UsersTable";

export default function UsersPage() {
  const t = useT();
  const [filters, setFilters] = useState<AdminUserFilters>({});

  const sanitizeFilters = (
    next: Partial<AdminUserFilters>
  ): AdminUserFilters => ({
    role: next.role || undefined,
    search: next.search || undefined,
    enabled: typeof next.enabled === "boolean" ? next.enabled : undefined,
    page: typeof next.page === "number" ? next.page : undefined,
    items: typeof next.items === "number" ? next.items : undefined,
  });

  const handleFilterChange = (next: Partial<AdminUserFilters>) => {
    setFilters((prev) => sanitizeFilters({ ...prev, ...next }));
  };

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
          {t("errorLoadingUsers")}: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase">
            {t("usersManagement")}
          </h2>
          <p className="text-sm text-gray-500">{t("usersDescription")}</p>
        </div>
      </div>

      <UsersTable
        users={users}
        isLoading={isLoading}
        metadata={metadata}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}

import type { LeadSortColumn, SortDirection } from "@properlia/shared/types";

export interface LeadSort {
  column: LeadSortColumn;
  direction: SortDirection;
}

export const DEFAULT_LEAD_SORT: LeadSort = { column: "created_at", direction: "desc" };

const DESC_FIRST: LeadSortColumn[] = ["created_at", "contact_attempts"];

export function toggleLeadSort(current: LeadSort, column: LeadSortColumn): LeadSort {
  if (current.column === column) {
    return { column, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { column, direction: DESC_FIRST.includes(column) ? "desc" : "asc" };
}

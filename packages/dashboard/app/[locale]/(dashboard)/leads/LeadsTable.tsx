"use client";

import { useState, useRef, useEffect } from "react";
import type {
  Lead,
  LeadSortColumn,
  LeadStatus,
  InterestOperation,
} from "@properlia/shared/types";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";
import { Phone, Mail, ChevronDown, ChevronUp, ChevronsUpDown, Trash2, X } from "lucide-react";
import { useChangeLeadStatus, useDeleteLead } from "@/src/services/leads/queries";
import { useAuth } from "@/src/contexts/AuthContext";
import { Badge, Card, Chip, type BadgeTone } from "@properlia/shared/components/ui";
import type { LeadSort } from "./leadsSort";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  metadata?: {
    count: number;
    page: number;
    pages: number;
  };
  filters: { status?: LeadStatus; interest_operation?: InterestOperation };
  onFilterChange: (filters: {
    status?: LeadStatus;
    interest_operation?: InterestOperation;
  }) => void;
  sort: LeadSort;
  onSortChange: (column: LeadSortColumn) => void;
  propertyFilterActive?: boolean;
  onClearPropertyFilter?: () => void;
}

const STATUS_OPTIONS: LeadStatus[] = [
  "new_lead",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "unqualified",
];

const INTEREST_OPTIONS: InterestOperation[] = ["buy", "rent", "invest", "sell"];

const INTEREST_BADGE_TONES: Record<InterestOperation, BadgeTone> = {
  buy: "info",
  rent: "neutral",
  invest: "success",
  sell: "warning",
};

const STATUS_DROPDOWN_COLORS: Record<
  LeadStatus,
  { bg: string; hover: string; text: string }
> = {
  new_lead: { bg: "bg-brand-blue", hover: "hover:opacity-90", text: "text-white" },
  contacted: { bg: "bg-brand-navy", hover: "hover:opacity-90", text: "text-white" },
  qualified: { bg: "bg-success/80", hover: "hover:opacity-90", text: "text-white" },
  proposal: { bg: "bg-brand-carbon", hover: "hover:opacity-90", text: "text-white" },
  negotiation: { bg: "bg-warning", hover: "hover:opacity-90", text: "text-white" },
  won: { bg: "bg-success", hover: "hover:opacity-90", text: "text-white" },
  lost: { bg: "bg-danger", hover: "hover:opacity-90", text: "text-white" },
  unqualified: { bg: "bg-brand-gray", hover: "hover:opacity-90", text: "text-white" },
};

const formatStatusLabel = (status: LeadStatus): string => {
  return status.replace(/_/g, " ");
};

interface StatusDropdownProps {
  currentStatus: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
  isLoading?: boolean;
}

function StatusDropdown({
  currentStatus,
  onStatusChange,
  isLoading,
}: StatusDropdownProps) {
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = position !== null;

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setPosition(null);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  const colors = STATUS_DROPDOWN_COLORS[currentStatus];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) return setPosition(null);
          const rect = e.currentTarget.getBoundingClientRect();
          setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        }}
        disabled={isLoading}
        className={`inline-flex h-8 items-center gap-1 whitespace-nowrap px-3 text-xs font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
          colors.bg
        } ${colors.hover} ${colors.text} ${
          isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {capitalizeFirstWord(formatStatusLabel(currentStatus))}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {position && (
        <div
          style={{ top: position.top, right: position.right }}
          className="fixed z-50 w-40 bg-white rounded-card shadow-overlay border border-brand-border py-1 overflow-hidden"
        >
          {STATUS_OPTIONS.map((status) => {
            const statusColors = STATUS_DROPDOWN_COLORS[status];
            const isSelected = status === currentStatus;
            return (
              <button
                key={status}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (status !== currentStatus) onStatusChange(status);
                  setPosition(null);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${
                  isSelected ? "bg-brand-bg" : "hover:bg-brand-bg"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusColors.bg}`} />
                {capitalizeFirstWord(formatStatusLabel(status))}
                {isSelected && <span className="ml-auto text-brand-blue">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SortableHeaderProps {
  column: LeadSortColumn;
  label: string;
  sort: LeadSort;
  onSortChange: (column: LeadSortColumn) => void;
}

function SortableHeader({ column, label, sort, onSortChange }: SortableHeaderProps) {
  const active = sort.column === column;
  const Icon = !active ? ChevronsUpDown : sort.direction === "asc" ? ChevronUp : ChevronDown;

  return (
    <th
      scope="col"
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-brand-gray"
    >
      <button
        type="button"
        onClick={() => onSortChange(column)}
        className={`inline-flex items-center gap-1 rounded transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
          active ? "text-brand-navy" : ""
        }`}
      >
        {label}
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </th>
  );
}

export default function LeadsTable({
  leads,
  isLoading,
  metadata,
  filters,
  onFilterChange,
  sort,
  onSortChange,
  propertyFilterActive,
  onClearPropertyFilter,
}: LeadsTableProps) {
  const t = useT();
  const locale = useLocale();
  const changeStatusMutation = useChangeLeadStatus();
  const deleteLeadMutation = useDeleteLead();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleDelete = (lead: Lead) => {
    if (window.confirm(t("leadsDeleteConfirm").replace("{name}", lead.full_name))) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(
      locale === "es" ? "es-MX" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    );
  };

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return `From $${(min as number).toLocaleString()}`;
  };

  const details = (lead: Lead) =>
    [
      lead.interest_property_type,
      formatBudget(lead.min_budget, lead.max_budget),
      [
        lead.neighborhood,
        locale === "es" ? lead.city?.es_name : lead.city?.name,
        locale === "es" ? lead.state?.es_name : lead.state?.name,
      ]
        .filter(Boolean)
        .join(", "),
    ].filter(Boolean);

  const header = (column: LeadSortColumn, label: string) => (
    <SortableHeader column={column} label={label} sort={sort} onSortChange={onSortChange} />
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 pb-3">
        {propertyFilterActive && (
          <div className="flex items-center gap-2">
            <Chip selected onClick={onClearPropertyFilter}>
              {t("leadsFilteredByProperty")}
              <X className="h-3 w-3" strokeWidth={1.75} aria-label={t("leadsClearPropertyFilter")} />
            </Chip>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-brand-carbon/70">
            {t("status")}:
          </span>
          <Chip
            selected={!filters.status}
            onClick={() => onFilterChange({ ...filters, status: undefined })}
          >
            {capitalizeFirstWord(t("all"))}
          </Chip>
          {STATUS_OPTIONS.map((status) => (
            <Chip
              key={status}
              selected={filters.status === status}
              onClick={() => onFilterChange({ ...filters, status })}
            >
              {capitalizeFirstWord(formatStatusLabel(status))}
            </Chip>
          ))}
        </div>

        {/* Interest Operation Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-brand-carbon/70">
            {t("interest")}:
          </span>
          <Chip
            selected={!filters.interest_operation}
            onClick={() =>
              onFilterChange({ ...filters, interest_operation: undefined })
            }
          >
            {capitalizeFirstWord(t("all"))}
          </Chip>
          {INTEREST_OPTIONS.map((interest) => (
            <Chip
              key={interest}
              selected={filters.interest_operation === interest}
              onClick={() =>
                onFilterChange({ ...filters, interest_operation: interest })
              }
            >
              {capitalizeFirstWord(interest)}
            </Chip>
          ))}
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <p className="text-sm font-medium tabular-nums text-brand-carbon">
            {metadata?.count ?? 0} {t("leads")}
          </p>
          {metadata && (
            <div className="text-right text-xs tabular-nums text-brand-gray">
              {t("page")} {metadata.page} {t("of")} {metadata.pages}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center px-6 py-12 text-brand-gray">
            {t("loadingLeads")}...
          </div>
        ) : leads.length ? (
          <div className="max-h-[calc(100vh-350px)] overflow-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b border-brand-border bg-brand-bg">
                <tr>
                  {header("created_at", t("leadsDate"))}
                  {header("full_name", t("name"))}
                  {header("email", t("leadsContact"))}
                  {header("property", t("property"))}
                  {header("source", t("leadsSource"))}
                  {header("interest_operation", t("interest"))}
                  {header("status", t("status"))}
                  {isAdmin && (
                    <th scope="col" className="w-12 px-4 py-3">
                      <span className="sr-only">{t("leadsDelete")}</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {leads.map((lead) => {
                  const extra = details(lead);
                  return (
                    <tr key={lead.id} className="align-top transition-colors hover:bg-brand-bg">
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-brand-carbon/70">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-brand-blue">{lead.full_name}</div>
                        {extra.length > 0 && (
                          <div className="mt-0.5 text-xs text-brand-gray">{extra.join(" · ")}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-brand-carbon/70">
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 tabular-nums">
                            <Phone className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                            {lead.phone}
                            {lead.whatsapp_consent && (
                              <Badge tone="success" className="ml-1">
                                {t("leadsWhatsappConsent")}
                              </Badge>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.property ? (
                          <a
                            href={`/leads?property_id=${lead.property.id}`}
                            className="text-brand-blue hover:underline"
                          >
                            {lead.property.title}
                          </a>
                        ) : (
                          <span className="text-brand-gray">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.source ? (
                          <Badge tone="neutral">{lead.source.replace(/_/g, " ")}</Badge>
                        ) : (
                          <span className="text-brand-gray">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={INTEREST_BADGE_TONES[lead.interest_operation] ?? "neutral"}
                          className={
                            lead.interest_operation === "rent"
                              ? "bg-brand-navy/10 text-brand-navy"
                              : undefined
                          }
                        >
                          {capitalizeFirstWord(t(`${lead.interest_operation}`))}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusDropdown
                          currentStatus={lead.status}
                          onStatusChange={(status) =>
                            changeStatusMutation.mutate({ id: lead.id, status })
                          }
                          isLoading={changeStatusMutation.isPending}
                        />
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(lead)}
                            disabled={deleteLeadMutation.isPending}
                            title={t("leadsDelete")}
                            aria-label={t("leadsDelete")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-gray transition-colors hover:bg-brand-bg hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-brand-gray">
            <p className="font-medium text-brand-carbon">{t("noLeadsFound")}</p>
            <p className="text-sm text-brand-gray">{t("noLeadsDescription")}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

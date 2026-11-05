"use client";

import { useState, useRef, useEffect } from "react";
import type {
  Lead,
  LeadStatus,
  InterestOperation,
} from "@properlia/shared/types";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";
import { Phone, Mail, Calendar, MapPin, Home, ChevronDown } from "lucide-react";
import { useChangeLeadStatus } from "@/src/services/leads/queries";
import { Badge, Button, Card, Chip, type BadgeTone } from "@properlia/shared/components/ui";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colors = STATUS_DROPDOWN_COLORS[currentStatus];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isLoading}
        className={`inline-flex h-8 items-center gap-1 px-3 text-xs font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
          colors.bg
        } ${colors.hover} ${colors.text} ${
          isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {capitalizeFirstWord(formatStatusLabel(currentStatus))}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white rounded-card shadow-overlay border border-brand-border py-1 overflow-hidden">
          {STATUS_OPTIONS.map((status) => {
            const statusColors = STATUS_DROPDOWN_COLORS[status];
            const isSelected = status === currentStatus;
            return (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  if (status !== currentStatus) {
                    onStatusChange(status);
                  }
                  setIsOpen(false);
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

export default function LeadsTable({
  leads,
  isLoading,
  metadata,
  filters,
  onFilterChange,
}: LeadsTableProps) {
  const t = useT();
  const locale = useLocale();
  const changeStatusMutation = useChangeLeadStatus();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(
      locale === "es" ? "es-MX" : "en-US",
      {
        year: "numeric",
        month: "short",
        // day: "numeric",
      }
    );
  };

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "—";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return "—";
  };
  console.log("interest_property_type", leads);
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 pb-3">
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

      {/* Table */}
      <Card padding="none" className="overflow-visible">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <div>
            <p className="text-sm font-medium text-brand-carbon">
              {metadata?.count ?? 0} {t("leads")}
            </p>
          </div>
          {metadata && (
            <div className="text-right text-xs text-brand-gray">
              {t("page")} {metadata.page} {t("of")} {metadata.pages}
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center px-6 py-12 text-brand-gray">
              {t("loadingLeads")}...
            </div>
          ) : leads.length ? (
            <div className="divide-y divide-brand-border">
              {leads.map((lead) => (
                <div key={lead.id} className="relative group">
                  <div className="block px-6 py-4 hover:bg-brand-bg transition-colors">
                    <div className="space-y-3">
                      {/* Row 1: Name, Badges, Status Dropdown, and Date */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-base text-brand-blue">
                            {lead.full_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                            {lead.interest_property_type && (
                              <Badge tone="navy">
                                <Home className="h-3 w-3" />
                                {lead.interest_property_type}
                              </Badge>
                            )}
                            {lead.source && (
                              <Badge tone="neutral">
                                {lead.source.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusDropdown
                            currentStatus={lead.status}
                            onStatusChange={(status) =>
                              changeStatusMutation.mutate({
                                id: lead.id,
                                status,
                              })
                            }
                            isLoading={changeStatusMutation.isPending}
                          />
                          <div className="text-xs text-brand-gray">
                            {t("createdAt")} {formatDate(lead.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Contact Info */}
                      <div className="flex items-center gap-4 text-sm text-brand-carbon/70 flex-wrap">
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {lead.phone}
                          </span>
                        )}
                      </div>

                      {/* Row 3: Desired Location */}
                      {(lead.neighborhood || lead.city || lead.state) && (
                        <div className="flex items-center gap-2 text-sm text-brand-carbon/70">
                          <MapPin className="h-4 w-4 text-brand-gray" />
                          <span className="font-medium text-brand-gray">
                            {t("desiredLocation")}:
                          </span>
                          <span>
                            {[lead.neighborhood, lead.city, lead.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Row 4: Budget and Desired Date */}
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-4 text-brand-carbon/70">
                          <span className="font-medium">
                            {t("budget")}:{" "}
                            {formatBudget(lead.min_budget, lead.max_budget)}
                          </span>
                          {lead.desired_date && (
                            <span className="flex items-center gap-1 text-brand-carbon/70">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">
                                {t("desiredDateTo")}{" "}
                                {t(`${lead.interest_operation}`)}:
                              </span>{" "}
                              {formatDate(lead.desired_date)}
                            </span>
                          )}
                          {lead.property && (
                            <span className="text-brand-blue">
                              {t("property")}: {lead.property.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-brand-gray">
                          {lead.contact_attempts > 0 && (
                            <span className="text-xs">
                              {lead.contact_attempts} {t("contacts")}
                            </span>
                          )}
                          {lead.next_follow_up_at && (
                            <span className="flex items-center gap-1 text-xs text-warning">
                              <Calendar className="h-3 w-3" />
                              {formatDate(lead.next_follow_up_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notes preview */}
                      {lead.notes && (
                        <p className="text-sm text-brand-gray line-clamp-2">
                          {lead.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-brand-gray">
              <p className="font-medium text-brand-carbon">{t("noLeadsFound")}</p>
              <p className="text-sm text-brand-gray">{t("noLeadsDescription")}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

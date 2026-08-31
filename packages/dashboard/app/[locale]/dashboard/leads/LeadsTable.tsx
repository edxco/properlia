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

const getInterestBadgeColor = (interest: InterestOperation) => {
  const colors: Record<InterestOperation, string> = {
    buy: "bg-indigo-100 text-indigo-800",
    rent: "bg-teal-100 text-teal-800",
    invest: "bg-amber-100 text-amber-800",
    sell: "bg-rose-100 text-rose-800",
  };
  return colors[interest] || "bg-gray-100 text-gray-800";
};

const getPropertyTypeBadgeColor = (propertyType: string) => {
  const lowerType = propertyType.toLowerCase();
  if (lowerType.includes("casa") || lowerType.includes("house"))
    return "bg-cyan-100 text-cyan-800";
  if (lowerType.includes("departamento") || lowerType.includes("apartment"))
    return "bg-violet-100 text-violet-800";
  if (lowerType.includes("terreno") || lowerType.includes("land"))
    return "bg-lime-100 text-lime-800";
  if (lowerType.includes("oficina") || lowerType.includes("office"))
    return "bg-sky-100 text-sky-800";
  if (lowerType.includes("local") || lowerType.includes("commercial"))
    return "bg-fuchsia-100 text-fuchsia-800";
  return "bg-gray-100 text-gray-800";
};

const STATUS_DROPDOWN_COLORS: Record<
  LeadStatus,
  { bg: string; hover: string; text: string }
> = {
  new_lead: {
    bg: "bg-blue-500",
    hover: "hover:bg-blue-600",
    text: "text-white",
  },
  contacted: {
    bg: "bg-yellow-500",
    hover: "hover:bg-yellow-600",
    text: "text-white",
  },
  qualified: {
    bg: "bg-green-500",
    hover: "hover:bg-green-600",
    text: "text-white",
  },
  proposal: {
    bg: "bg-purple-500",
    hover: "hover:bg-purple-600",
    text: "text-white",
  },
  negotiation: {
    bg: "bg-orange-500",
    hover: "hover:bg-orange-600",
    text: "text-white",
  },
  won: {
    bg: "bg-emerald-600",
    hover: "hover:bg-emerald-700",
    text: "text-white",
  },
  lost: { bg: "bg-red-500", hover: "hover:bg-red-600", text: "text-white" },
  unqualified: {
    bg: "bg-gray-500",
    hover: "hover:bg-gray-600",
    text: "text-white",
  },
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
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isLoading}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
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
        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden">
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
                  isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusColors.bg}`} />
                {capitalizeFirstWord(formatStatusLabel(status))}
                {isSelected && <span className="ml-auto text-primary">✓</span>}
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
          <span className="text-sm font-medium text-gray-600">
            {t("status")}:
          </span>
          <button
            onClick={() => onFilterChange({ ...filters, status: undefined })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              !filters.status
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstWord(t("all"))}
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange({ ...filters, status })}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.status === status
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {capitalizeFirstWord(formatStatusLabel(status))}
            </button>
          ))}
        </div>

        {/* Interest Operation Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-600">
            {t("interest")}:
          </span>
          <button
            onClick={() =>
              onFilterChange({ ...filters, interest_operation: undefined })
            }
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              !filters.interest_operation
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstWord(t("all"))}
          </button>
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() =>
                onFilterChange({ ...filters, interest_operation: interest })
              }
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.interest_operation === interest
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {capitalizeFirstWord(interest)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {metadata?.count ?? 0} {t("leads")}
            </p>
          </div>
          {metadata && (
            <div className="text-right text-xs text-gray-500">
              {t("page")} {metadata.page} {t("of")} {metadata.pages}
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center px-6 py-12 text-gray-500">
              {t("loadingLeads")}...
            </div>
          ) : leads.length ? (
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <div key={lead.id} className="relative group">
                  <div className="block px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      {/* Row 1: Name, Badges, Status Dropdown, and Date */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base text-primary">
                            {lead.full_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getInterestBadgeColor(
                                lead.interest_operation
                              )}`}
                            >
                              {capitalizeFirstWord(t(`${lead.interest_operation}`))}
                            </span>
                            {lead.interest_property_type && (
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${getPropertyTypeBadgeColor(
                                  lead.interest_property_type
                                )}`}
                              >
                                <Home className="h-3 w-3" />
                                {lead.interest_property_type}
                              </span>
                            )}
                            {lead.source && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                {lead.source.replace(/_/g, " ")}
                              </span>
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
                          <div className="text-xs text-gray-500">
                            {t("createdAt")} {formatDate(lead.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Contact Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
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
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-500">
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
                        <div className="flex items-center gap-4 text-gray-600">
                          <span className="font-medium">
                            {t("budget")}:{" "}
                            {formatBudget(lead.min_budget, lead.max_budget)}
                          </span>
                          {lead.desired_date && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">
                                {t("desiredDateTo")}{" "}
                                {t(`${lead.interest_operation}`)}:
                              </span>{" "}
                              {formatDate(lead.desired_date)}
                            </span>
                          )}
                          {lead.property && (
                            <span className="text-primary">
                              {t("property")}: {lead.property.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          {lead.contact_attempts > 0 && (
                            <span className="text-xs">
                              {lead.contact_attempts} {t("contacts")}
                            </span>
                          )}
                          {lead.next_follow_up_at && (
                            <span className="flex items-center gap-1 text-xs text-orange-600">
                              <Calendar className="h-3 w-3" />
                              {formatDate(lead.next_follow_up_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notes preview */}
                      {lead.notes && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {lead.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="font-medium text-gray-700">{t("noLeadsFound")}</p>
              <p className="text-sm text-gray-500">{t("noLeadsDescription")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

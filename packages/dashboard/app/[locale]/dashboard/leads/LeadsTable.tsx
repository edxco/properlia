"use client";

import { useMemo } from "react";
import type { Lead, LeadStatus, InterestOperation } from "@properlia/shared/types";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";
import { Phone, Mail, Calendar, MapPin } from "lucide-react";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  metadata?: {
    count: number;
    page: number;
    pages: number;
  };
  filters: { status?: LeadStatus; interest_operation?: InterestOperation };
  onFilterChange: (filters: { status?: LeadStatus; interest_operation?: InterestOperation }) => void;
}

const STATUS_OPTIONS: LeadStatus[] = [
  'new_lead',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost',
  'unqualified',
];

const INTEREST_OPTIONS: InterestOperation[] = ['buy', 'rent', 'invest', 'sell'];

const getStatusBadgeColor = (status: LeadStatus) => {
  const colors: Record<LeadStatus, string> = {
    new_lead: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    proposal: 'bg-purple-100 text-purple-800',
    negotiation: 'bg-orange-100 text-orange-800',
    won: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-red-100 text-red-800',
    unqualified: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getInterestBadgeColor = (interest: InterestOperation) => {
  const colors: Record<InterestOperation, string> = {
    buy: 'bg-indigo-100 text-indigo-800',
    rent: 'bg-teal-100 text-teal-800',
    invest: 'bg-amber-100 text-amber-800',
    sell: 'bg-rose-100 text-rose-800',
  };
  return colors[interest] || 'bg-gray-100 text-gray-800';
};

const formatStatusLabel = (status: LeadStatus): string => {
  return status.replace(/_/g, ' ');
};

export default function LeadsTable({
  leads,
  isLoading,
  metadata,
  filters,
  onFilterChange,
}: LeadsTableProps) {
  const t = useT();
  const locale = useLocale();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return '—';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return '—';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 pb-3">
        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-600">{t('status')}:</span>
          <button
            onClick={() => onFilterChange({ ...filters, status: undefined })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              !filters.status
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstWord(t('all'))}
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
          <span className="text-sm font-medium text-gray-600">{t('interest')}:</span>
          <button
            onClick={() => onFilterChange({ ...filters, interest_operation: undefined })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              !filters.interest_operation
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstWord(t('all'))}
          </button>
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => onFilterChange({ ...filters, interest_operation: interest })}
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
              {metadata?.count ?? 0} {t('leads')}
            </p>
          </div>
          {metadata && (
            <div className="text-right text-xs text-gray-500">
              {t('page')} {metadata.page} {t('of')} {metadata.pages}
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center px-6 py-12 text-gray-500">
              {t('loadingLeads')}...
            </div>
          ) : leads.length ? (
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <div key={lead.id} className="relative group">
                  <div className="block px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      {/* Row 1: Name and Status Badges */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base text-primary">
                            {lead.full_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeColor(lead.status)}`}>
                              {capitalizeFirstWord(formatStatusLabel(lead.status))}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getInterestBadgeColor(lead.interest_operation)}`}>
                              {capitalizeFirstWord(lead.interest_operation)}
                            </span>
                            {lead.source && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                {lead.source.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {formatDate(lead.created_at)}
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
                        {(lead.city || lead.state || lead.neighborhood) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {[lead.neighborhood, lead.city, lead.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Row 3: Budget and Additional Info */}
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-4 text-gray-600">
                          <span className="font-medium">
                            {t('budget')}: {formatBudget(lead.min_budget, lead.max_budget)}
                          </span>
                          {lead.property && (
                            <span className="text-primary">
                              {t('property')}: {lead.property.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          {lead.contact_attempts > 0 && (
                            <span className="text-xs">
                              {lead.contact_attempts} {t('contacts')}
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
              <p className="font-medium text-gray-700">
                {t('noLeadsFound')}
              </p>
              <p className="text-sm text-gray-500">
                {t('noLeadsDescription')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

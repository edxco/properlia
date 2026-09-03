import type { CommonEntity, PaginatedResponse } from '../../types';

export type LeadStatus =
  | 'new_lead'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'unqualified';

export type InterestOperation = 'buy' | 'rent' | 'invest' | 'sell';

export type LeadSource = 'seller_form' | 'buyer_form' | 'manual' | 'website' | 'referral' | 'other';

export interface Lead {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  source: LeadSource;
  source_detail: Record<string, unknown>;
  status: LeadStatus;
  interest_operation: InterestOperation;
  interest_property_type?: string | null;
  min_budget?: number | null;
  max_budget?: number | null;
  score: number;
  notes?: string | null;
  assigned_to_user_id?: string | null;
  next_follow_up_at?: string | null;
  last_contacted_at?: string | null;
  contact_attempts: number;
  consent_marketing: boolean;
  property_id?: string | null;
  property?: {
    id: string;
    title: string;
  } | null;
  property_type?: CommonEntity | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  desired_date?: string | null;
  neighborhood?: string | null;
  city_id?: string | null;
  state_id?: string | null;
  city?: CommonEntity | null;
  state?: CommonEntity | null;
  created_at: string;
  updated_at: string;
}

export interface LeadEvent {
  id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_by_user_id?: string | null;
  created_at: string;
}

export interface LeadWithEvents extends Lead {
  events: LeadEvent[];
}

export interface LeadFilters {
  status?: LeadStatus;
  interest_operation?: InterestOperation;
  assigned_to_user_id?: string;
  property_id?: string;
  source?: LeadSource;
  pending_follow_up?: boolean;
  page?: number;
  items?: number;
}

export type LeadsResponse = PaginatedResponse<Lead>;

export interface CreatePublicLeadDto {
  full_name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  property_type_id?: string;
  interest_operation: InterestOperation;
  max_budget?: number;
  notes?: string;
  desired_date?: string;
  neighborhood?: string;
  city_id?: string;
  state_id?: string;
  consent_marketing?: boolean;
  source_detail?: Record<string, unknown>;
  interest_property_type?: string;
}

export interface CreateLeadResponse {
  message: string;
  id: string;
}

import { apiClient } from '../../lib/api-client';
import type {
  CreateLeadResponse,
  CreatePublicLeadDto,
  Lead,
  LeadFilters,
  LeadsResponse,
  LeadWithEvents,
} from './types';

export type { CreateLeadResponse, CreatePublicLeadDto } from './types';

export const leadsApi = {
  // Get all leads with filtering and pagination (requires auth)
  getAll: async (params?: LeadFilters): Promise<LeadsResponse> => {
    const query = new URLSearchParams();

    if (params?.page) query.set('page', String(params.page));
    if (params?.items) query.set('items', String(params.items));
    if (params?.status) query.set('status', params.status);
    if (params?.interest_operation) query.set('interest_operation', params.interest_operation);
    if (params?.assigned_to_user_id) query.set('assigned_to_user_id', params.assigned_to_user_id);
    if (params?.property_id) query.set('property_id', params.property_id);
    if (params?.source) query.set('source', params.source);
    if (params?.pending_follow_up !== undefined) query.set('pending_follow_up', String(params.pending_follow_up));

    const search = query.toString();
    const endpoint = search ? `/leads?${search}` : '/leads';

    return apiClient.get<LeadsResponse>(endpoint, true);
  },

  // Get a single lead by ID (requires auth)
  getById: async (id: string): Promise<LeadWithEvents> => {
    return apiClient.get<LeadWithEvents>(`/leads/${id}`, true);
  },

  // Change lead status (requires auth)
  changeStatus: async (id: string, status: string, reason?: string): Promise<LeadWithEvents> => {
    return apiClient.post<LeadWithEvents>(`/leads/${id}/change_status`, { status, reason }, true);
  },

  // Assign lead to user (requires auth)
  assign: async (id: string, userId: string): Promise<Lead> => {
    return apiClient.post<Lead>(`/leads/${id}/assign`, { user_id: userId }, true);
  },

  // Record contact attempt (requires auth)
  recordContact: async (id: string, method?: string, notes?: string): Promise<LeadWithEvents> => {
    return apiClient.post<LeadWithEvents>(`/leads/${id}/record_contact`, { method, notes }, true);
  },

  // Public endpoint for website forms (no auth required)
  publicCreate: async (data: CreatePublicLeadDto): Promise<CreateLeadResponse> => {
    return apiClient.post<CreateLeadResponse>('/leads/public', { lead: data }, false);
  },
};

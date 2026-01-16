import { apiClient } from '../../lib/api-client';

export interface CreatePublicLeadDto {
  full_name: string;
  email?: string;
  phone?: string;
  source: 'seller_form' | 'buyer_form';
  property_type_id?: string;
  interest_operation: 'buy' | 'rent' | 'invest' | 'sell';
  max_budget?: number;
  notes?: string;
  desired_date?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  consent_marketing?: boolean;
  source_detail?: Record<string, unknown>;
}

export interface CreateLeadResponse {
  message: string;
  id: string;
}

export const leadsApi = {
  // Public endpoint for website forms (no auth required)
  publicCreate: async (data: CreatePublicLeadDto): Promise<CreateLeadResponse> => {
    return apiClient.post<CreateLeadResponse>('/leads/public', { lead: data }, false);
  },
};

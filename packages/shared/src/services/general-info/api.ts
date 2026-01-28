import { apiClient } from '../../lib/api-client';

export interface GeneralInfo {
  phone: string;
  whatsapp: string;
  email_to: string;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  email_contact?: string | null;
}

export interface UpdateGeneralInfoDto {
  phone: string;
  whatsapp: string;
  email_to: string;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  email_contact?: string | null;
}

export const generalInfoApi = {
  // Get general info (singleton)
  get: async (): Promise<GeneralInfo> => {
    return apiClient.get<GeneralInfo>('/general_info', true);
  },

  // Update general info
  update: async (data: UpdateGeneralInfoDto): Promise<GeneralInfo> => {
    return apiClient.put<GeneralInfo>('/general_info', { general_info: data }, true);
  },
};

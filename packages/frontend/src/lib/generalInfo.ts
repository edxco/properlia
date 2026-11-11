import { generalInfoApi, type GeneralInfo } from "@properlia/shared/services/general-info/api";

const GENERAL_INFO_CACHE = { revalidate: 3600, tags: ["general-info"] };

/** Null when the API is unreachable, so pages render without contact details instead of failing. */
export async function getGeneralInfo(): Promise<GeneralInfo | null> {
  try {
    return await generalInfoApi.get(GENERAL_INFO_CACHE);
  } catch {
    return null;
  }
}

/** https://wa.me link from a phone number in any format, or null when there are no digits. */
export function whatsappUrl(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

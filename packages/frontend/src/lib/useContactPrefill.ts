"use client";

import { useCallback, useEffect, useState } from "react";

const COOKIE_NAME = "properlia_contact";
const MAX_AGE_SECONDS = 15 * 24 * 60 * 60;

export interface ContactPrefill {
  name: string;
  email: string;
  phone: string;
}

const readCookie = (): ContactPrefill | null => {
  const entry = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  try {
    const data = JSON.parse(decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)));
    if (typeof data?.name !== "string") return null;
    return {
      name: data.name,
      email: typeof data.email === "string" ? data.email : "",
      phone: typeof data.phone === "string" ? data.phone : "",
    };
  } catch {
    return null;
  }
};

export function useContactPrefill() {
  const [saved, setSaved] = useState<ContactPrefill | null>(null);

  useEffect(() => setSaved(readCookie()), []);

  const save = useCallback((values: ContactPrefill) => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(values))}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  }, []);

  const clear = useCallback(() => {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
    setSaved(null);
  }, []);

  return { saved, save, clear };
}

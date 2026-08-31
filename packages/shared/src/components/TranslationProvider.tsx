"use client";

import { createContext, useContext } from "react";

const TranslationContext = createContext<any>(null);
const LocaleContext = createContext<string>("es");

export function TranslationProvider({ dictionary, locale, children }: any) {
  return (
    <LocaleContext.Provider value={locale}>
      <TranslationContext.Provider value={dictionary}>
        {children}
      </TranslationContext.Provider>
    </LocaleContext.Provider>
  );
}

export function useT() {
  const dict = useContext(TranslationContext);
  return (key: string) => dict[key] ?? key;
}

export function useLocale() {
  return useContext(LocaleContext);
}
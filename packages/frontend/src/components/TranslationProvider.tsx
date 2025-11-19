"use client";

import { createContext, useContext } from "react";

const TranslationContext = createContext<any>(null);

export function TranslationProvider({ dictionary, children }: any) {
  return (
    <TranslationContext.Provider value={dictionary}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useT() {
  const dict = useContext(TranslationContext);
  return (key: string) => dict[key] ?? key;
}

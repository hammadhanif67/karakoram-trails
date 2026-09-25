"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Currency } from "./content";

const KEY = "kt-currency";

const CurrencyContext = createContext<{ currency: Currency; setCurrency: (c: Currency) => void }>({
  currency: "PKR",
  setCurrency: () => {},
});

/** Shares the PKR/USD choice across the home page and tour pages, remembered per browser. */
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Always start with PKR so the static HTML and the first client render match.
  const [currency, setState] = useState<Currency>("PKR");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a saved preference after hydration
      if (saved === "USD") setState("USD");
    } catch {
      /* storage unavailable (private mode); keep PKR */
    }
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setState(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);

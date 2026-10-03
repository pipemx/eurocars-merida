"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { track } from "@/lib/analytics";

export type Theme = "dark" | "light";

type Ctx = {
  locale: Locale;
  t: Dictionary;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const PreferencesContext = createContext<Ctx | null>(null);

export const THEME_KEY = "ec-theme";

/**
 * Script inline (antes del primer pintado): tema guardado > prefers-color-scheme > dark.
 * Evita el flash al cargar.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

export function PreferencesProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = useMemo(() => getDictionary(locale), [locale]);
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    document.cookie = `ec-locale=${locale};path=/;max-age=31536000;samesite=lax`;
  }, [locale]);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.dataset.theme = next;
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
    track("theme_changed", { theme: next });
  }, []);

  const value = useMemo(() => ({ locale, t, theme, setTheme }), [locale, t, theme, setTheme]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences fuera de PreferencesProvider");
  return ctx;
}

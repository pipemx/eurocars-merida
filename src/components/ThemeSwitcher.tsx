"use client";

import { Moon, Sun } from "lucide-react";
import { usePreferences } from "./providers/Preferences";

/** Interruptor Dark/Light. `compact` = solo icono (acceso rápido móvil). */
export function ThemeSwitcher({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const { theme, setTheme, t } = usePreferences();
  const next = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? t.theme.toLight : t.theme.toDark;

  if (compact) {
    return (
      <button type="button" onClick={() => setTheme(next)} aria-label={label} title={label} className={`grid h-11 w-11 place-items-center text-current ${className}`}>
        {theme === "dark" ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.4} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.4} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "light"}
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
      className={`group relative flex h-11 items-center ${className}`}
    >
      <span className="relative flex h-7 w-[52px] items-center rounded-full border border-current/30 px-[3px] transition-colors group-hover:border-current/60">
        <span
          aria-hidden
          className={`grid h-5 w-5 place-items-center rounded-full bg-current transition-transform duration-300 ease-[var(--ease-editorial)] ${theme === "light" ? "translate-x-[24px]" : ""}`}
        >
          {theme === "dark" ? <Moon className="h-3 w-3 text-night" strokeWidth={2} /> : <Sun className="h-3 w-3 text-bone" strokeWidth={2} />}
        </span>
      </span>
    </button>
  );
}

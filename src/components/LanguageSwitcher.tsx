"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, routes, type Locale } from "@/i18n/config";
import { track } from "@/lib/analytics";
import { usePreferences } from "./providers/Preferences";

/** Traduce la ruta actual al otro idioma (incluye segmentos traducidos como inventario/inventory). */
function swapLocale(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  parts[1] = to;
  for (const r of Object.values(routes)) {
    const i = parts.findIndex((p, idx) => idx > 1 && (Object.values(r) as string[]).includes(p));
    if (i > -1) parts[i] = r[to];
  }
  return parts.join("/") || `/${to}`;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = usePreferences();
  const pathname = usePathname() ?? `/${locale}`;
  return (
    <nav aria-label={t.language.label} className={`flex items-center text-[12px] font-medium tracking-[0.16em] ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span aria-hidden className="mx-1 opacity-35">|</span>}
          <Link
            href={swapLocale(pathname, l)}
            hrefLang={l === "es" ? "es-MX" : "en"}
            aria-current={l === locale ? "true" : undefined}
            onClick={() => l !== locale && track("language_changed", { to: l })}
            className={`grid h-11 min-w-9 place-items-center uppercase transition-opacity ${l === locale ? "opacity-100" : "opacity-50 hover:opacity-90"}`}
          >
            {l}
          </Link>
        </span>
      ))}
    </nav>
  );
}

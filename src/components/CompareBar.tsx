"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Columns2, X } from "lucide-react";
import { routePath } from "@/i18n/config";
import { DEMO_MODE } from "@/lib/demo-mode";
import { compare, COMPARE_MIN } from "@/services/compare";
import { usePreferences } from "./providers/Preferences";

export type CompareSummary = { slug: string; name: string };

/**
 * Barra flotante del comparador: aparece cuando hay vehículos seleccionados.
 * Se aparta del botón de WhatsApp (derecha) y, en la ficha móvil, de la barra fija inferior.
 */
export function CompareBar({ items }: { items: CompareSummary[] }) {
  const { t, locale } = usePreferences();
  const pathname = usePathname();
  const slugs = compare.useList();
  const picked = slugs.map((s) => items.find((i) => i.slug === s)).filter((i): i is CompareSummary => Boolean(i));
  if (picked.length === 0 || pathname === routePath(locale, "compare")) return null;

  const onVehiclePage = pathname.startsWith(`${routePath(locale, "inventory")}/`);
  const ready = picked.length >= COMPARE_MIN;
  // Con el asistente IA (demo, ES) en móvil: la barra sube para no taparlo (el botón del asistente ocupa 92–140 px).
  const aboveAssistant = DEMO_MODE && locale === "es";

  return (
    <div
      role="region"
      aria-label={t.compare.barAria}
      className={`rise fixed inset-x-3 z-40 flex items-center gap-3 border border-line-strong/60 bg-surface/95 py-2 pl-4 pr-2 text-ink shadow-[var(--shadow)] backdrop-blur-md md:inset-x-auto md:left-6 md:min-w-[400px] ${onVehiclePage ? (aboveAssistant ? "bottom-[156px] lg:bottom-6" : "bottom-[84px] lg:bottom-6") : aboveAssistant ? "bottom-[156px] md:bottom-6" : "bottom-[92px] md:bottom-6"}`}
    >
      <Columns2 className="hidden h-4 w-4 shrink-0 text-accent sm:block" strokeWidth={1.6} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{t.compare.barCount(picked.length)}</p>
        <p className="truncate text-[12px] text-muted">{picked.map((p) => p.name).join(" · ")}</p>
      </div>
      {ready ? (
        <Link href={routePath(locale, "compare")} className="inline-flex min-h-11 shrink-0 items-center bg-accent px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-accent-ink">
          {t.compare.barOpen}
        </Link>
      ) : (
        <span className="shrink-0 px-2 text-[11px] uppercase tracking-[0.1em] text-muted">{t.compare.barNeedOne}</span>
      )}
      <button type="button" onClick={() => compare.clear()} aria-label={t.compare.clear} className="grid h-11 w-11 shrink-0 place-items-center text-muted hover:text-ink">
        <X className="h-4 w-4" strokeWidth={1.6} />
      </button>
    </div>
  );
}

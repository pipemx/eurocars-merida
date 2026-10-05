"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import type { Lead } from "@/types/crm";
import { pendingFollowUps, type EffectiveLead } from "@/services/crm/rules";
import { useEffectiveLeads } from "@/services/crm/state";
import { type AdminVehicle, useAdminInventory } from "@/services/inventory/admin";

type Tone = "ok" | "error";
type Toast = { id: number; message: string; tone: Tone };

type AdminCtx = {
  vehicles: AdminVehicle[];
  /** Prospectos efectivos (dataset CRM + cambios locales). */
  leads: EffectiveLead[];
  hasCrmChanges: boolean;
  /** Seguimientos pendientes (vencidos + hoy), para el contador del menú. */
  pendingCount: number;
  /** Nombre del vehículo por slug: "BMW X7 M60 Sport", "BMW X7 M60 Sport 2024" y "BMW X7". */
  vehicleNames: (slug: string) => { title: string; full: string; short: string };
  editedCount: number;
  addedCount: number;
  hasLocalChanges: boolean;
  /** Slug recién agregado/guardado: la fila se resalta unos segundos en el inventario. */
  highlightSlug: string | null;
  highlight: (slug: string) => void;
  toast: (message: string, tone?: Tone) => void;
};

const Ctx = createContext<AdminCtx | null>(null);

export function useAdmin() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdmin fuera de AdminProviders");
  return v;
}

/** Inventario fusionado (demo + ediciones locales + agregados), resaltado de filas y avisos. */
export function AdminProviders({ base, baseLeads, children }: { base: Vehicle[]; baseLeads: Lead[]; children: React.ReactNode }) {
  const inv = useAdminInventory(base);
  const { leads, hasCrmChanges } = useEffectiveLeads(baseLeads);
  const pendingCount = useMemo(() => pendingFollowUps(leads).length, [leads]);
  const vehicleNames = useMemo(() => {
    const map = new Map(inv.vehicles.map((v) => [v.slug, v]));
    return (slug: string) => {
      const v = map.get(slug);
      if (!v) return { title: slug, full: slug, short: slug };
      const title = [v.brand, v.model, v.version].filter(Boolean).join(" ");
      return { title, full: `${title} ${v.year}`, short: `${v.brand} ${v.model}` };
    };
  }, [inv.vehicles]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);
  const seq = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const toast = useCallback((message: string, tone: Tone = "ok") => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    timers.current.push(window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 6000 : 3200));
  }, []);

  const highlight = useCallback((slug: string) => {
    setHighlightSlug(slug);
    timers.current.push(window.setTimeout(() => setHighlightSlug((cur) => (cur === slug ? null : cur)), 4500));
  }, []);

  const value = useMemo<AdminCtx>(() => ({ ...inv, leads, hasCrmChanges, pendingCount, vehicleNames, highlightSlug, highlight, toast }), [inv, leads, hasCrmChanges, pendingCount, vehicleNames, highlightSlug, highlight, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-[76px] z-[95] flex flex-col items-end gap-2 lg:top-6 lg:inset-x-auto lg:right-8">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="rise pointer-events-auto flex w-full max-w-[420px] items-start gap-3 border border-line-strong/60 bg-surface px-4 py-3 text-[14px] text-ink shadow-[var(--shadow)]">
            {t.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} aria-hidden /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#e0735a]" strokeWidth={1.7} aria-hidden />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

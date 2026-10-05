"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { type AdminVehicle, useAdminInventory } from "@/services/inventory/admin";

type Tone = "ok" | "error";
type Toast = { id: number; message: string; tone: Tone };

type AdminCtx = {
  vehicles: AdminVehicle[];
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
export function AdminProviders({ base, children }: { base: Vehicle[]; children: React.ReactNode }) {
  const inv = useAdminInventory(base);
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

  const value = useMemo<AdminCtx>(() => ({ ...inv, highlightSlug, highlight, toast }), [inv, highlightSlug, highlight, toast]);

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

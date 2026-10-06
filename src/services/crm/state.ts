"use client";

import { useMemo } from "react";
import type { Lead, LeadNote, LeadOverride, LeadStatus } from "@/types/crm";
import { createLocalJsonStore } from "../storage/local-json-store";
import { applyOverride, type EffectiveLead } from "./rules";

/**
 * Cambios del CRM hechos en la demo (estado, notas, seguimiento hecho): solo en localStorage de este
 * navegador. El dataset fuente nunca se modifica. Mañana: escrituras a Supabase con la misma interfaz.
 */
const store = createLocalJsonStore<Record<string, LeadOverride>>("ec-demo-crm-state", {});
/** Prospectos creados desde el asistente IA (demo). Se borran con "Restaurar datos demo". */
const createdStore = createLocalJsonStore<Lead[]>("ec-demo-assistant-leads", []);

/** Convierte un prospecto creado (con createdAt) en uno con minutos relativos al momento actual. */
function materialize(l: Lead, now: number): Lead {
  if (!l.createdAt) return l;
  const m = Math.max(0, Math.floor((now - Date.parse(l.createdAt)) / 60000));
  return { ...l, enteredMinutesAgo: m, lastInteraction: { label: l.lastInteraction.label, minutesAgo: m } };
}

/** Prospectos efectivos = dataset + cambios locales. */
export function useEffectiveLeads(base: Lead[]) {
  const overrides = store.useValue();
  const created = createdStore.useValue();
  const leads: EffectiveLead[] = useMemo(() => {
    const now = Date.now();
    return [...created.map((l) => materialize(l, now)), ...base].map((l) => applyOverride(l, overrides[l.id]));
  }, [base, overrides, created]);
  return { leads, hasCrmChanges: Object.keys(overrides).length > 0 || created.length > 0 };
}

const patch = (id: string, fn: (o: LeadOverride) => LeadOverride) => store.update((cur) => ({ ...cur, [id]: fn(cur[id] ?? {}) }));

export const setLeadStatus = (id: string, status: LeadStatus) => patch(id, (o) => ({ ...o, status }));

export function addLeadNote(id: string, text: string): boolean {
  const note: LeadNote = { id: `n-${Date.now().toString(36)}`, text: text.trim(), at: new Date().toISOString() };
  return patch(id, (o) => ({ ...o, notes: [note, ...(o.notes ?? [])] }));
}

export const setFollowUpDone = (id: string, done: boolean) => patch(id, (o) => ({ ...o, followUpDone: done }));

export const resetCrmState = () => {
  store.reset();
  createdStore.reset();
};

export interface AssistantLeadInput {
  name: string;
  phone: string;
  vehicleSlug: string;
  /** Resumen de la conversación (líneas). */
  summary: string[];
}

/** Crea un prospecto DEMO desde el asistente: origen "Asistente IA", estado Nuevo, seguimiento hoy. Solo localStorage. */
export function createAssistantLead(input: AssistantLeadInput): { ok: true; id: string } | { ok: false } {
  const d = new Date();
  const id = `lead-ai-${d.getTime().toString(36)}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const lead: Lead = {
    id,
    isDemo: true,
    name: input.name.trim(),
    vehicleSlug: input.vehicleSlug,
    source: "asistente",
    status: "nuevo",
    enteredMinutesAgo: 0,
    lastInteraction: { label: "Consulta iniciada desde Eurocars AI", minutesAgo: 0 },
    followUp: { dayOffset: 0, time, action: "reply" },
    appointment: null,
    phone: input.phone.trim(),
    createdAt: d.toISOString(),
    aiSummary: input.summary,
  };
  return createdStore.update((cur) => [lead, ...cur]) ? { ok: true, id } : { ok: false };
}

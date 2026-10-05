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

/** Prospectos efectivos = dataset + cambios locales. */
export function useEffectiveLeads(base: Lead[]) {
  const overrides = store.useValue();
  const leads: EffectiveLead[] = useMemo(() => base.map((l) => applyOverride(l, overrides[l.id])), [base, overrides]);
  return { leads, hasCrmChanges: Object.keys(overrides).length > 0 };
}

const patch = (id: string, fn: (o: LeadOverride) => LeadOverride) => store.update((cur) => ({ ...cur, [id]: fn(cur[id] ?? {}) }));

export const setLeadStatus = (id: string, status: LeadStatus) => patch(id, (o) => ({ ...o, status }));

export function addLeadNote(id: string, text: string): boolean {
  const note: LeadNote = { id: `n-${Date.now().toString(36)}`, text: text.trim(), at: new Date().toISOString() };
  return patch(id, (o) => ({ ...o, notes: [note, ...(o.notes ?? [])] }));
}

export const setFollowUpDone = (id: string, done: boolean) => patch(id, (o) => ({ ...o, followUpDone: done }));

export const resetCrmState = () => store.reset();

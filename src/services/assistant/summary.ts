import type { Vehicle } from "@/types/vehicle";
import { vfull, vname } from "./rules-provider";
import type { ConversationState } from "./types";

/**
 * Resumen de la conversación para el prospecto (CRM). Se arma SOLO con lo que dijo el usuario y los
 * vehículos mostrados; no agrega nada nuevo.
 */
export function buildLeadSummary(state: ConversationState, vehicle: Vehicle | undefined, bySlug: (slug: string) => Vehicle | undefined): string[] {
  const lines: string[] = [];
  if (vehicle) lines.push(`Interesado en ${vfull(vehicle)}.`);
  const questions = state.userTexts.map((t) => t.trim()).filter((t) => t.length > 3).slice(-3);
  for (const q of questions) lines.push(`Preguntó: «${q.length > 90 ? `${q.slice(0, 87)}…` : q}»`);
  const seen = state.shown.map(bySlug).filter((v): v is Vehicle => Boolean(v)).map(vname);
  if (seen.length) lines.push(`Vehículos revisados en el chat: ${[...new Set(seen)].join(", ")}.`);
  lines.push("Pidió que un asesor de Eurocars lo contacte.");
  return lines;
}

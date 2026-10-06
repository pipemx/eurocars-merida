import { agoLong } from "@/lib/admin-format";
import type { FollowUpAction, FollowUpState, Lead, LeadNote, LeadOverride, LeadSource, LeadStatus, Priority, TimelineEvent } from "@/types/crm";

/**
 * Reglas del CRM demo. Puras (sin React ni almacenamiento): las usan el dashboard, los prospectos, los
 * seguimientos y el resumen diario, de modo que TODOS los números salgan del mismo dataset.
 * Mañana se reemplazan por consultas a Supabase sin cambiar la UI.
 */

export type EffectiveLead = Lead & { notes: LeadNote[]; followUpDone: boolean; edited: boolean };

export const STATUS_LABEL: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  seguimiento: "Seguimiento",
  cita: "Cita agendada",
  negociacion: "Negociación",
  vendido: "Vendido",
};
export const STATUS_ORDER: LeadStatus[] = ["nuevo", "contactado", "seguimiento", "cita", "negociacion", "vendido"];

export const SOURCE_LABEL: Record<LeadSource, string> = { web: "Web", whatsapp: "WhatsApp", instagram: "Instagram", facebook: "Facebook", google: "Google", asistente: "Asistente IA" };

export const ACTION_LABEL: Record<FollowUpAction, string> = { follow_up: "Dar seguimiento", reply: "Responder", review: "Revisar" };

export const PRIORITY_LABEL: Record<Priority, string> = { alta: "Alta", media: "Media", normal: "Normal", cerrado: "Cerrado" };
export const PRIORITY_TOOLTIP = "Prioridad demo calculada a partir del estado y seguimiento.";

/** Una cita se considera "próxima" si es hoy o dentro de este número de días. */
export const APPOINTMENT_SOON_DAYS = 2;

export const PRIORITY_RULES: { level: Priority; rules: string[] }[] = [
  { level: "alta", rules: ["Seguimiento vencido", `Cita hoy o en los próximos ${APPOINTMENT_SOON_DAYS} días`, "En negociación"] },
  { level: "media", rules: ["Nuevo sin atender", "Seguimiento programado para hoy"] },
  { level: "normal", rules: ["Contactado, sin pendiente inmediato"] },
];

export function applyOverride(lead: Lead, o?: LeadOverride): EffectiveLead {
  return { ...lead, status: o?.status ?? lead.status, notes: o?.notes ?? [], followUpDone: Boolean(o?.followUpDone), edited: Boolean(o && (o.status || o.notes?.length || o.followUpDone)) };
}

export const followUpState = (dayOffset: number): FollowUpState => (dayOffset < 0 ? "overdue" : dayOffset === 0 ? "today" : "upcoming");

export const isClosed = (l: Lead) => l.status === "vendido";

export function dayLabel(dayOffset: number) {
  if (dayOffset === -1) return "ayer";
  if (dayOffset < -1) return `hace ${-dayOffset} días`;
  if (dayOffset === 0) return "hoy";
  if (dayOffset === 1) return "mañana";
  return `en ${dayOffset} días`;
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Seguimiento activo (no cerrado ni marcado como hecho). */
function openFollowUp(l: EffectiveLead) {
  return !isClosed(l) && !l.followUpDone ? l.followUp : null;
}

export type FollowUpGroup = "overdue" | "today" | "upcoming";

/** En qué bloque de "Seguimientos" cae el prospecto (null = sin pendiente). Prevalece el más urgente. */
export function followUpGroup(l: EffectiveLead): FollowUpGroup | null {
  if (isClosed(l)) return null;
  const fu = openFollowUp(l);
  const appt = l.followUpDone ? null : l.appointment;
  const states: FollowUpState[] = [];
  if (fu) states.push(followUpState(fu.dayOffset));
  if (appt && appt.dayOffset >= 0) states.push(followUpState(appt.dayOffset));
  if (states.includes("overdue")) return "overdue";
  if (states.includes("today")) return "today";
  if (states.includes("upcoming")) return "upcoming";
  return null;
}

/** Seguimientos que requieren atención hoy: vencidos y de hoy. Vencidos primero. */
export function pendingFollowUps<T extends EffectiveLead>(leads: T[]): T[] {
  return leads
    .filter((l) => {
      const fu = openFollowUp(l);
      return fu && followUpState(fu.dayOffset) !== "upcoming";
    })
    .sort((a, b) => a.followUp!.dayOffset - b.followUp!.dayOffset || a.followUp!.time.localeCompare(b.followUp!.time));
}

export function priorityOf(l: EffectiveLead): { level: Priority; reason: string } {
  if (isClosed(l)) return { level: "cerrado", reason: "Prospecto cerrado" };
  const fu = openFollowUp(l);
  if (fu && followUpState(fu.dayOffset) === "overdue") return { level: "alta", reason: "Seguimiento vencido" };
  if (l.appointment && l.appointment.dayOffset >= 0 && l.appointment.dayOffset <= APPOINTMENT_SOON_DAYS) return { level: "alta", reason: `Cita ${dayLabel(l.appointment.dayOffset)}` };
  if (l.status === "negociacion") return { level: "alta", reason: "En negociación" };
  if (l.status === "nuevo") return { level: "media", reason: "Nuevo sin atender" };
  if (fu && followUpState(fu.dayOffset) === "today") return { level: "media", reason: "Seguimiento para hoy" };
  return { level: "normal", reason: "Contactado, sin pendiente inmediato" };
}

const PRIORITY_RANK: Record<Priority, number> = { alta: 0, media: 1, normal: 2, cerrado: 3 };
export const priorityRank = (l: EffectiveLead) => PRIORITY_RANK[priorityOf(l).level];

/** Texto del motivo en Seguimientos: por qué está ahí. */
export function followUpReason(l: EffectiveLead): string {
  const fu = openFollowUp(l);
  const appt = l.appointment;
  const state = fu ? followUpState(fu.dayOffset) : null;
  if (state === "overdue") return `Sin respuesta desde ${agoLong(l.lastInteraction.minutesAgo).toLowerCase().replace(/^hace /, "hace ")}`;
  if (appt && appt.dayOffset >= 0) {
    const kind = appt.kind === "test_drive" ? "Prueba de manejo" : "Visita";
    return `${kind} ${dayLabel(appt.dayOffset)} ${appt.time}`;
  }
  if (fu) {
    if (state === "today") return fu.action === "reply" ? `Responder consulta hoy ${fu.time}` : `Seguimiento programado para hoy ${fu.time}`;
    return `Seguimiento programado ${dayLabel(fu.dayOffset)} ${fu.time}`;
  }
  return "Sin pendiente inmediato";
}

/** "Qué hacer ahora": recomendación corta y transparente (reglas, no predicción). */
export function nextActionHint(l: EffectiveLead): { title: string; detail: string } {
  if (isClosed(l)) return { title: "Prospecto cerrado", detail: "No hay acciones pendientes." };
  const fu = openFollowUp(l);
  const state = fu ? followUpState(fu.dayOffset) : null;
  if (state === "overdue") return { title: "Dar seguimiento hoy", detail: `Sin respuesta desde ${agoLong(l.lastInteraction.minutesAgo).toLowerCase()}. Conviene escribirle antes de que se enfríe la conversación.` };
  if (l.appointment && l.appointment.dayOffset >= 0 && l.appointment.dayOffset <= APPOINTMENT_SOON_DAYS) {
    return { title: "Confirmar la cita", detail: `${l.appointment.kind === "test_drive" ? "Prueba de manejo" : "Visita"} ${dayLabel(l.appointment.dayOffset)} a las ${l.appointment.time}. Confirma asistencia y prepara la unidad.` };
  }
  if (l.status === "negociacion") return { title: "Avanzar la negociación", detail: "Hay una negociación activa. Mantén el contacto y registra cada acuerdo en una nota." };
  if (l.status === "nuevo") return { title: "Responder primero", detail: "Aún no se le atiende. Una respuesta rápida suele marcar la diferencia." };
  if (state === "today" && fu) return { title: fu.action === "reply" ? "Responder hoy" : "Dar seguimiento hoy", detail: `Seguimiento programado para hoy ${fu.time}.` };
  if (fu) return { title: "Seguimiento programado", detail: `${cap(dayLabel(fu.dayOffset))} ${fu.time}. Por ahora no requiere acción.` };
  return { title: "Sin pendiente inmediato", detail: "Puedes programar un seguimiento si lo necesitas." };
}

export function summarizeLeads(leads: EffectiveLead[]) {
  const open = leads.filter((l) => !isClosed(l));
  const pending = pendingFollowUps(leads);
  return {
    total: leads.length,
    active: open.length,
    nuevos: leads.filter((l) => l.status === "nuevo").length,
    pendientes: pending.length,
    vencidos: pending.filter((l) => followUpState(l.followUp!.dayOffset) === "overdue").length,
    citas: open.filter((l) => l.appointment && l.appointment.dayOffset >= 0).length,
    citasHoy: open.filter((l) => l.appointment?.dayOffset === 0).length,
    negociaciones: leads.filter((l) => l.status === "negociacion").length,
    alta: open.filter((l) => priorityOf(l).level === "alta").length,
  };
}

/** Línea de tiempo demo: se construye con los datos del prospecto (sin eventos inventados aparte). */
export function leadTimeline(l: EffectiveLead, vehicleLabel: string): TimelineEvent[] {
  if (l.aiSummary) return aiLeadTimeline(l);
  const ev: { m: number; text: string }[] = [
    { m: l.enteredMinutesAgo, text: `Nueva consulta desde ${SOURCE_LABEL[l.source]}` },
    { m: Math.max(1, l.enteredMinutesAgo - 4), text: `Solicitó información del ${vehicleLabel}` },
  ];
  if (l.status !== "nuevo" && l.enteredMinutesAgo >= 60) ev.push({ m: Math.max(l.enteredMinutesAgo - 45, l.lastInteraction.minutesAgo), text: "Un asesor respondió" });
  if (!/^Solicitó información/.test(l.lastInteraction.label) && l.lastInteraction.minutesAgo < l.enteredMinutesAgo - 5) ev.push({ m: l.lastInteraction.minutesAgo, text: l.lastInteraction.label });
  const out: TimelineEvent[] = ev.sort((a, b) => b.m - a.m).map((e, i) => ({ id: `t${i}`, when: agoLong(e.m), text: e.text }));
  if (l.appointment) out.push({ id: "appt", when: `${cap(dayLabel(l.appointment.dayOffset))} ${l.appointment.time}`, text: l.appointment.kind === "test_drive" ? "Prueba de manejo agendada" : "Visita agendada", pending: true });
  const fu = openFollowUp(l);
  if (fu) {
    const st = followUpState(fu.dayOffset);
    out.push({ id: "fu", when: `${cap(dayLabel(fu.dayOffset))} ${fu.time}`, text: st === "overdue" ? "Seguimiento vencido" : "Seguimiento pendiente", pending: true });
  }
  if (l.followUpDone) out.push({ id: "done", when: "Ahora", text: "Seguimiento marcado como hecho (demo)" });
  return out;
}

/** Prospecto creado desde el asistente IA: línea de tiempo con el resumen de la conversación. */
function aiLeadTimeline(l: EffectiveLead): TimelineEvent[] {
  const out: TimelineEvent[] = [
    { id: "ai-start", when: agoLong(l.enteredMinutesAgo), text: "Consulta iniciada desde Eurocars AI" },
    { id: "ai-summary", when: agoLong(l.enteredMinutesAgo), text: "Resumen de la conversación", detail: l.aiSummary },
  ];
  const fu = openFollowUp(l);
  if (fu) out.push({ id: "fu", when: `${cap(dayLabel(fu.dayOffset))} ${fu.time}`, text: "Responder al prospecto", pending: true });
  if (l.followUpDone) out.push({ id: "done", when: "Ahora", text: "Seguimiento marcado como hecho (demo)" });
  return out;
}

export type AgendaItem = { time: string; text: string; leadId: string };

/** Agenda de hoy: seguimientos y citas de hoy con hora, ordenados. Si coinciden, manda la cita. */
export function agendaToday(leads: EffectiveLead[], shortName: (slug: string) => string): AgendaItem[] {
  const items: AgendaItem[] = [];
  for (const l of leads) {
    if (isClosed(l)) continue;
    const veh = shortName(l.vehicleSlug);
    if (l.appointment?.dayOffset === 0 && !l.followUpDone) {
      items.push({ time: l.appointment.time, text: `${l.appointment.kind === "test_drive" ? "Prueba de manejo" : "Visita"} ${veh}`, leadId: l.id });
    } else if (l.followUp?.dayOffset === 0 && !l.followUpDone) {
      items.push({ time: l.followUp.time, text: `${l.followUp.action === "reply" ? "Consulta" : "Seguimiento"} ${veh}`, leadId: l.id });
    }
  }
  return items.sort((a, b) => a.time.localeCompare(b.time));
}

export interface RisingInterest {
  vehicleSlug: string;
  activeLeadIds: string[];
  pendingLeadIds: string[];
}

/** Unidad con más prospectos activos (desempate: más seguimientos pendientes). Reglas, no predicción. */
export function deriveRisingInterest(leads: EffectiveLead[]): RisingInterest | null {
  const pending = new Set(pendingFollowUps(leads).map((l) => l.id));
  const map = new Map<string, RisingInterest>();
  for (const l of leads) {
    if (isClosed(l)) continue;
    const e = map.get(l.vehicleSlug) ?? { vehicleSlug: l.vehicleSlug, activeLeadIds: [], pendingLeadIds: [] };
    e.activeLeadIds.push(l.id);
    if (pending.has(l.id)) e.pendingLeadIds.push(l.id);
    map.set(l.vehicleSlug, e);
  }
  const best = [...map.values()].sort((a, b) => b.activeLeadIds.length - a.activeLeadIds.length || b.pendingLeadIds.length - a.pendingLeadIds.length)[0];
  return best && best.activeLeadIds.length > 1 ? best : null;
}

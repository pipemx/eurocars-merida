export type LeadStatus = "nuevo" | "contactado" | "seguimiento" | "cita" | "negociacion" | "vendido";
export type LeadSource = "web" | "whatsapp" | "instagram" | "facebook" | "google";
export type FollowUpState = "overdue" | "today" | "upcoming";
export type FollowUpAction = "follow_up" | "reply" | "review";
export type Priority = "alta" | "media" | "normal" | "cerrado";

/** Prospecto. DEMO: personas ficticias; el vehículo SIEMPRE pertenece al inventario (por slug). */
export interface Lead {
  id: string;
  isDemo: true;
  name: string;
  vehicleSlug: string;
  source: LeadSource;
  status: LeadStatus;
  /** Cuándo entró (minutos atrás, relativo al "ahora" de la demo). */
  enteredMinutesAgo: number;
  /** Última interacción: texto + hace cuántos minutos. */
  lastInteraction: { label: string; minutesAgo: number };
  /**
   * Próximo seguimiento. `dayOffset`: -1 = ayer (vencido), 0 = hoy, 1 = mañana… `time` = "HH:MM".
   * El estado (vencido/hoy/próximo) se DERIVA de dayOffset: nunca se guarda por separado.
   */
  followUp: { dayOffset: number; time: string; action: FollowUpAction } | null;
  /** Cita (prueba de manejo / visita). */
  appointment: { dayOffset: number; time: string; kind: "test_drive" | "visit" } | null;
}

export interface LeadNote {
  id: string;
  text: string;
  /** ISO. */
  at: string;
}

/** Cambios hechos en la demo (localStorage); el dataset fuente no se modifica. */
export interface LeadOverride {
  status?: LeadStatus;
  notes?: LeadNote[];
  /** El seguimiento se marcó como hecho. */
  followUpDone?: boolean;
}

export type ActivityKind = "inquiry" | "share" | "test_drive" | "favorite";

export interface ActivityItem {
  id: string;
  isDemo: true;
  kind: ActivityKind;
  vehicleSlug: string;
  minutesAgo: number;
  leadId?: string;
}

export interface TimelineEvent {
  id: string;
  /** Texto relativo: "Hace 26 h", "Hoy 12:30"… */
  when: string;
  text: string;
  /** Evento futuro/pendiente. */
  pending?: boolean;
}

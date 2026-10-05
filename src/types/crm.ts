export type LeadStatus = "nuevo" | "contactado" | "seguimiento" | "cita" | "negociacion" | "vendido";
export type LeadSource = "web" | "whatsapp" | "instagram" | "facebook" | "google";
export type FollowUpState = "overdue" | "today" | "upcoming";
export type FollowUpAction = "follow_up" | "reply" | "review";

/** Prospecto. DEMO: personas ficticias; el vehículo SIEMPRE pertenece al inventario demo (por slug). */
export interface Lead {
  id: string;
  isDemo: true;
  name: string;
  vehicleSlug: string;
  source: LeadSource;
  status: LeadStatus;
  /** Última interacción: texto + hace cuántos minutos (relativo al "ahora" de la demo). */
  lastInteraction: { label: string; minutesAgo: number };
  /** null = sin seguimiento programado. */
  followUp: { state: FollowUpState; action: FollowUpAction } | null;
  testDrive: { state: "scheduled" } | null;
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

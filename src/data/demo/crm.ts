import type { ActivityItem, Lead } from "@/types/crm";

/**
 * CRM DEMO — personas, mensajes y tiempos FICTICIOS (isDemo: true), nunca datos reales de Eurocars.
 * Todos los prospectos apuntan a vehículos REALES del inventario (por slug). El dashboard, la actividad,
 * el insight, el CRM, los seguimientos y el resumen diario se DERIVAN de ESTE mismo conjunto: ningún
 * número se escribe a mano en otra parte.
 *
 * "Ahora" de la demo: mañana de un día laborable. dayOffset -1 = ayer, 0 = hoy, 1 = mañana…
 */
const X7 = "bmw-x7-m60-sport-2024";
const MACAN = "porsche-macan-s-2019";
const AMG = "mercedes-benz-amg-gt-2020";
const URUS = "lamborghini-urus-performante-2024";
const SUPRA = "toyota-supra-gr-2020";
const SIERRA = "gmc-sierra-denali-2025";
const K3 = "kia-k3-l-aut-2024";
const SWIFT = "suzuki-swift-gls-2018";

const H = 60;
const D = 24 * H;

export const demoLeads: Lead[] = [
  { id: "lead-carlos-mendoza", isDemo: true, name: "Carlos Mendoza", vehicleSlug: X7, source: "whatsapp", status: "seguimiento", enteredMinutesAgo: 26 * H, lastInteraction: { label: "Preguntó por WhatsApp", minutesAgo: 22 * H }, followUp: { dayOffset: -1, time: "11:00", action: "follow_up" }, appointment: null },
  { id: "lead-ricardo-salas", isDemo: true, name: "Ricardo Salas", vehicleSlug: X7, source: "web", status: "contactado", enteredMinutesAgo: 2 * D, lastInteraction: { label: "Solicitó información", minutesAgo: 31 * H }, followUp: { dayOffset: -1, time: "16:00", action: "reply" }, appointment: null },
  { id: "lead-mariana-r", isDemo: true, name: "Mariana R.", vehicleSlug: MACAN, source: "web", status: "nuevo", enteredMinutesAgo: 4 * H, lastInteraction: { label: "Solicitó información", minutesAgo: 4 * H }, followUp: { dayOffset: 0, time: "12:30", action: "reply" }, appointment: null },
  { id: "lead-fernando-g", isDemo: true, name: "Fernando G.", vehicleSlug: AMG, source: "instagram", status: "cita", enteredMinutesAgo: 3 * D, lastInteraction: { label: "Confirmó prueba de manejo", minutesAgo: 2 * H }, followUp: { dayOffset: 0, time: "17:00", action: "review" }, appointment: { dayOffset: 0, time: "17:00", kind: "test_drive" } },
  { id: "lead-andres-torres", isDemo: true, name: "Andrés Torres", vehicleSlug: URUS, source: "google", status: "contactado", enteredMinutesAgo: 12 * H, lastInteraction: { label: "Consultó disponibilidad", minutesAgo: 9 * H }, followUp: { dayOffset: 0, time: "10:00", action: "follow_up" }, appointment: null },
  { id: "lead-paola-v", isDemo: true, name: "Paola V.", vehicleSlug: SUPRA, source: "instagram", status: "cita", enteredMinutesAgo: 2 * D, lastInteraction: { label: "Confirmó prueba de manejo", minutesAgo: 20 * H }, followUp: { dayOffset: 1, time: "10:00", action: "review" }, appointment: { dayOffset: 1, time: "11:00", kind: "test_drive" } },
  { id: "lead-hector-b", isDemo: true, name: "Héctor B.", vehicleSlug: SIERRA, source: "facebook", status: "cita", enteredMinutesAgo: 3 * D, lastInteraction: { label: "Confirmó prueba de manejo", minutesAgo: 26 * H }, followUp: { dayOffset: 2, time: "12:00", action: "review" }, appointment: { dayOffset: 3, time: "16:00", kind: "test_drive" } },
  { id: "lead-daniela-cruz", isDemo: true, name: "Daniela Cruz", vehicleSlug: URUS, source: "instagram", status: "contactado", enteredMinutesAgo: 2 * D, lastInteraction: { label: "Respondió por mensaje directo", minutesAgo: 28 * H }, followUp: null, appointment: null },
  { id: "lead-jorge-m", isDemo: true, name: "Jorge M.", vehicleSlug: K3, source: "web", status: "nuevo", enteredMinutesAgo: 40 * H, lastInteraction: { label: "Solicitó información", minutesAgo: 40 * H }, followUp: null, appointment: null },
  { id: "lead-sofia-l", isDemo: true, name: "Sofía L.", vehicleSlug: SWIFT, source: "whatsapp", status: "contactado", enteredMinutesAgo: 2 * D, lastInteraction: { label: "Preguntó por WhatsApp", minutesAgo: 36 * H }, followUp: { dayOffset: 1, time: "10:00", action: "follow_up" }, appointment: null },
  { id: "lead-valeria-n", isDemo: true, name: "Valeria N.", vehicleSlug: MACAN, source: "facebook", status: "negociacion", enteredMinutesAgo: 5 * D, lastInteraction: { label: "Pidió cotización", minutesAgo: 50 * H }, followUp: { dayOffset: 1, time: "12:00", action: "follow_up" }, appointment: null },
  { id: "lead-roberto-aguilar", isDemo: true, name: "Roberto Aguilar", vehicleSlug: AMG, source: "google", status: "seguimiento", enteredMinutesAgo: 6 * D, lastInteraction: { label: "Preguntó por financiamiento", minutesAgo: 60 * H }, followUp: { dayOffset: 2, time: "11:00", action: "follow_up" }, appointment: null },
  { id: "lead-ivan-p", isDemo: true, name: "Iván P.", vehicleSlug: SIERRA, source: "web", status: "nuevo", enteredMinutesAgo: 70 * H, lastInteraction: { label: "Solicitó información", minutesAgo: 70 * H }, followUp: null, appointment: null },
  { id: "lead-alejandra-t", isDemo: true, name: "Alejandra T.", vehicleSlug: X7, source: "instagram", status: "nuevo", enteredMinutesAgo: 18, lastInteraction: { label: "Escribió por Instagram", minutesAgo: 18 }, followUp: null, appointment: null },
];

export const demoActivity: ActivityItem[] = [
  { id: "act-1", isDemo: true, kind: "inquiry", vehicleSlug: X7, minutesAgo: 18, leadId: "lead-alejandra-t" },
  { id: "act-2", isDemo: true, kind: "share", vehicleSlug: URUS, minutesAgo: 47 },
  { id: "act-3", isDemo: true, kind: "test_drive", vehicleSlug: AMG, minutesAgo: 2 * H, leadId: "lead-fernando-g" },
  { id: "act-4", isDemo: true, kind: "favorite", vehicleSlug: SUPRA, minutesAgo: 3 * H },
  { id: "act-5", isDemo: true, kind: "inquiry", vehicleSlug: MACAN, minutesAgo: 4 * H, leadId: "lead-mariana-r" },
  { id: "act-6", isDemo: true, kind: "inquiry", vehicleSlug: X7, minutesAgo: 22 * H, leadId: "lead-carlos-mendoza" },
];

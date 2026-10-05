import type { ActivityItem, Lead } from "@/types/crm";

/**
 * CRM DEMO — personas, mensajes y tiempos FICTICIOS (isDemo: true), nunca datos reales de
 * Eurocars. Los vehículos referencian el inventario demo por slug: el dashboard, la actividad,
 * el insight y (Fase 5) el CRM y el resumen diario se derivan de ESTE mismo conjunto, para que
 * cuenten una sola historia. Cifras que se derivan de aquí: 14 prospectos de la semana,
 * 5 seguimientos pendientes (vencidos u hoy) y 3 pruebas de manejo agendadas.
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

export const demoLeads: Lead[] = [
  // — Pendientes de hoy (vencidos u hoy): 5 —
  { id: "lead-carlos-mendoza", isDemo: true, name: "Carlos Mendoza", vehicleSlug: X7, source: "whatsapp", status: "seguimiento", lastInteraction: { label: "Preguntó por WhatsApp", minutesAgo: 22 * H }, followUp: { state: "overdue", action: "follow_up" }, testDrive: null },
  { id: "lead-ricardo-salas", isDemo: true, name: "Ricardo Salas", vehicleSlug: X7, source: "web", status: "nuevo", lastInteraction: { label: "Solicitó información", minutesAgo: 31 * H }, followUp: { state: "today", action: "reply" }, testDrive: null },
  { id: "lead-mariana-r", isDemo: true, name: "Mariana R.", vehicleSlug: MACAN, source: "web", status: "nuevo", lastInteraction: { label: "Solicitó información", minutesAgo: 4 * H }, followUp: { state: "today", action: "reply" }, testDrive: null },
  { id: "lead-fernando-g", isDemo: true, name: "Fernando G.", vehicleSlug: AMG, source: "whatsapp", status: "cita", lastInteraction: { label: "Prueba de manejo pendiente", minutesAgo: 2 * H }, followUp: { state: "today", action: "review" }, testDrive: { state: "scheduled" } },
  { id: "lead-andres-torres", isDemo: true, name: "Andrés Torres", vehicleSlug: URUS, source: "google", status: "contactado", lastInteraction: { label: "Consultó disponibilidad", minutesAgo: 9 * H }, followUp: { state: "today", action: "follow_up" }, testDrive: null },
  // — Próximos / sin seguimiento inmediato —
  { id: "lead-paola-v", isDemo: true, name: "Paola V.", vehicleSlug: SUPRA, source: "instagram", status: "cita", lastInteraction: { label: "Confirmó prueba de manejo", minutesAgo: 20 * H }, followUp: { state: "upcoming", action: "review" }, testDrive: { state: "scheduled" } },
  { id: "lead-hector-b", isDemo: true, name: "Héctor B.", vehicleSlug: SIERRA, source: "facebook", status: "cita", lastInteraction: { label: "Confirmó prueba de manejo", minutesAgo: 26 * H }, followUp: { state: "upcoming", action: "review" }, testDrive: { state: "scheduled" } },
  { id: "lead-daniela-cruz", isDemo: true, name: "Daniela Cruz", vehicleSlug: URUS, source: "instagram", status: "contactado", lastInteraction: { label: "Respondió por mensaje directo", minutesAgo: 28 * H }, followUp: null, testDrive: null },
  { id: "lead-jorge-m", isDemo: true, name: "Jorge M.", vehicleSlug: K3, source: "web", status: "nuevo", lastInteraction: { label: "Solicitó información", minutesAgo: 40 * H }, followUp: null, testDrive: null },
  { id: "lead-sofia-l", isDemo: true, name: "Sofía L.", vehicleSlug: SWIFT, source: "whatsapp", status: "contactado", lastInteraction: { label: "Preguntó por WhatsApp", minutesAgo: 36 * H }, followUp: { state: "upcoming", action: "follow_up" }, testDrive: null },
  { id: "lead-valeria-n", isDemo: true, name: "Valeria N.", vehicleSlug: MACAN, source: "facebook", status: "negociacion", lastInteraction: { label: "Pidió cotización", minutesAgo: 50 * H }, followUp: { state: "upcoming", action: "follow_up" }, testDrive: null },
  { id: "lead-roberto-aguilar", isDemo: true, name: "Roberto Aguilar", vehicleSlug: AMG, source: "google", status: "seguimiento", lastInteraction: { label: "Preguntó por financiamiento", minutesAgo: 60 * H }, followUp: { state: "upcoming", action: "follow_up" }, testDrive: null },
  { id: "lead-ivan-p", isDemo: true, name: "Iván P.", vehicleSlug: SIERRA, source: "web", status: "nuevo", lastInteraction: { label: "Solicitó información", minutesAgo: 70 * H }, followUp: null, testDrive: null },
  { id: "lead-alejandra-t", isDemo: true, name: "Alejandra T.", vehicleSlug: X7, source: "instagram", status: "contactado", lastInteraction: { label: "Escribió por Instagram", minutesAgo: 18 }, followUp: null, testDrive: null },
];

export const demoActivity: ActivityItem[] = [
  { id: "act-1", isDemo: true, kind: "inquiry", vehicleSlug: X7, minutesAgo: 18, leadId: "lead-alejandra-t" },
  { id: "act-2", isDemo: true, kind: "share", vehicleSlug: URUS, minutesAgo: 47 },
  { id: "act-3", isDemo: true, kind: "test_drive", vehicleSlug: AMG, minutesAgo: 2 * H, leadId: "lead-fernando-g" },
  { id: "act-4", isDemo: true, kind: "favorite", vehicleSlug: SUPRA, minutesAgo: 3 * H },
  { id: "act-5", isDemo: true, kind: "inquiry", vehicleSlug: MACAN, minutesAgo: 4 * H, leadId: "lead-mariana-r" },
  { id: "act-6", isDemo: true, kind: "inquiry", vehicleSlug: X7, minutesAgo: 22 * H, leadId: "lead-carlos-mendoza" },
];

import type { ActivityItem, Lead } from "@/types/crm";
import { demoActivity, demoLeads } from "@/data/demo/crm";

/**
 * Servicio de CRM. La UI solo importa de aquí. Hoy lee el dataset demo; mañana, Supabase.
 * (Fase 3: solo lectura para el dashboard. La Fase 5 añade estados, timeline y seguimiento.)
 */
export async function getLeads(): Promise<Lead[]> {
  return demoLeads;
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  return [...demoActivity].sort((a, b) => a.minutesAgo - b.minutesAgo);
}

/** Seguimientos que requieren atención hoy: vencidos primero, luego los de hoy (más antiguos antes). */
export function pendingFollowUps(leads: Lead[]): Lead[] {
  const rank = { overdue: 0, today: 1, upcoming: 2 } as const;
  return leads
    .filter((l) => l.followUp && l.followUp.state !== "upcoming")
    .sort((a, b) => rank[a.followUp!.state] - rank[b.followUp!.state] || b.lastInteraction.minutesAgo - a.lastInteraction.minutesAgo);
}

export function summarizeLeads(leads: Lead[]) {
  return {
    newThisWeek: leads.length,
    pendingFollowUps: pendingFollowUps(leads).length,
    testDrivesScheduled: leads.filter((l) => l.testDrive?.state === "scheduled").length,
  };
}

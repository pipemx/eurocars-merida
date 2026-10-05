import type { ActivityItem, Lead } from "@/types/crm";
import { demoActivity, demoLeads } from "@/data/demo/crm";

/**
 * Servicio de CRM. La UI solo importa de aquí (y de ./rules, ./state). Hoy lee el dataset demo;
 * mañana, Supabase. Las reglas (prioridad, seguimientos, resumen) viven en ./rules y no cambian.
 */
export async function getLeads(): Promise<Lead[]> {
  return demoLeads;
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  return [...demoActivity].sort((a, b) => a.minutesAgo - b.minutesAgo);
}

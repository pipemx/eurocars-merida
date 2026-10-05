import type { InsightProvider } from "./types";

/**
 * Proveedor MOCK del insight: elige la unidad con más prospectos pendientes (desempate: más
 * actividad reciente). Reglas deterministas, sin IA. Sustituible por un proveedor de Gemini.
 */
export const mockInsightProvider: InsightProvider = {
  async getInventoryInsight({ leads, activityVehicleSlugs }) {
    const stats = new Map<string, { pending: string[]; activity: number }>();
    const entry = (slug: string) => {
      const s = stats.get(slug) ?? { pending: [], activity: 0 };
      stats.set(slug, s);
      return s;
    };
    for (const l of leads) if (l.pending) entry(l.slug).pending.push(l.id);
    for (const slug of activityVehicleSlugs) entry(slug).activity += 1;
    const best = [...stats.entries()].sort((a, b) => b[1].pending.length - a[1].pending.length || b[1].activity - a[1].activity)[0];
    if (!best || best[1].pending.length === 0) return null;
    return { isDemo: true, provider: "mock", kind: "rising_interest", vehicleSlug: best[0], relatedLeadIds: best[1].pending };
  },
};

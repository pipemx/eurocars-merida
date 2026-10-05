/** Insight del panel (preview). Hoy lo produce un proveedor mock; mañana, Gemini. */
export interface InventoryInsight {
  isDemo: true;
  provider: "mock" | "gemini";
  kind: "rising_interest";
  vehicleSlug: string;
  /** Prospectos que requieren seguimiento y se relacionan con la unidad. */
  relatedLeadIds: string[];
}

export interface InsightInput {
  leads: { id: string; slug: string; pending: boolean }[];
  activityVehicleSlugs: string[];
}

export interface InsightProvider {
  getInventoryInsight(input: InsightInput): Promise<InventoryInsight | null>;
}

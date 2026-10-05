import type { InsightProvider } from "./types";
import { mockInsightProvider } from "./mock-insights";

/** Punto único para obtener el proveedor de insights. Futuro: devolver el de Gemini. */
export function getInsightProvider(): InsightProvider {
  return mockInsightProvider;
}

export type { InventoryInsight, InsightInput, InsightProvider } from "./types";

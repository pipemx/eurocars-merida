import { AI_PROVIDER } from "./config";
import { ContentGuardError, auditContent, validateGeneratedContent } from "./content-guard";
import type { ContentGenerator } from "./content-types";
import { mockContentGenerator } from "./mock-content-generator";
import { mockInsightProvider } from "./mock-insights";
import type { InsightProvider } from "./types";

/** Punto único para obtener el proveedor de insights. Futuro: devolver el de Gemini. */
export function getInsightProvider(): InsightProvider {
  return mockInsightProvider;
}

function baseGenerator(): ContentGenerator {
  switch (AI_PROVIDER) {
    case "mock":
      return mockContentGenerator;
    default:
      throw new Error(`Proveedor de IA no configurado: ${AI_PROVIDER}`);
  }
}

/**
 * Generador de contenido que usa la UI. Envuelve al proveedor activo con dos controles que valen
 * igual para el mock y para Gemini: forma válida del JSON y cero datos inventados.
 */
export function getContentGenerator(): ContentGenerator {
  const base = baseGenerator();
  return {
    async generate(facts, options) {
      const content = await base.generate(facts, options);
      if (!validateGeneratedContent(content)) throw new Error("El proveedor devolvió contenido con formato inválido.");
      const problems = auditContent(content, facts);
      if (problems.length) throw new ContentGuardError(problems);
      return content;
    },
  };
}

export type { InventoryInsight, InsightInput, InsightProvider } from "./types";
export type { ContentFacts, ContentGenerator, ContentTone, GenerateOptions, GeneratedVehicleContent } from "./content-types";
export { CONTENT_TONES } from "./content-types";
export { auditContent, validateGeneratedContent, ContentGuardError } from "./content-guard";
export { factsKey, vehicleToFacts } from "./content-facts";

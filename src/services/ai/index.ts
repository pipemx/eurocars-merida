import { AI_PROVIDER } from "./config";
import { ContentGuardError, auditContent, validateGeneratedContent } from "./content-guard";
import type { ContentGenerator } from "./content-types";
import { mockContentGenerator } from "./mock-content-generator";
import { mockCrmAssistant, type CrmAssistant } from "./crm-assistant";

function baseGenerator(): ContentGenerator {
  switch (AI_PROVIDER) {
    case "mock":
      return mockContentGenerator;
    default:
      throw new Error(`Proveedor de IA no configurado: ${AI_PROVIDER}`);
  }
}

/** Asistente de CRM (sugerir respuesta / resumir conversación). Hoy mock; mañana Gemini, mismo contrato. */
export function getCrmAssistant(): CrmAssistant {
  switch (AI_PROVIDER) {
    case "mock":
      return mockCrmAssistant;
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

export type { CrmAssistant, CrmAssistContext } from "./crm-assistant";
export type { ContentFacts, ContentGenerator, ContentTone, GenerateOptions, GeneratedVehicleContent } from "./content-types";
export { CONTENT_TONES } from "./content-types";
export { auditContent, validateGeneratedContent, ContentGuardError } from "./content-guard";
export { factsKey, vehicleToFacts } from "./content-facts";

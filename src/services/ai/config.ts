/**
 * Configuración INTERNA del proveedor de IA (no usa variables de entorno ni claves).
 * Hoy: "mock" (plantillas locales). Mañana: "gemini" (se añadirá `geminiContentGenerator`, que
 * llamará a la API desde un servidor y devolverá JSON con la forma de GeneratedVehicleContent).
 * Equivale a AI_PROVIDER=mock.
 */
export type AiProviderId = "mock" | "gemini";

export const AI_PROVIDER: AiProviderId = "mock";

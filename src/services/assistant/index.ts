import { AI_PROVIDER } from "@/services/ai/config";
import { auditAssistantReply } from "./guard";
import { rulesProvider } from "./rules-provider";
import { emptyConversation, type AssistantContext, type SalesAssistantProvider } from "./types";

function baseProvider(): SalesAssistantProvider {
  switch (AI_PROVIDER) {
    case "mock":
      return rulesProvider;
    default:
      // Futuro: geminiSalesProvider (servidor) con el mismo contrato.
      throw new Error(`Proveedor de IA no configurado: ${AI_PROVIDER}`);
  }
}

/**
 * Proveedor que usa la UI. Envuelve al activo con el guard: si una respuesta cita vehículos inexistentes,
 * cifras sin respaldo o afirmaciones no verificables, se sustituye por un handoff honesto a un asesor.
 */
export function getSalesAssistant(): SalesAssistantProvider {
  const base = baseProvider();
  return {
    id: base.id,
    greet: (ctx) => base.greet(ctx),
    onVehicleChange: (ctx) => base.onVehicleChange(ctx),
    async respond(input, state, ctx: AssistantContext) {
      const reply = await base.respond(input, state, ctx);
      const problems = auditAssistantReply(reply, ctx, input);
      if (problems.length) {
        console.warn("[assistant] respuesta descartada por el guard:", problems);
        return { text: "No tengo ese dato confirmado en esta demostración, pero puedo dejar tu consulta para que un asesor de Eurocars te contacte.", handoff: true, state };
      }
      return reply;
    },
  };
}

export { emptyConversation };
export type { AssistantContext, AssistantReply, ConversationState, SalesAssistantProvider } from "./types";
export { vname, vfull } from "./rules-provider";

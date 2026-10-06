import type { Vehicle } from "@/types/vehicle";

/**
 * Contrato del asistente de ventas (Eurocars AI Sales Assistant).
 * UI ↔ estado de conversación ↔ motor de intención/recomendación ↔ proveedor.
 * Hoy el proveedor es un motor de reglas determinista (mock); mañana puede ser Gemini sin tocar la UI.
 */

/** Memoria mínima de la conversación (se serializa en sessionStorage). */
export interface ConversationState {
  /** Vehículos de la última respuesta (para "¿cuál es más barata?", "el primero"). */
  focus: string[];
  /** Todos los vehículos mostrados en la sesión. */
  shown: string[];
  /** Mensajes del usuario (para el resumen del prospecto). */
  userTexts: string[];
  /** Respuestas con contenido útil (recomendación, comparación, dato). */
  relevant: number;
  /** Ya se ofreció que un asesor contacte al usuario. */
  leadOffered: boolean;
}

export const emptyConversation: ConversationState = { focus: [], shown: [], userTexts: [], relevant: 0, leadOffered: false };

export interface AssistantContext {
  /** Inventario REAL (única fuente de datos que el asistente puede usar). */
  vehicles: Vehicle[];
  /** Vehículo que el usuario está viendo (ficha), si hay. */
  currentSlug: string | null;
}

export interface AssistantReply {
  text: string;
  /** Tarjetas de vehículos (máx. 3). */
  vehicles?: string[];
  /** Comparación compacta (2–3 vehículos). */
  comparison?: string[];
  /** El asistente reconoce que no tiene el dato y ofrece pasar con un asesor. */
  handoff?: boolean;
  /** Ofrecer "¿Quieres que un asesor te contacte?". */
  offerLead?: boolean;
  /** Abrir directamente el formulario de prospecto demo. */
  startLead?: boolean;
  /** Respuestas rápidas sugeridas. */
  chips?: string[];
  state: ConversationState;
}

export interface SalesAssistantProvider {
  readonly id: "rules" | "gemini";
  /** Mensaje de bienvenida y respuestas rápidas iniciales, calculados con el inventario. */
  greet(ctx: AssistantContext): { text: string; contextText?: string; chips: string[] };
  /** Aviso cuando el usuario cambia de ficha con el chat abierto. */
  onVehicleChange(ctx: AssistantContext): { text: string; chips: string[] } | null;
  respond(input: string, state: ConversationState, ctx: AssistantContext): Promise<AssistantReply>;
}

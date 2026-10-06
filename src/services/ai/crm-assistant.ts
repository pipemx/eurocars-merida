import { agoLong } from "@/lib/admin-format";
import { SOURCE_LABEL, STATUS_LABEL, dayLabel, followUpState } from "@/services/crm/rules";
import type { FollowUpAction, LeadSource, LeadStatus } from "@/types/crm";

/**
 * Asistencia IA del CRM (SIMULADA). Contrato estable para que Gemini lo sustituya sin tocar la UI.
 * El mock usa plantillas y SOLO datos del prospecto y de la unidad; no envía nada ni llama a ninguna API.
 */
export interface CrmAssistContext {
  name: string;
  /** "BMW X7 M60 Sport 2024" */
  vehicleFullName: string;
  /** Datos publicados de la unidad (null = desconocido: no se menciona). */
  price: number | null;
  mileage: number | null;
  source: LeadSource;
  status: LeadStatus;
  lastInteraction: { label: string; minutesAgo: number };
  followUp: { dayOffset: number; time: string; action: FollowUpAction } | null;
  appointment: { dayOffset: number; time: string; kind: "test_drive" | "visit" } | null;
  notesCount: number;
  /** Si el prospecto vino del asistente IA: resumen de su conversación. */
  aiSummary?: string[];
}

export interface CrmAssistant {
  suggestReply(ctx: CrmAssistContext, opts: { variant: number }): Promise<string>;
  summarizeConversation(ctx: CrmAssistContext): Promise<string[]>;
}

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const pick = <T,>(a: T[], v: number) => a[((v % a.length) + a.length) % a.length];
const firstName = (n: string) => n.split(/\s+/)[0];

/** "Datos publicados de la unidad: $1,549,000 MXN y 55,000 km." — solo lo que existe. */
function published(c: CrmAssistContext) {
  const bits = [c.price !== null ? `$${nf.format(c.price)} MXN` : null, c.mileage !== null ? `${nf.format(c.mileage)} km` : null].filter(Boolean);
  return bits.length ? ` Datos publicados de la unidad: ${bits.join(" y ")} (sujetos a confirmación).` : "";
}

export const mockCrmAssistant: CrmAssistant = {
  async suggestReply(c, { variant }) {
    const n = firstName(c.name);
    const v = c.vehicleFullName;
    const appt = c.appointment && c.appointment.dayOffset >= 0 ? c.appointment : null;
    if (appt && appt.dayOffset <= 2) {
      const kind = appt.kind === "test_drive" ? "prueba de manejo" : "visita";
      return pick(
        [
          `Hola ${n}, buen día. Te confirmamos tu ${kind} del ${v} ${dayLabel(appt.dayOffset)} a las ${appt.time}. ¿Nos confirmas tu asistencia?`,
          `Hola ${n}, te escribimos para recordarte tu ${kind} del ${v}, programada ${dayLabel(appt.dayOffset)} a las ${appt.time}. Si necesitas reprogramarla, avísanos con gusto.`,
        ],
        variant,
      );
    }
    if (c.status === "negociacion") {
      return pick(
        [
          `Hola ${n}, buen día. ¿Cómo vas con tu decisión sobre el ${v}? Si tienes dudas sobre la unidad o los siguientes pasos, con gusto te ayudamos.`,
          `Hola ${n}, quedamos pendientes con el ${v}. ¿Te gustaría que revisemos juntos los siguientes pasos?`,
        ],
        variant,
      );
    }
    if (c.followUp && followUpState(c.followUp.dayOffset) === "overdue") {
      return pick(
        [
          `Hola ${n}, buen día. Te contacto para dar seguimiento a tu interés en el ${v}. ¿Pudiste revisar la información que te compartimos? Con gusto resolvemos cualquier duda.${published(c)} ¿Te gustaría agendar una visita?`,
          `Hola ${n}, ¿cómo estás? Quedé pendiente de tu consulta sobre el ${v}. Si sigues interesado, con gusto te comparto fotos, detalles y opciones para visitarnos.${published(c)}`,
        ],
        variant,
      );
    }
    if (c.status === "nuevo" || c.lastInteraction.label.startsWith("Solicitó")) {
      return pick(
        [
          `Hola ${n}, gracias por tu interés en el ${v}. Con gusto te comparto la información disponible.${published(c)} ¿Te gustaría coordinar una visita?`,
          `Hola ${n}, qué gusto que te interese el ${v}. Estoy a tus órdenes para resolver tus dudas.${published(c)} ¿Cuándo te quedaría bien visitarnos?`,
        ],
        variant,
      );
    }
    return pick(
      [
        `Hola ${n}, buen día. Te escribo para saber si sigues interesado en el ${v}. Con gusto te apoyo con cualquier duda.${published(c)}`,
        `Hola ${n}, ¿cómo vas con el ${v}? Si necesitas más fotos o información, aquí estamos.`,
      ],
      variant,
    );
  },

  async summarizeConversation(c) {
    if (c.aiSummary?.length) return c.aiSummary;
    const lines = [`Prospecto interesado en ${c.vehicleFullName}.`, `Llegó por ${SOURCE_LABEL[c.source]}.`, `${c.lastInteraction.label}.`, `Última interacción ${agoLong(c.lastInteraction.minutesAgo).toLowerCase()}.`, `Estado: ${STATUS_LABEL[c.status]}.`];
    if (c.appointment && c.appointment.dayOffset >= 0) lines.push(`${c.appointment.kind === "test_drive" ? "Prueba de manejo" : "Visita"} ${dayLabel(c.appointment.dayOffset)} ${c.appointment.time}.`);
    if (c.followUp) {
      const st = followUpState(c.followUp.dayOffset);
      lines.push(st === "overdue" ? "Requiere seguimiento." : `Seguimiento programado ${dayLabel(c.followUp.dayOffset)} ${c.followUp.time}.`);
    } else lines.push("Sin seguimiento programado.");
    if (c.notesCount > 0) lines.push(`${c.notesCount} ${c.notesCount === 1 ? "nota registrada" : "notas registradas"}.`);
    return lines;
  },
};

/**
 * Modo demostración. Se calcula al compilar (next.config.ts):
 * - `NEXT_PUBLIC_DEMO_MODE=1|0` manda si está definida.
 * - Si no: ACTIVO en Preview y en local; INACTIVO solo cuando VERCEL_ENV === "production".
 *
 * En modo demo: ningún botón de WhatsApp abre el WhatsApp real de Eurocars (muestra un modal),
 * y los datos comerciales sin verificar (calificación, reseñas, horario, teléfono, condiciones
 * de crédito) no se muestran como si fueran reales.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

/** Prefijo del enlace neutralizado que sustituye a wa.me en modo demo. */
export const DEMO_WA_PREFIX = "#demo-whatsapp=";

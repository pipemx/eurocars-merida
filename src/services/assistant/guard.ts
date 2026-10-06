import { UNVERIFIED_CLAIMS } from "@/services/ai/content-guard";
import type { AssistantContext, AssistantReply } from "./types";

/**
 * Guard del asistente (vale igual para el motor de reglas y para un futuro proveedor Gemini):
 * - los vehículos citados deben existir en el inventario;
 * - toda cifra del texto debe provenir del inventario, del mensaje del usuario o ser un conteo pequeño;
 * - ninguna afirmación comercial/técnica (garantía, HP, financiamiento…) si no existe como dato.
 */
export function auditAssistantReply(reply: AssistantReply, ctx: AssistantContext, userText: string): string[] {
  const problems: string[] = [];
  const known = new Set(ctx.vehicles.map((v) => v.slug));
  for (const slug of [...(reply.vehicles ?? []), ...(reply.comparison ?? [])]) if (!known.has(slug)) problems.push(`Vehículo inexistente: ${slug}`);

  const dataset = JSON.stringify(ctx.vehicles.map((v) => [v.brand, v.model, v.version, v.year, v.price, v.mileage, v.engine, v.transmission, v.drivetrain, v.exteriorColor, v.features.es, v.status]));
  const allowed = new Set<string>([...(dataset.match(/\d+/g) ?? []), ...(userText.match(/\d+/g) ?? [])]);
  // "$1,549,000" cuenta como 1549000 (se quitan las comas de millares antes de comparar cifras)
  const budgetEcho = /(millon|millones|\bmil\b|\d\s?k\b|\d{4,})/.test(userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const plain = reply.text.replace(/(\d),(?=\d{3}(?!\d))/g, "$1");
  for (const n of plain.match(/\d+/g) ?? []) {
    // Eco del presupuesto que el usuario escribió ("hasta 1 millón" → $1,000,000)
    if (budgetEcho && Number(n) >= 1000 && Number(n) % 1000 === 0) continue;
    if (/^0+$/.test(n) || Number(n) <= 10 || allowed.has(n)) continue;
    problems.push(`Cifra no respaldada: ${n}`);
  }

  const lower = reply.text.toLowerCase();
  const evidence = (dataset + " " + userText).toLowerCase();
  for (const claim of UNVERIFIED_CLAIMS) {
    const c = claim.trim();
    if (lower.includes(c) && !evidence.includes(c)) {
      // Decir que NO se tiene el dato (p. ej. "No tengo información confirmada sobre garantía") es correcto.
      if (/(no tengo|no cuento|no hay)/.test(lower) && ["garantia", "garantía", "financiamiento", "crédito", "credito", "enganche"].includes(c)) continue;
      problems.push(`Afirmación no verificable: "${c}"`);
    }
  }
  return problems;
}

import { site } from "@/content/site";
import { DEMO_MODE, DEMO_WA_PREFIX } from "@/lib/demo-mode";
import type { Vehicle } from "@/types/vehicle";

/**
 * Enlace de WhatsApp hacia Eurocars. En modo demo NUNCA apunta al número real: devuelve un ancla
 * neutra (#demo-whatsapp=<mensaje>) que DemoWhatsApp intercepta para mostrar un modal.
 */
export function whatsappHref(message: string): string {
  if (DEMO_MODE) return `${DEMO_WA_PREFIX}${encodeURIComponent(message)}`;
  return `https://wa.me/${site.whatsapp.e164}?text=${encodeURIComponent(message)}`;
}

/** "2022 Lamborghini Huracán STO" — orden pedido para el mensaje de WhatsApp. */
export function vehicleName(v: Pick<Vehicle, "brand" | "model" | "version" | "year">, withYear = true) {
  return [withYear ? v.year : null, v.brand, v.model, v.version].filter(Boolean).join(" ");
}

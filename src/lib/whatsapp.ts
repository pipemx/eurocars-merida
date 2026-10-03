import { site } from "@/content/site";
import type { Vehicle } from "@/types/vehicle";

export function whatsappHref(message: string): string {
  return `https://wa.me/${site.whatsapp.e164}?text=${encodeURIComponent(message)}`;
}

/** "2022 Lamborghini Huracán STO" — orden pedido para el mensaje de WhatsApp. */
export function vehicleName(v: Pick<Vehicle, "brand" | "model" | "version" | "year">, withYear = true) {
  return [withYear ? v.year : null, v.brand, v.model, v.version].filter(Boolean).join(" ");
}

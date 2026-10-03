import { site } from "@/content/site";
import type { Vehicle } from "@/types/vehicle";

export type WhatsAppContext =
  | { kind: "general" }
  | { kind: "vehicle"; vehicle: Pick<Vehicle, "brand" | "model" | "year" | "version"> }
  | { kind: "financing" }
  | { kind: "sell" };

export function whatsappMessage(ctx: WhatsAppContext): string {
  switch (ctx.kind) {
    case "vehicle": {
      const v = ctx.vehicle;
      const name = [v.brand, v.model, v.version, v.year].filter(Boolean).join(" ");
      return `Hola Eurocars, vi el ${name} en su página y quisiera más información.`;
    }
    case "financing":
      return "Hola Eurocars, quisiera información sobre opciones de financiamiento.";
    case "sell":
      return "Hola Eurocars, quisiera información para vender o consignar mi vehículo.";
    default:
      return "Hola Eurocars, quisiera más información.";
  }
}

export function whatsappHref(ctx: WhatsAppContext = { kind: "general" }): string {
  return `https://wa.me/${site.whatsapp.e164}?text=${encodeURIComponent(whatsappMessage(ctx))}`;
}

import type { Vehicle } from "@/types/vehicle";

/** Filtros del inventario (clasificación editorial de la demo). */
export const categories = ["todos", "exoticos", "premium", "suv", "deportivos", "pickups", "compactos"] as const;
export type CategoryId = (typeof categories)[number];

/** Tracción en el idioma pedido (guardada como "es|en"). null si no está verificada. */
export function drivetrainLabel(v: Vehicle, locale: "es" | "en") {
  if (!v.drivetrain) return null;
  const [es, en] = v.drivetrain.split("|");
  return locale === "es" ? es : en ?? es;
}

import type { Vehicle } from "@/types/vehicle";

/** "Hace 18 min" / "Hace 22 horas" / "Hace 3 días". */
export function agoLong(minutes: number) {
  if (minutes < 60) return `Hace ${Math.max(1, Math.round(minutes))} min`;
  const h = Math.round(minutes / 60);
  if (h < 24) return `Hace ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.round(h / 24);
  return `Hace ${d} ${d === 1 ? "día" : "días"}`;
}

/** "Hace 18 min" / "Hace 2 h" / "Hace 3 d". */
export function agoShort(minutes: number) {
  if (minutes < 60) return `Hace ${Math.max(1, Math.round(minutes))} min`;
  const h = Math.round(minutes / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.round(h / 24)} d`;
}

const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-10-05" → "5 oct 2026". */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${months[m - 1]} ${y}`;
}

export function initials(name: string) {
  const parts = name.replace(/\./g, "").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** "BMW X7 M60 Sport" (sin año). */
export function vehicleTitle(v: Pick<Vehicle, "brand" | "model" | "version">) {
  return [v.brand, v.model, v.version].filter(Boolean).join(" ");
}

export const statusLabel: Record<Vehicle["status"], string> = { available: "Disponible", reserved: "Apartado", sold: "Vendido" };

export const categoryLabel: Record<Vehicle["category"][number], string> = {
  exoticos: "Exóticos",
  premium: "Premium",
  suv: "SUV",
  deportivos: "Deportivos",
  pickups: "Pickups",
  compactos: "Compactos",
};

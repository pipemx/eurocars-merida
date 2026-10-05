import type { Vehicle } from "@/types/vehicle";
import { demoVehicles } from "@/data/demo/vehicles";

/**
 * Servicio de inventario. La UI solo importa de aquí (nunca de `data/`).
 * Hoy lee el dataset demo; mañana se sustituye por Supabase sin cambiar a quien lo llama.
 * Por eso las funciones son asíncronas aunque hoy resuelvan al instante.
 */
export async function getVehicles(): Promise<Vehicle[]> {
  return demoVehicles;
}

export async function getFeaturedVehicles(): Promise<Vehicle[]> {
  return (await getVehicles()).filter((v) => v.featured);
}

export async function getVehicle(slug: string): Promise<Vehicle | undefined> {
  return (await getVehicles()).find((v) => v.slug === slug);
}

/** Relacionados: primero los que comparten categoría, luego el resto. */
export async function getRelatedVehicles(v: Vehicle, limit = 3): Promise<Vehicle[]> {
  const others = (await getVehicles()).filter((x) => x.id !== v.id);
  const same = others.filter((x) => x.category.some((c) => v.category.includes(c)));
  return [...same, ...others.filter((x) => !same.includes(x))].slice(0, limit);
}

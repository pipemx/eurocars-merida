export type VehicleStatus = "available" | "reserved" | "sold";

/**
 * Clasificación EDITORIAL de la demo (para filtrar y navegar). No es una especificación
 * técnica oficial del fabricante ni un dato verificado de la unidad.
 */
export type VehicleCategory = "exoticos" | "premium" | "suv" | "deportivos" | "pickups" | "compactos";

export interface VehicleImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  status: VehicleStatus;
  brand: string;
  model: string;
  version: string;
  year: number;
  /** MXN. null = "precio a consultar" */
  price: number | null;
  /** km. null = "kilometraje a consultar" */
  mileage: number | null;
  transmission: string | null;
  engine: string | null;
  /** "es|en" (ver drivetrainLabel) o null si no está verificado. */
  drivetrain: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  /** Texto por idioma. Nunca debe afirmar datos no verificados. */
  description: { es: string; en: string };
  /** Solo características verificadas. Vacío = no se muestra el bloque. */
  features: { es: string[]; en: string[] };
  /** Vacío = fotografía pendiente (VehiclePhoto muestra el placeholder). */
  gallery: VehicleImage[];
  financingAvailable: boolean;
  featured: boolean;
  category: VehicleCategory[];
  createdAt: string;
  updatedAt: string;
  /** true mientras el registro sea de demostración y no inventario real verificado. */
  isPlaceholder?: boolean;
  /** Marca interna: registro de la demo (dataset demo o agregado desde el panel), nunca inventario real. */
  isDemo?: boolean;
}

export type VehicleStatus = "available" | "reserved" | "sold";

export type VehicleCategory =
  | "exoticos"
  | "premium"
  | "suv"
  | "pickups"
  | "electricos"
  | "familiares"
  | "compactos";

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
  /** km */
  mileage: number | null;
  transmission: string | null;
  engine: string | null;
  drivetrain: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  description: string;
  features: string[];
  coverImage: VehicleImage;
  gallery: VehicleImage[];
  financingAvailable: boolean;
  featured: boolean;
  category: VehicleCategory[];
  createdAt: string;
  updatedAt: string;
  /** true mientras el registro sea de ejemplo y no inventario real verificado. */
  isPlaceholder?: boolean;
}

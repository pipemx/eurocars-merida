import type { Vehicle, VehicleCategory } from "@/types/vehicle";

/**
 * INVENTARIO DE EJEMPLO — NO ES INVENTARIO REAL DE EUROCARS.
 * Marca/modelo solo ilustran longitudes de texto para la dirección visual.
 * Precio y kilometraje se muestran como "X" (isPlaceholder) y las fotos son fondos neutros.
 * Sustituir por el inventario real (JSON / Supabase / CMS) antes de publicar.
 */
const ph = (n: number, label: string) => ({
  src: `/eurocars/vehicles/placeholder-${n}.webp`,
  alt: `Fotografía pendiente — ${label}`,
  width: 1600,
  height: 1067,
});

type Seed = [string, string, string, number, VehicleCategory[], string, string];

const seeds: Seed[] = [
  ["Lamborghini", "Urus", "Performante", 2024, ["exoticos", "suv"], "Automática", "V8 4.0 L biturbo"],
  ["Porsche", "911", "Carrera S", 2023, ["exoticos", "premium"], "PDK", "6 cil. bóxer 3.0 L biturbo"],
  ["Mercedes-Benz", "Clase G", "G 500", 2022, ["premium", "suv"], "Automática", "V8 4.0 L biturbo"],
  ["BMW", "M4", "Competition", 2023, ["premium"], "Automática", "6 cil. 3.0 L biturbo"],
  ["Porsche", "Taycan", "4S", 2022, ["premium", "electricos"], "Automática", "Eléctrico"],
  ["Ram", "1500", "TRX", 2023, ["pickups"], "Automática", "V8 6.2 L supercargado"],
];

export const vehicles: Vehicle[] = seeds.map(([brand, model, version, year, category, transmission, engine], i) => ({
  id: `ejemplo-${i + 1}`,
  slug: `${brand}-${model}-${version}-${year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  status: "available",
  brand,
  model,
  version,
  year,
  price: null,
  mileage: null,
  transmission,
  engine,
  drivetrain: null,
  exteriorColor: null,
  interiorColor: null,
  description: "",
  features: [],
  coverImage: ph(i + 1, `${brand} ${model} ${version}`),
  gallery: [],
  financingAvailable: false,
  featured: true,
  category,
  createdAt: "2026-10-03",
  updatedAt: "2026-10-03",
  isPlaceholder: true,
}));

export const categories: { id: "todos" | VehicleCategory; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "exoticos", label: "Exóticos" },
  { id: "premium", label: "Premium" },
  { id: "suv", label: "SUV" },
  { id: "pickups", label: "Pickups" },
  { id: "electricos", label: "Eléctricos" },
  { id: "familiares", label: "Familiares" },
  { id: "compactos", label: "Compactos" },
];

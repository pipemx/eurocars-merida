import type { Vehicle, VehicleCategory } from "@/types/vehicle";

/**
 * INVENTARIO DEL MOCKUP — datos e imágenes del diseño de referencia, NO verificados como
 * inventario real de Eurocars. Sustituir por inventario real (JSON / Supabase / CMS).
 */
type Seed = {
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number | null;
  mileage: number | null;
  image: string;
  category: VehicleCategory[];
};

const seeds: Seed[] = [
  { brand: "Lamborghini", model: "Aventador", version: "", year: 2021, price: null, mileage: null, image: "mockup-lambo-negro", category: ["exoticos"] },
  { brand: "Lamborghini", model: "Huracán", version: "STO", year: 2022, price: 8950000, mileage: 8400, image: "mockup-huracan-sto", category: ["exoticos"] },
  { brand: "Porsche", model: "Macan", version: "", year: 2021, price: 1250000, mileage: 42000, image: "mockup-macan", category: ["premium", "suv"] },
  { brand: "BMW", model: "X4", version: "M Sport", year: 2020, price: 990000, mileage: 45000, image: "mockup-x4-m-sport", category: ["premium", "suv"] },
  { brand: "Ford", model: "Raptor", version: "", year: 2022, price: 1590000, mileage: 38000, image: "mockup-raptor", category: ["pickups"] },
  { brand: "Mercedes-Benz", model: "Clase G", version: "", year: 2023, price: null, mileage: null, image: "mockup-g-class", category: ["premium", "suv"] },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const vehicles: Vehicle[] = seeds.map((s, i) => {
  const title = [s.brand, s.model, s.version].filter(Boolean).join(" ");
  const img = { src: `/eurocars/vehicles/${s.image}.webp`, alt: `${title} ${s.year} en el showroom de Eurocars Mérida`, width: 600, height: 414 };
  return {
    id: `mockup-${i + 1}`,
    slug: slugify(`${title} ${s.year}`),
    status: "available",
    brand: s.brand,
    model: s.model,
    version: s.version,
    year: s.year,
    price: s.price,
    mileage: s.mileage,
    transmission: "Automático",
    engine: null,
    drivetrain: null,
    exteriorColor: null,
    interiorColor: null,
    description: "",
    features: [],
    coverImage: img,
    gallery: [img],
    financingAvailable: false,
    featured: true,
    category: s.category,
    createdAt: "2026-10-03",
    updatedAt: "2026-10-03",
    isPlaceholder: true,
  };
});

export const categories: { id: "todos" | VehicleCategory; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "exoticos", label: "Exóticos" },
  { id: "premium", label: "Premium" },
  { id: "suv", label: "SUVs" },
  { id: "pickups", label: "Pickups" },
  { id: "electricos", label: "Eléctricos" },
];

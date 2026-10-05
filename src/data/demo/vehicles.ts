import type { Vehicle, VehicleCategory } from "@/types/vehicle";

/**
 * INVENTARIO DEMO — EUROCARS AI.
 *
 * Los 8 modelos corresponden a unidades que aparecen en el inventario público de Eurocars
 * (marca, modelo, versión y año). TODO lo demás es desconocido y se deja en `null`:
 * precio, kilometraje, motor, transmisión, tracción, color y equipamiento. No inferir datos
 * mecánicos por el modelo. Completar aquí (o en la DB futura) cuando Eurocars los confirme.
 *
 * `category` es una clasificación editorial de la demo, no una especificación oficial.
 * Sin fotografías: `gallery` vacío => la UI muestra el placeholder "Fotografía pendiente".
 */
type Seed = {
  brand: string;
  model: string;
  version: string;
  year: number;
  category: VehicleCategory[];
};

const seeds: Seed[] = [
  { brand: "Lamborghini", model: "Urus", version: "Performante", year: 2024, category: ["exoticos", "suv"] },
  { brand: "BMW", model: "X7", version: "M60 Sport", year: 2024, category: ["premium", "suv"] },
  { brand: "Mercedes-Benz", model: "AMG GT", version: "", year: 2020, category: ["deportivos", "premium"] },
  { brand: "Toyota", model: "Supra", version: "GR", year: 2020, category: ["deportivos"] },
  { brand: "Porsche", model: "Macan", version: "S", year: 2019, category: ["premium", "suv"] },
  { brand: "GMC", model: "Sierra", version: "Denali", year: 2025, category: ["pickups"] },
  { brand: "Kia", model: "K3", version: "L Aut.", year: 2024, category: ["compactos"] },
  { brand: "Suzuki", model: "Swift", version: "GLS", year: 2018, category: ["compactos"] },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const demoVehicles: Vehicle[] = seeds.map((s, i) => {
  const title = [s.brand, s.model, s.version].filter(Boolean).join(" ");
  return {
    id: `demo-${i + 1}`,
    slug: slugify(`${title} ${s.year}`),
    status: "available",
    brand: s.brand,
    model: s.model,
    version: s.version,
    year: s.year,
    price: null,
    mileage: null,
    transmission: null,
    engine: null,
    drivetrain: null,
    exteriorColor: null,
    interiorColor: null,
    description: {
      es: `${title} ${s.year}, del inventario de Eurocars Mérida. Pregúntanos por precio, kilometraje, historial y fotografías de esta unidad.`,
      en: `${s.year} ${title}, from the Eurocars Mérida inventory. Ask us about price, mileage, history and photos of this unit.`,
    },
    features: { es: [], en: [] },
    gallery: [],
    financingAvailable: false,
    featured: true,
    category: s.category,
    createdAt: "2026-10-05",
    updatedAt: "2026-10-05",
    isPlaceholder: true,
    isDemo: true,
  };
});

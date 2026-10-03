import type { Vehicle, VehicleCategory, VehicleImage } from "@/types/vehicle";

/**
 * INVENTARIO DEMO — unidades, precios y kilometrajes del mockup de referencia; NO es
 * inventario real verificado de Eurocars. Motor/tracción corresponden a la configuración
 * de serie del modelo y deben confirmarse por unidad. Sustituir por inventario real (CMS/DB).
 */
type Seed = {
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number | null;
  mileage: number | null;
  engine: string | null;
  drivetrain: { es: string; en: string } | null;
  images: { src: string; w: number; h: number }[];
  category: VehicleCategory[];
  description: { es: string; en: string };
  features: { es: string[]; en: string[] };
};

const img = (name: string, w = 800, h = 552) => ({ src: `/eurocars/vehicles/${name}.webp`, w, h });
const showroom = { src: "/eurocars/showroom/mockup-hero-showroom.webp", w: 2308, h: 1428 };

const seeds: Seed[] = [
  {
    brand: "Lamborghini",
    model: "Aventador",
    version: "",
    year: 2021,
    price: null,
    mileage: null,
    engine: "V12 6.5 L",
    drivetrain: { es: "Integral (AWD)", en: "All-wheel drive" },
    images: [img("mockup-lambo-negro", 1760, 592), showroom],
    category: ["exoticos"],
    description: {
      es: "Presencia absoluta en negro. Una unidad para quien no busca pasar desapercibido.",
      en: "Absolute presence in black. A car for those who never go unnoticed.",
    },
    features: { es: ["Motor V12 atmosférico", "Tracción integral", "Rines negros con cálipers naranjas"], en: ["Naturally aspirated V12", "All-wheel drive", "Black wheels with orange calipers"] },
  },
  {
    brand: "Lamborghini",
    model: "Huracán",
    version: "STO",
    year: 2022,
    price: 8950000,
    mileage: 8400,
    engine: "V10 5.2 L",
    drivetrain: { es: "Trasera (RWD)", en: "Rear-wheel drive" },
    images: [img("mockup-huracan-sto")],
    category: ["exoticos"],
    description: {
      es: "La versión más radical del Huracán, derivada de competencia y homologada para calle.",
      en: "The most radical Huracán, born from racing and homologated for the road.",
    },
    features: { es: ["Aerodinámica derivada de competencia", "Motor V10 atmosférico", "Tracción trasera"], en: ["Race-derived aerodynamics", "Naturally aspirated V10", "Rear-wheel drive"] },
  },
  {
    brand: "Porsche",
    model: "Macan",
    version: "",
    year: 2021,
    price: 1250000,
    mileage: 42000,
    engine: "2.0 L turbo",
    drivetrain: { es: "Integral (AWD)", en: "All-wheel drive" },
    images: [img("mockup-macan")],
    category: ["premium", "suv", "familiares"],
    description: {
      es: "El SUV compacto con alma deportiva. Práctico a diario, preciso en carretera.",
      en: "The compact SUV with a sports-car soul. Practical every day, precise on the road.",
    },
    features: { es: ["Transmisión PDK", "Tracción integral", "Interior en piel"], en: ["PDK transmission", "All-wheel drive", "Leather interior"] },
  },
  {
    brand: "BMW",
    model: "X4",
    version: "M Sport",
    year: 2020,
    price: 990000,
    mileage: 45000,
    engine: "2.0 L turbo",
    drivetrain: { es: "Integral (xDrive)", en: "All-wheel drive (xDrive)" },
    images: [img("mockup-x4-m-sport")],
    category: ["premium", "suv"],
    description: {
      es: "Silueta coupé, paquete M Sport y tracción xDrive para cualquier camino.",
      en: "Coupé silhouette, M Sport package and xDrive for any road.",
    },
    features: { es: ["Paquete M Sport", "Tracción xDrive", "Faros LED"], en: ["M Sport package", "xDrive all-wheel drive", "LED headlights"] },
  },
  {
    brand: "Ford",
    model: "Raptor",
    version: "",
    year: 2022,
    price: 1590000,
    mileage: 38000,
    engine: "V6 3.5 L EcoBoost",
    drivetrain: { es: "4x4", en: "4x4" },
    images: [img("mockup-raptor")],
    category: ["pickups"],
    description: {
      es: "La pickup de alto desempeño para el terreno que elijas.",
      en: "The high-performance pickup for whatever terrain you choose.",
    },
    features: { es: ["Suspensión de alto desempeño", "Tracción 4x4", "Motor EcoBoost biturbo"], en: ["High-performance suspension", "4x4", "Twin-turbo EcoBoost engine"] },
  },
  {
    brand: "Mercedes-Benz",
    model: "Clase G",
    version: "",
    year: 2023,
    price: null,
    mileage: null,
    engine: null,
    drivetrain: { es: "4x4", en: "4x4" },
    images: [img("mockup-g-class", 1176, 528), showroom],
    category: ["premium", "suv"],
    description: {
      es: "Un ícono que no necesita presentación. Disponible para valoración en showroom.",
      en: "An icon that needs no introduction. Available to view at the showroom.",
    },
    features: { es: ["Tracción 4x4 permanente", "Tres bloqueos de diferencial"], en: ["Permanent 4x4", "Three differential locks"] },
  },
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
  const gallery: VehicleImage[] = s.images.map((im, n) => ({
    src: im.src,
    alt: `${title} ${s.year}${n ? ` — ${n + 1}` : ""}`,
    width: im.w,
    height: im.h,
  }));
  return {
    id: `demo-${i + 1}`,
    slug: slugify(`${title} ${s.year}`),
    status: "available",
    brand: s.brand,
    model: s.model,
    version: s.version,
    year: s.year,
    price: s.price,
    mileage: s.mileage,
    transmission: "automatic",
    engine: s.engine,
    drivetrain: s.drivetrain ? s.drivetrain.es + "|" + s.drivetrain.en : null,
    exteriorColor: null,
    interiorColor: null,
    description: s.description,
    features: s.features,
    coverImage: gallery[0],
    gallery,
    financingAvailable: true,
    featured: true,
    category: s.category,
    createdAt: "2026-10-03",
    updatedAt: "2026-10-03",
    isPlaceholder: true,
  };
});

export function getVehicle(slug: string) {
  return vehicles.find((v) => v.slug === slug);
}

/** Tracción en el idioma pedido (guardada como "es|en"). */
export function drivetrainLabel(v: Vehicle, locale: "es" | "en") {
  if (!v.drivetrain) return null;
  const [es, en] = v.drivetrain.split("|");
  return locale === "es" ? es : en ?? es;
}

export const categories = ["todos", "exoticos", "premium", "suv", "pickups", "electricos", "familiares", "compactos"] as const;
export type CategoryId = (typeof categories)[number];

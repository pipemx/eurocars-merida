import type { Vehicle, VehicleCategory, VehicleImage } from "@/types/vehicle";
import manifest from "./inventory-manifest.json";

/**
 * INVENTARIO DEMO — EUROCARS AI.
 *
 * Datos y fotografías tomados del inventario PÚBLICO de eurocarsmerida.com (endpoint /api/vehicles que
 * carga la propia página; ver scripts/import-public-inventory.mjs). Solo se incorpora lo que la
 * publicación declara; lo que no aparece queda en `null` (color, tracción, transmisión…). No se
 * infiere nada por el modelo. Textos de equipamiento: transcripción fiel de la publicación (ES) y su
 * traducción (EN). Los precios y kilometrajes son los publicados y están sujetos a confirmación.
 *
 * No se transcriben condiciones de crédito, "no checamos buró", ni teléfonos.
 * `category` es una clasificación editorial de la demo, no una especificación oficial.
 */
type Seed = {
  /** Carpeta en public/eurocars/inventory/ y clave en inventory-manifest.json */
  folder: keyof typeof manifest;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number | null;
  mileage: number | null;
  engine: string | null;
  transmission: string | null;
  drivetrain: { es: string; en: string } | null;
  color: string | null;
  category: VehicleCategory[];
  description: { es: string; en: string };
  features: { es: string[]; en: string[] };
};

const seeds: Seed[] = [
  {
    folder: "lamborghini-urus-performante-2024",
    brand: "Lamborghini",
    model: "Urus",
    version: "Performante",
    year: 2024,
    price: 8499000,
    mileage: 7000,
    engine: "V8 4.0L turbo con 666 hP",
    transmission: null,
    drivetrain: null,
    color: null,
    category: ["exoticos", "suv"],
    description: {
      es: "Lamborghini Urus Performante 2024, unidad de un dueño con escape Akrapovic, interior Alcántara / piel y sonido Bang & Olufsen de 21 altavoces 3D.",
      en: "2024 Lamborghini Urus Performante, a one-owner unit with Akrapovic exhaust, Alcántara / leather interior and a 21-speaker 3D Bang & Olufsen sound system.",
    },
    features: {
      es: ["Escape Akrapovic", "Techo panorámico", "Insertos de fibra de carbono", "Interior Alcántara / piel", "Luz ambiental", "Sonido Bang & Olufsen de 21 altavoces 3D", "Rines 23\"", "1 dueño", "Yucateca"],
      en: ["Akrapovic exhaust", "Panoramic roof", "Carbon fiber inserts", "Alcántara / leather interior", "Ambient lighting", "21-speaker 3D Bang & Olufsen sound", "23\" wheels", "1 owner", "Yucatán unit"],
    },
  },
  {
    folder: "bmw-x7-m60-sport-2024",
    brand: "BMW",
    model: "X7",
    version: "M60 Sport",
    year: 2024,
    price: 1549000,
    mileage: 55000,
    engine: "8 cilindros 4.4L turbo",
    transmission: null,
    drivetrain: { es: "Integral (xDrive)", en: "All-wheel drive (xDrive)" },
    color: null,
    category: ["premium", "suv"],
    description: {
      es: "BMW X7 M60 Sport 2024 con motor de 8 cilindros 4.4L turbo y tracción integral xDrive. Techo panorámico, 7 pasajeros y pantalla con cámara 360. Factura de agencia local y servicios al día.",
      en: "2024 BMW X7 M60 Sport with a 4.4L turbo 8-cylinder engine and xDrive all-wheel drive. Panoramic roof, 7 passengers and a screen with 360 camera. Local dealer invoice and up-to-date services.",
    },
    features: {
      es: ["Techo panorámico", "7 pasajeros", "Pantalla con cámara 360", "Apple CarPlay", "Placas yucatecas 2026", "Factura de agencia local", "Servicios al día", "Iluminación full LED y ambiental"],
      en: ["Panoramic roof", "7 passengers", "Screen with 360 camera", "Apple CarPlay", "2026 Yucatán plates", "Local dealer invoice", "Up-to-date services", "Full LED and ambient lighting"],
    },
  },
  {
    folder: "mercedes-amg-gt-2020",
    brand: "Mercedes-Benz",
    model: "AMG GT",
    version: "",
    year: 2020,
    price: 2649000,
    mileage: 22000,
    engine: "AMG V8 de 4.0 litros biturbo",
    transmission: null,
    drivetrain: null,
    color: null,
    category: ["deportivos", "premium"],
    description: {
      es: "Mercedes-Benz AMG GT 2020 con motor AMG V8 de 4.0 litros biturbo, asientos de piel, rines progresivos de 20\" y 21\" y pantalla táctil de 8 pulgadas compatible con Android Auto y Apple CarPlay. 2 dueños.",
      en: "2020 Mercedes-Benz AMG GT with an AMG 4.0-litre twin-turbo V8, leather seats, progressive 20\" and 21\" wheels and an 8-inch touchscreen compatible with Android Auto and Apple CarPlay. 2 owners.",
    },
    features: {
      es: ["Nueva pantalla táctil de 8 pulgadas compatible con Android Auto y Apple CarPlay", "Asientos de piel", "Rines de 20\" y 21\" progresivos", "2 dueños", "Filtro de alto flujo y caja de filtro en fibra de carbono", "Iluminación full LED"],
      en: ["New 8-inch touchscreen compatible with Android Auto and Apple CarPlay", "Leather seats", "Progressive 20\" and 21\" wheels", "2 owners", "High-flow filter and carbon fiber filter box", "Full LED lighting"],
    },
  },
  {
    folder: "toyota-supra-gr-2020",
    brand: "Toyota",
    model: "Supra",
    version: "GR",
    year: 2020,
    price: 1299000,
    mileage: 15000,
    engine: "6 cilindros 3.0 turbo",
    transmission: "Automática",
    drivetrain: { es: "Trasera", en: "Rear-wheel drive" },
    color: "Amarillo (Nitro Yellow)",
    category: ["deportivos"],
    description: {
      es: "Toyota Supra GR 2020 en su color original Amarillo (Nitro Yellow), con motor de 6 cilindros 3.0 turbo, transmisión automática y tracción trasera. Refacturado de empresa; incluye extras: Repro Stage 2 y downpipe.",
      en: "2020 Toyota Supra GR in its original Nitro Yellow, with a 3.0 turbo 6-cylinder engine, automatic transmission and rear-wheel drive. Company re-invoiced; includes extras: Stage 2 reprogramming and downpipe.",
    },
    features: {
      es: ["Color original Amarillo (Nitro Yellow)", "Refacturado de empresa", "Placas nuevas 2026 Yucatán", "Extras: Repro Stage 2", "Downpipe"],
      en: ["Original Nitro Yellow color", "Company re-invoiced", "New 2026 Yucatán plates", "Extras: Stage 2 reprogramming", "Downpipe"],
    },
  },
  {
    folder: "porsche-macan-s-2019",
    brand: "Porsche",
    model: "Macan",
    version: "S",
    year: 2019,
    price: 949000,
    mileage: 92400,
    engine: "V6 3.0L turbo",
    transmission: null,
    drivetrain: { es: "Integral", en: "All-wheel drive" },
    color: null,
    category: ["premium", "suv"],
    description: {
      es: "Porsche Macan S 2019 con motor V6 3.0L turbo y tracción integral. Techo panorámico, asientos en piel, pantalla de 10,9\" con Apple CarPlay y sonido Bose. Factura original, 2 dueños y placas yucatecas.",
      en: "2019 Porsche Macan S with a 3.0L turbo V6 and all-wheel drive. Panoramic roof, leather seats, 10.9\" screen with Apple CarPlay and Bose sound. Original invoice, 2 owners and Yucatán plates.",
    },
    features: {
      es: ["Techo panorámico", "Asientos en piel", "Pantalla de 10,9\" con Apple CarPlay", "Sonido Bose", "Llave de presencia", "Factura original", "2 dueños", "Placas yucatecas"],
      en: ["Panoramic roof", "Leather seats", "10.9\" screen with Apple CarPlay", "Bose sound", "Keyless entry", "Original invoice", "2 owners", "Yucatán plates"],
    },
  },
  {
    folder: "gmc-sierra-denali-2025",
    brand: "GMC",
    model: "Sierra",
    version: "Denali",
    year: 2025,
    price: 1299000,
    mileage: 37000,
    engine: "V8 6.2L",
    transmission: "Automática",
    drivetrain: { es: "4x4", en: "4x4" },
    color: null,
    category: ["pickups"],
    description: {
      es: "GMC Sierra Denali 2025 con motor V8 6.2L, transmisión automática y 4x4. Factura original, rines de 22\", estribos eléctricos y cámara de reversa 360.",
      en: "2025 GMC Sierra Denali with a 6.2L V8, automatic transmission and 4x4. Original invoice, 22\" wheels, power running boards and 360 reverse camera.",
    },
    features: {
      es: ["Factura original", "Rines de 22\"", "Estribos eléctricos", "Cámara de reversa 360", "Apple CarPlay"],
      en: ["Original invoice", "22\" wheels", "Power running boards", "360 reverse camera", "Apple CarPlay"],
    },
  },
  {
    folder: "kia-k3-2024",
    brand: "Kia",
    model: "K3",
    version: "L Aut.",
    year: 2024,
    price: 249000,
    mileage: 39000,
    engine: "4 cilindros 1.6L",
    transmission: "Automática",
    drivetrain: null,
    color: null,
    category: ["compactos"],
    description: {
      es: "Kia K3 L Aut. 2024 con motor de 4 cilindros 1.6L y transmisión automática. Rines de aluminio, llantas nuevas, pantalla con Apple CarPlay y factura original.",
      en: "2024 Kia K3 L Aut. with a 1.6L 4-cylinder engine and automatic transmission. Alloy wheels, new tires, a screen with Apple CarPlay and original invoice.",
    },
    features: {
      es: ["Rines de aluminio", "Llantas nuevas", "Pantalla con Apple CarPlay", "Factura original"],
      en: ["Alloy wheels", "New tires", "Screen with Apple CarPlay", "Original invoice"],
    },
  },
  {
    folder: "suzuki-swift-gls-2018",
    brand: "Suzuki",
    model: "Swift",
    version: "GLS",
    year: 2018,
    price: 175000,
    mileage: 160000,
    engine: "4 cilindros 1.2 L",
    transmission: "Manual",
    drivetrain: null,
    color: null,
    category: ["compactos"],
    description: {
      es: "Suzuki Swift GLS 2018 con motor de 4 cilindros 1.2 L y transmisión estándar. Estéreo Bluetooth, mandos al volante y aire acondicionado. 2 dueños, placas yucatecas 2026 y factura de agencia local.",
      en: "2018 Suzuki Swift GLS with a 1.2 L 4-cylinder engine and manual transmission. Bluetooth stereo, steering wheel controls and air conditioning. 2 owners, 2026 Yucatán plates and local dealer invoice.",
    },
    features: {
      es: ["Estéreo Bluetooth", "Mandos al volante", "Aire acondicionado", "Placas yucatecas 2026", "2 dueños", "Factura de agencia local"],
      en: ["Bluetooth stereo", "Steering wheel controls", "Air conditioning", "2026 Yucatán plates", "2 owners", "Local dealer invoice"],
    },
  },
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
  const gallery: VehicleImage[] = manifest[s.folder].photos.map((p, n) => ({
    src: `/eurocars/inventory/${s.folder}/${p.file}`,
    alt: `${title} ${s.year} — foto ${n + 1}`,
    width: p.width,
    height: p.height,
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
    transmission: s.transmission,
    engine: s.engine,
    drivetrain: s.drivetrain ? `${s.drivetrain.es}|${s.drivetrain.en}` : null,
    exteriorColor: s.color,
    interiorColor: null,
    description: s.description,
    features: s.features,
    gallery,
    financingAvailable: false,
    featured: true,
    category: s.category,
    createdAt: "2026-10-05",
    updatedAt: "2026-10-05",
    isPlaceholder: true,
    isDemo: true,
  };
});

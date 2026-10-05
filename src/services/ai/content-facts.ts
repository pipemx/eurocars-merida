import type { Vehicle, VehicleCategory } from "@/types/vehicle";
import type { ContentFacts } from "./content-types";

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Construye los datos verificados a partir de un vehículo. `origin` = origen del sitio (para la URL de la ficha). */
export function vehicleToFacts(v: Vehicle & { origin?: "demo" | "added" }, origin?: string): ContentFacts {
  const title = [v.brand, v.model, v.version].filter(Boolean).join(" ");
  const [dtEs, dtEn] = v.drivetrain ? v.drivetrain.split("|") : [];
  return {
    slug: v.slug,
    brand: v.brand,
    model: v.model,
    version: v.version,
    year: v.year,
    title,
    fullName: `${title} ${v.year}`,
    price: v.price,
    mileage: v.mileage,
    color: v.exteriorColor,
    engine: v.engine,
    transmission: v.transmission,
    drivetrain: dtEs ? { es: dtEs, en: dtEn ?? dtEs } : null,
    features: v.features.es,
    categories: v.category,
    status: v.status,
    hasPhoto: v.gallery.length > 0,
    publicUrl: v.origin === "added" || !origin ? null : `${origin}/es/inventario/${v.slug}`,
  };
}

/** Huella estable de los datos usados (sin la URL, que depende del entorno). */
export function factsKey(f: ContentFacts): string {
  const { publicUrl: _omit, hasPhoto: _photo, ...rest } = f;
  void _omit;
  void _photo;
  return JSON.stringify(rest);
}

export type Lang = "es" | "en";

export const money = (n: number) => `$${nf.format(n)} MXN`;
export const km = (n: number) => `${nf.format(n)} km`;

const colorEn: Record<string, string> = {
  negro: "Black", blanco: "White", gris: "Gray", rojo: "Red", azul: "Blue", plata: "Silver", plateado: "Silver",
  verde: "Green", naranja: "Orange", amarillo: "Yellow", cafe: "Brown", dorado: "Gold", beige: "Beige", morado: "Purple",
};
const transmissionEn: Record<string, string> = { automatica: "Automatic", manual: "Manual" };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/** Traduce solo valores conocidos; cualquier otro valor se deja tal cual (nunca se inventa). */
export const colorLabel = (c: string, lang: Lang) => (lang === "es" ? c : colorEn[norm(c)] ?? c);
export const transmissionLabel = (t: string, lang: Lang) => (lang === "es" ? t : transmissionEn[norm(t)] ?? t);

export function priceLabel(f: ContentFacts, lang: Lang) {
  return f.price !== null ? money(f.price) : lang === "es" ? "Consultar" : "On request";
}
export function mileageLabel(f: ContentFacts, lang: Lang) {
  return f.mileage !== null ? km(f.mileage) : lang === "es" ? "Consultar" : "On request";
}

/** Datos confirmados como pares etiqueta/valor, SOLO los que existen. */
export function knownDetails(f: ContentFacts, lang: Lang, opts: { includeYear?: boolean; includePriceKm?: boolean } = {}) {
  const { includeYear = true, includePriceKm = true } = opts;
  const es = lang === "es";
  const out: { label: string; value: string }[] = [];
  if (includeYear) out.push({ label: es ? "Año" : "Year", value: String(f.year) });
  if (includePriceKm && f.price !== null) out.push({ label: es ? "Precio" : "Price", value: money(f.price) });
  if (includePriceKm && f.mileage !== null) out.push({ label: es ? "Kilometraje" : "Mileage", value: km(f.mileage) });
  if (f.color) out.push({ label: "Color", value: colorLabel(f.color, lang) });
  if (f.engine) out.push({ label: es ? "Motor" : "Engine", value: f.engine });
  if (f.transmission) out.push({ label: es ? "Transmisión" : "Transmission", value: transmissionLabel(f.transmission, lang) });
  if (f.drivetrain) out.push({ label: es ? "Tracción" : "Drivetrain", value: f.drivetrain[lang] });
  return out;
}

/** Para frases: "Año 2024 · Color Negro · Kilometraje 1,200 km" (sin dos puntos, para no chocar con el texto). */
export const detailsInline = (d: { label: string; value: string }[]) => d.map((x) => `${x.label} ${x.value}`).join(" · ");

/** Lo que se invita a consultar: siempre disponibilidad; precio/km solo si NO se conocen. */
export function consultItems(f: ContentFacts, lang: Lang): string[] {
  const es = lang === "es";
  const items = [es ? "disponibilidad" : "availability"];
  if (f.price === null) items.push(es ? "precio" : "price");
  if (f.mileage === null) items.push(es ? "kilometraje" : "mileage");
  return items;
}

export function joinList(items: string[], lang: Lang) {
  const and = lang === "es" ? "y" : "and";
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

const nounPriority: VehicleCategory[] = ["suv", "pickups", "deportivos", "compactos", "exoticos", "premium"];
const nounEs: Record<VehicleCategory, string> = { suv: "una SUV", pickups: "una pickup", deportivos: "un deportivo", compactos: "un auto compacto", exoticos: "un auto exótico", premium: "un auto premium" };
const nounEn: Record<VehicleCategory, string> = { suv: "an SUV", pickups: "a pickup truck", deportivos: "a sports car", compactos: "a compact car", exoticos: "an exotic car", premium: "a premium car" };

/** "una SUV" según la clasificación editorial (no es una especificación). null si no hay categoría. */
export function categoryNoun(f: ContentFacts, lang: Lang): string | null {
  const c = nounPriority.find((x) => f.categories.includes(x));
  return c ? (lang === "es" ? nounEs[c] : nounEn[c]) : null;
}

/** "inventario premium" solo si la clasificación editorial lo indica; si no, "inventario". */
export function inventoryWord(f: ContentFacts, lang: Lang) {
  const premium = f.categories.includes("premium") || f.categories.includes("exoticos");
  if (lang === "es") return premium ? "inventario premium" : "inventario";
  return premium ? "premium inventory" : "inventory";
}

/** Disponibilidad según el estado capturado en el admin. */
export function availability(f: ContentFacts, lang: Lang) {
  if (lang === "es") {
    if (f.status === "reserved") return "apartado actualmente en Eurocars Mérida";
    if (f.status === "sold") return "vendido; consulta unidades similares en Eurocars Mérida";
    return "disponible para consulta en Eurocars Mérida";
  }
  if (f.status === "reserved") return "currently reserved at Eurocars Mérida";
  if (f.status === "sold") return "sold; ask about similar vehicles at Eurocars Mérida";
  return "available to inquire about at Eurocars Mérida";
}

const tagify = (s: string) => {
  const t = s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, " ").trim();
  return t.split(" ").map((w) => (w.length > 3 && w === w.toLowerCase() ? w[0].toUpperCase() + w.slice(1) : w)).join("");
};

const categoryTag: Record<VehicleCategory, string> = { suv: "SUV", pickups: "Pickup", deportivos: "Deportivos", compactos: "Compactos", exoticos: "Exoticos", premium: "AutosPremium" };

/** Hashtags SOLO a partir de datos conocidos (marca, modelo, categoría editorial, ciudad). */
export function hashtagsFor(f: ContentFacts, lang: Lang): string[] {
  const tags = ["#EurocarsMerida", `#${tagify(f.brand)}`, `#${tagify(f.brand)}${tagify(f.model)}`];
  const cat = nounPriority.find((c) => f.categories.includes(c));
  if (cat) tags.push(`#${categoryTag[cat]}`);
  tags.push(lang === "es" ? "#AutosMerida" : "#MeridaYucatan", "#Yucatan");
  return [...new Set(tags)].slice(0, 7);
}

/** Recorta en límite de palabra sin superar `max` caracteres. */
export function fit(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:]+$/, "")}…`;
}

"use client";

import { useMemo } from "react";
import type { Vehicle, VehicleCategory, VehicleImage, VehicleStatus } from "@/types/vehicle";
import { createLocalJsonStore } from "../storage/local-json-store";

/**
 * Inventario ADMINISTRATIVO (demo): el dataset fuente nunca se modifica.
 * - Ediciones de los 8 vehículos demo = "overrides" en localStorage (se pueden restaurar).
 * - Vehículos agregados desde el panel = lista aparte en localStorage (isDemo, sin ficha pública).
 * Mañana: estas operaciones pasan a Supabase detrás de la misma interfaz.
 */
export const CATEGORY_IDS: VehicleCategory[] = ["exoticos", "premium", "suv", "deportivos", "pickups", "compactos"];
export const MAX_PHOTOS = 4;

export type VehicleEdit = Partial<Pick<Vehicle, "brand" | "model" | "version" | "year" | "price" | "mileage" | "exteriorColor" | "engine" | "transmission" | "category" | "status" | "featured" | "gallery">> & {
  featuresEs?: string[];
  updatedAt: string;
};

export type AdminVehicle = Vehicle & { origin: "demo" | "added"; edited: boolean };

/** Valores del formulario (todo texto; vacío = dato desconocido, nunca un valor por defecto). */
export interface VehicleFormValues {
  brand: string;
  model: string;
  version: string;
  year: string;
  price: string;
  mileage: string;
  color: string;
  engine: string;
  transmission: string;
  categories: VehicleCategory[];
  features: string;
  featured: boolean;
  status: VehicleStatus;
  photos: VehicleImage[];
}

export const emptyFormValues: VehicleFormValues = {
  brand: "",
  model: "",
  version: "",
  year: "",
  price: "",
  mileage: "",
  color: "",
  engine: "",
  transmission: "",
  categories: [],
  features: "",
  featured: false,
  status: "available",
  photos: [],
};

const overridesStore = createLocalJsonStore<Record<string, VehicleEdit>>("ec-demo-admin-overrides", {});
const addedStore = createLocalJsonStore<Vehicle[]>("ec-demo-admin-added", []);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const num = (s: string): number | null => {
  const clean = s.replace(/[\s,$]/g, "");
  if (!clean) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
};

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export function vehicleToValues(v: Vehicle): VehicleFormValues {
  return {
    brand: v.brand,
    model: v.model,
    version: v.version,
    year: String(v.year),
    price: v.price !== null ? String(v.price) : "",
    mileage: v.mileage !== null ? String(v.mileage) : "",
    color: v.exteriorColor ?? "",
    engine: v.engine ?? "",
    transmission: v.transmission ?? "",
    categories: v.category,
    features: v.features.es.join("\n"),
    featured: v.featured,
    status: v.status,
    photos: v.gallery,
  };
}

export type FormErrors = Partial<Record<"brand" | "model" | "year" | "price" | "mileage", string>>;

export function validateVehicleValues(v: VehicleFormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.brand.trim()) e.brand = "Indica la marca.";
  if (!v.model.trim()) e.model = "Indica el modelo.";
  const year = Number(v.year);
  if (!v.year.trim() || !Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1) e.year = "Año de 4 dígitos (1950 en adelante).";
  if (v.price.trim() && (num(v.price) === null || (num(v.price) ?? 0) < 0)) e.price = "Usa solo números, o déjalo vacío.";
  if (v.mileage.trim() && (num(v.mileage) === null || (num(v.mileage) ?? 0) < 0)) e.mileage = "Usa solo números, o déjalo vacío.";
  return e;
}

function valuesToEdit(v: VehicleFormValues): VehicleEdit {
  return {
    brand: v.brand.trim(),
    model: v.model.trim(),
    version: v.version.trim(),
    year: Number(v.year),
    price: num(v.price),
    mileage: num(v.mileage),
    exteriorColor: v.color.trim() || null,
    engine: v.engine.trim() || null,
    transmission: v.transmission.trim() || null,
    category: v.categories,
    status: v.status,
    featured: v.featured,
    gallery: v.photos,
    featuresEs: lines(v.features),
    updatedAt: todayIso(),
  };
}

function applyEdit(base: Vehicle, edit: VehicleEdit): Vehicle {
  const { featuresEs, ...fields } = edit;
  return { ...base, ...fields, features: featuresEs ? { ...base.features, es: featuresEs } : base.features };
}

export function mergeInventory(base: Vehicle[], overrides: Record<string, VehicleEdit>, added: Vehicle[]): AdminVehicle[] {
  const demo = base.map((v) => {
    const o = overrides[v.slug];
    return { ...(o ? applyEdit(v, o) : v), origin: "demo" as const, edited: Boolean(o) };
  });
  const extra = added.map((v) => ({ ...v, origin: "added" as const, edited: false }));
  return [...extra, ...demo];
}

/** Hook: inventario fusionado (demo + overrides + agregados) y acciones. */
export function useAdminInventory(base: Vehicle[]) {
  const overrides = overridesStore.useValue();
  const added = addedStore.useValue();
  const vehicles = useMemo(() => mergeInventory(base, overrides, added), [base, overrides, added]);
  return {
    vehicles,
    editedCount: Object.keys(overrides).length,
    addedCount: added.length,
    hasLocalChanges: Object.keys(overrides).length + added.length > 0,
  };
}

/** Guarda cambios. Devuelve false si localStorage rechazó la escritura (p. ej. fotos demasiado pesadas). */
export function saveVehicle(slug: string, origin: "demo" | "added", values: VehicleFormValues): boolean {
  const edit = valuesToEdit(values);
  if (origin === "demo") return overridesStore.update((cur) => ({ ...cur, [slug]: edit }));
  return addedStore.update((cur) => cur.map((v) => (v.slug === slug ? applyEdit(v, edit) : v)));
}

export function addVehicle(values: VehicleFormValues): { ok: true; slug: string } | { ok: false } {
  const edit = valuesToEdit(values);
  const stamp = Date.now().toString(36);
  const title = [edit.brand, edit.model, edit.version].filter(Boolean).join(" ");
  const slug = `${slugify(`${title} ${edit.year}`)}-${stamp}`;
  const base: Vehicle = {
    id: `added-${stamp}`,
    slug,
    status: "available",
    brand: "",
    model: "",
    version: "",
    year: 0,
    price: null,
    mileage: null,
    transmission: null,
    engine: null,
    drivetrain: null,
    exteriorColor: null,
    interiorColor: null,
    description: { es: "", en: "" },
    features: { es: [], en: [] },
    gallery: [],
    financingAvailable: false,
    featured: false,
    category: [],
    createdAt: edit.updatedAt,
    updatedAt: edit.updatedAt,
    isPlaceholder: true,
    isDemo: true,
  };
  const ok = addedStore.update((cur) => [applyEdit(base, edit), ...cur]);
  return ok ? { ok: true, slug } : { ok: false };
}

/** Quita el override de un vehículo demo (vuelve a los datos fuente). */
export function restoreVehicle(slug: string) {
  overridesStore.update((cur) => {
    const next = { ...cur };
    delete next[slug];
    return next;
  });
}

/** Descarta TODOS los cambios locales: overrides y vehículos agregados. */
export function restoreAll() {
  overridesStore.reset();
  addedStore.reset();
}

/**
 * Reduce una fotografía subida a JPEG de máx. 1280 px para que quepa en localStorage.
 * (Solo demo; en producción irá a almacenamiento de archivos.)
 */
export async function fileToPhoto(file: File): Promise<VehicleImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("No se pudo leer la imagen"));
      i.src = url;
    });
    const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
    return { src: canvas.toDataURL("image/jpeg", 0.72), alt: file.name.replace(/\.[^.]+$/, ""), width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

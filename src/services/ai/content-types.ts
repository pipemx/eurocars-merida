import type { VehicleCategory, VehicleStatus } from "@/types/vehicle";

/**
 * CONTRATO del generador de contenido (Eurocars AI Content Studio).
 * La UI solo conoce estos tipos: hoy los produce `mockContentGenerator` (plantillas), mañana un
 * proveedor de Gemini que devuelva JSON con esta misma forma (validable con `validateGeneratedContent`).
 */

export type ContentTone = "premium" | "direct" | "social";

export const CONTENT_TONES: { id: ContentTone; label: string; hint: string }[] = [
  { id: "premium", label: "Premium", hint: "Sobrio y elegante" },
  { id: "direct", label: "Directo", hint: "Breve y al grano" },
  { id: "social", label: "Social", hint: "Cercano, para redes" },
];

/**
 * Datos VERIFICADOS del vehículo: lo único que el generador puede usar. `null`/vacío = desconocido y
 * NUNCA debe aparecer en el copy (ni inferirse por marca o modelo).
 */
export interface ContentFacts {
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  /** "BMW X7 M60 Sport" */
  title: string;
  /** "BMW X7 M60 Sport 2024" */
  fullName: string;
  price: number | null;
  mileage: number | null;
  color: string | null;
  engine: string | null;
  transmission: string | null;
  /** Etiquetas ya resueltas por idioma (tracción verificada) o null. */
  drivetrain: { es: string; en: string } | null;
  /** Características verificadas (en español, como las captura el admin). */
  features: string[];
  /** Clasificación editorial de la demo (no es una especificación técnica). */
  categories: VehicleCategory[];
  status: VehicleStatus;
  hasPhoto: boolean;
  /** URL pública de la ficha si existe; null si el vehículo aún no tiene ficha pública. */
  publicUrl: string | null;
}

export interface GenerateOptions {
  tone: ContentTone;
  /** 0, 1, 2…: cada valor elige otra variante de plantilla (sin añadir datos nuevos). */
  variant: number;
}

export interface WebContent {
  title: string;
  description: string;
  /** Datos confirmados (solo los que existen). */
  highlights: string[];
  cta: string;
}

export interface SeoContent {
  title: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
}

export interface InstagramContent {
  caption: string;
  hashtags: string[];
  cta: string;
}

export interface FacebookContent {
  post: string;
  ctaLabel: string;
  /** Ruta de la ficha (si existe). */
  linkPath: string | null;
}

export interface MarketplaceContent {
  title: string;
  year: string;
  price: string;
  mileage: string;
  /** Datos adicionales confirmados: color, motor, transmisión… (solo los que existen). */
  details: { label: string; value: string }[];
  description: string;
  location: string;
  contact: string;
}

export interface WhatsappContent {
  /** Mensaje para que Eurocars comparta el vehículo. */
  shareMessage: string;
  /** Respuesta rápida a un prospecto interesado. */
  quickReply: string;
}

export interface AccessibilityContent {
  altText: string;
  alternatives: string[];
}

export interface EnglishContent {
  webDescription: string;
  seoTitle: string;
  metaDescription: string;
  socialCaption: string;
  hashtags: string[];
}

export interface GeneratedVehicleContent {
  meta: {
    schemaVersion: 1;
    provider: "mock" | "gemini";
    vehicleSlug: string;
    tone: ContentTone;
    variant: number;
    generatedAt: string;
    /** Huella de los datos usados: si cambian, el borrador queda desactualizado. */
    factsKey: string;
  };
  web: WebContent;
  seo: SeoContent;
  social: {
    instagram: InstagramContent;
    facebook: FacebookContent;
    marketplace: MarketplaceContent;
    whatsapp: WhatsappContent;
  };
  accessibility: AccessibilityContent;
  english: EnglishContent;
}

export interface ContentGenerator {
  generate(facts: ContentFacts, options: GenerateOptions): Promise<GeneratedVehicleContent>;
}

import type { ContentFacts, GeneratedVehicleContent } from "./content-types";

/**
 * Validación del contenido generado. Sirve para el mock Y para el futuro proveedor de Gemini:
 * 1) `validateGeneratedContent`: la forma del JSON (para rechazar respuestas mal formadas).
 * 2) `auditContent`: nada de datos inventados — precio/km desconocidos, cifras ajenas a los datos
 *    del vehículo y afirmaciones técnicas o comerciales que no existan como dato.
 */

const str = (x: unknown): x is string => typeof x === "string" && x.trim().length > 0;
const strs = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === "string");
const obj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

export function validateGeneratedContent(x: unknown): x is GeneratedVehicleContent {
  if (!obj(x) || !obj(x.meta) || !obj(x.web) || !obj(x.seo) || !obj(x.social) || !obj(x.accessibility) || !obj(x.english)) return false;
  const { meta, web, seo, social, accessibility, english } = x as Record<string, Record<string, unknown>>;
  const { instagram, facebook, marketplace, whatsapp } = social as Record<string, Record<string, unknown>>;
  if (![instagram, facebook, marketplace, whatsapp].every(obj)) return false;
  return (
    meta.schemaVersion === 1 && str(meta.vehicleSlug) && str(meta.factsKey) &&
    str(web.title) && str(web.description) && strs(web.highlights) && str(web.cta) &&
    str(seo.title) && str(seo.metaDescription) && str(seo.slug) && strs(seo.keywords) &&
    str(instagram.caption) && strs(instagram.hashtags) && str(instagram.cta) &&
    str(facebook.post) && str(facebook.ctaLabel) &&
    str(marketplace.title) && str(marketplace.price) && str(marketplace.description) && str(marketplace.location) && str(marketplace.contact) && Array.isArray(marketplace.details) &&
    str(whatsapp.shareMessage) && str(whatsapp.quickReply) &&
    str(accessibility.altText) && strs(accessibility.alternatives) &&
    str(english.webDescription) && str(english.seoTitle) && str(english.metaDescription) && str(english.socialCaption) && strs(english.hashtags)
  );
}

/** Todas las cadenas visibles del contenido (sin metadatos técnicos). */
function visibleStrings(c: GeneratedVehicleContent): string[] {
  const m = c.social.marketplace;
  return [
    c.web.title, c.web.description, ...c.web.highlights, c.web.cta,
    c.seo.title, c.seo.metaDescription, ...c.seo.keywords,
    c.social.instagram.caption, ...c.social.instagram.hashtags, c.social.instagram.cta,
    c.social.facebook.post, c.social.facebook.ctaLabel,
    m.title, m.year, m.price, m.mileage, m.description, m.location, m.contact, ...m.details.flatMap((d) => [d.label, d.value]),
    c.social.whatsapp.shareMessage, c.social.whatsapp.quickReply,
    c.accessibility.altText, ...c.accessibility.alternatives,
    c.english.webDescription, c.english.seoTitle, c.english.metaDescription, c.english.socialCaption, ...c.english.hashtags,
  ];
}

/** Afirmaciones que solo pueden aparecer si el dato existe (en características, motor, etc.). */
const UNVERIFIED_CLAIMS = [
  "caballos", "hp", "cv ", "última generación", "ultima generacion", "lujos", "lujoso", "alto desempeño", "alto rendimiento", "tecnología", "tecnologia",
  "piel", "techo", "turbo", "híbrid", "hibrid", "eléctric", "electric", "garantía", "garantia", "financiamiento", "crédito", "credito", "enganche",
  "único dueño", "un solo dueño", "factura", "agencia", "sin accidentes", "impecable", "como nuevo", "luxurious", "horsepower", "warranty", "financing",
  "cutting-edge", "high-performance",
];

/** Devuelve la lista de problemas (vacía = el contenido solo usa datos verificados). */
export function auditContent(c: GeneratedVehicleContent, f: ContentFacts): string[] {
  const problems: string[] = [];
  const text = visibleStrings(c).join("\n");
  const lower = text.toLowerCase();

  if (f.price === null && (/\$\s?\d/.test(text) || /\b\d[\d,.]*\s?(mxn|pesos|usd)\b/i.test(text))) problems.push("Menciona un precio que no existe.");
  if (f.mileage === null && /\b\d[\d,.]*\s?(km|kil[oó]metros|miles)\b/i.test(text)) problems.push("Menciona un kilometraje que no existe.");

  // Cifras: toda secuencia de dígitos debe provenir de los datos del vehículo.
  const known = [f.title, String(f.year), f.price !== null ? String(f.price) : "", f.price !== null ? f.price.toLocaleString("en-US") : "", f.mileage !== null ? String(f.mileage) : "", f.mileage !== null ? f.mileage.toLocaleString("en-US") : "", f.color ?? "", f.engine ?? "", f.transmission ?? "", f.drivetrain?.es ?? "", f.drivetrain?.en ?? "", ...f.features, f.publicUrl ?? "", f.slug].join(" ");
  const allowed = new Set(known.match(/\d+/g) ?? []);
  for (const n of new Set(text.match(/\d+/g) ?? [])) if (!allowed.has(n)) problems.push(`Cifra no respaldada por los datos: ${n}`);

  // Afirmaciones sin dato que las respalde.
  const factsText = [f.title, f.color, f.engine, f.transmission, f.drivetrain?.es, f.drivetrain?.en, ...f.features].filter(Boolean).join(" ").toLowerCase();
  for (const claim of UNVERIFIED_CLAIMS) if (lower.includes(claim) && !factsText.includes(claim.trim())) problems.push(`Afirmación no verificable: "${claim.trim()}"`);

  return problems;
}

export class ContentGuardError extends Error {
  constructor(public problems: string[]) {
    super(`El contenido generado incluye datos no verificados: ${problems.join("; ")}`);
    this.name = "ContentGuardError";
  }
}

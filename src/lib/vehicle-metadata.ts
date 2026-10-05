import type { Metadata } from "next";
import { getVehicle } from "@/services/inventory";
import { site } from "@/content/site";
import { hreflang, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { vehicleUrl } from "./vehicle-url";
import { vehicleName } from "./whatsapp";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Metadata por vehículo: title, description, canonical, hreflang (ES y EN existen), Open Graph y Twitter. */
export async function vehicleMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const v = await getVehicle(slug);
  if (!v) return {};
  const t = getDictionary(locale);
  const name = vehicleName(v);
  const price = v.price !== null ? ` · $${fmt.format(v.price)} MXN` : "";
  const km = v.mileage !== null ? ` · ${fmt.format(v.mileage)} km` : "";
  const title = locale === "es" ? `${name} en Mérida` : `${name} in Mérida`;
  const description = `${name}${km}${price}. ${v.description[locale]} Eurocars Mérida.`;
  const url = vehicleUrl(locale, v.slug);
  // Sin fotografía real todavía: imagen de marca de la home (nunca la foto de otro vehículo).
  // Con fotografía: JPG 1200×630 en /eurocars/og/ (mejor compatibilidad con WhatsApp/Facebook que WebP).
  const cover = v.gallery[0];
  // Fotos del inventario: og.jpg 1200×630 junto a las imágenes de la unidad (scripts/import-public-inventory.mjs).
  const og = cover ? (cover.src.startsWith("/eurocars/inventory/") ? cover.src.replace(/\/[^/]+$/, "/og.jpg") : cover.src.replace("/eurocars/vehicles/", "/eurocars/og/").replace(/\.webp$/, ".jpg")) : "/eurocars/og/home.jpg";
  const ogAlt = cover ? cover.alt : `${name} — ${t.inventory.photoPending}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { [hreflang.es]: vehicleUrl("es", v.slug), [hreflang.en]: vehicleUrl("en", v.slug), "x-default": vehicleUrl("es", v.slug) },
    },
    openGraph: {
      type: "website",
      siteName: "Eurocars Mérida",
      url,
      title: `${name} · Eurocars Mérida`,
      description,
      locale: locale === "es" ? "es_MX" : "en_US",
      images: [{ url: og, width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: { card: "summary_large_image", title: `${name} · Eurocars Mérida`, description, images: [og] },
    robots: site.isPreview ? { index: false, follow: false } : undefined,
  };
}

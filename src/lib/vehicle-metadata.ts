import type { Metadata } from "next";
import { getVehicle } from "@/content/vehicles";
import { site } from "@/content/site";
import { hreflang, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { vehicleUrl } from "./vehicle-url";
import { vehicleName } from "./whatsapp";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Metadata por vehículo: title, description, canonical, hreflang, Open Graph y Twitter. */
export function vehicleMetadata(locale: Locale, slug: string): Metadata {
  const v = getVehicle(slug);
  if (!v) return {};
  const t = getDictionary(locale);
  const name = vehicleName(v);
  const price = v.price !== null ? `$${fmt.format(v.price)} MXN` : t.inventory.priceOnRequest;
  const km = v.mileage !== null ? ` · ${fmt.format(v.mileage)} km` : "";
  const title = locale === "es" ? `${name} en Mérida` : `${name} in Mérida`;
  const description = `${name}${km} · ${price}. ${v.description[locale]} Eurocars Mérida.`;
  const url = vehicleUrl(locale, v.slug);
  // JPG 1200×630 (mejor compatibilidad con la vista previa de WhatsApp/Facebook que WebP)
  const og = v.coverImage.src.replace("/eurocars/vehicles/", "/eurocars/og/").replace(/\.webp$/, ".jpg");
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
      images: [{ url: og, width: 1200, height: 630, alt: v.coverImage.alt }],
    },
    twitter: { card: "summary_large_image", title: `${name} · Eurocars Mérida`, description, images: [og] },
    robots: site.isPreview ? { index: false, follow: false } : undefined,
  };
}

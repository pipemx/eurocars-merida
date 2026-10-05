import { site } from "@/content/site";
import type { Locale } from "@/i18n/config";
import type { Vehicle } from "@/types/vehicle";
import { vehicleUrl } from "./vehicle-url";
import { vehicleName } from "./whatsapp";

/**
 * Datos estructurados schema.org/Car. SOLO declara lo que existe: marca, modelo y año siempre;
 * imagen, kilometraje, motor y oferta únicamente si el dato está verificado (no null).
 */
export function vehicleJsonLd(v: Vehicle, locale: Locale) {
  const cover = v.gallery[0];
  const url = `${site.url}${vehicleUrl(locale, v.slug)}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicleName(v),
    brand: { "@type": "Brand", name: v.brand },
    model: [v.model, v.version].filter(Boolean).join(" "),
    vehicleModelDate: String(v.year),
    url,
  };
  if (cover) data.image = `${site.url}${cover.src}`;
  if (v.mileage !== null) data.mileageFromOdometer = { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" };
  if (v.engine) data.vehicleEngine = { "@type": "EngineSpecification", name: v.engine };
  if (v.exteriorColor) data.color = v.exteriorColor;
  if (v.price !== null) {
    data.offers = {
      "@type": "Offer",
      url,
      price: v.price,
      priceCurrency: "MXN",
      availability: v.status === "available" ? "https://schema.org/InStock" : v.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/LimitedAvailability",
      seller: { "@type": "AutoDealer", name: site.name },
    };
  }
  return data;
}

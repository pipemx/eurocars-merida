import { site } from "@/content/site";
import { routes, type Locale } from "@/i18n/config";

/** URL canónica de la ficha: /es/inventario/[slug] · /en/inventory/[slug]. */
export function vehicleUrl(locale: Locale, slug: string, absolute = false) {
  const path = `/${locale}/${routes.inventory[locale]}/${slug}`;
  return absolute ? `${site.url}${path}` : path;
}

/**
 * Mientras no exista la ficha individual (siguiente entrega), compartir apunta a la home con
 * el vehículo destacado, para no difundir enlaces rotos. Cambiar a vehicleUrl() al publicar fichas.
 */
export const VEHICLE_PAGES_READY = false;

export function shareUrl(locale: Locale, slug: string) {
  if (VEHICLE_PAGES_READY) return vehicleUrl(locale, slug, true);
  const origin = typeof window !== "undefined" ? window.location.origin : site.url;
  return `${origin}/${locale}?v=${slug}#inventario`;
}

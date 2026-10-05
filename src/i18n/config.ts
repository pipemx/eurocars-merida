export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const hreflang: Record<Locale, string> = { es: "es-MX", en: "en" };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Rutas traducidas: la clave interna es estable, el segmento visible cambia por idioma. */
export const routes = {
  inventory: { es: "inventario", en: "inventory" },
  favorites: { es: "favoritos", en: "favorites" },
  compare: { es: "comparar", en: "compare" },
} as const;

export function routePath(locale: Locale, route: keyof typeof routes) {
  return `/${locale}/${routes[route][locale]}`;
}

export function localePath(locale: Locale, path = "") {
  return `/${locale}${path ? `/${path}` : ""}`;
}

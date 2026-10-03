/**
 * Datos del negocio. Cada campo marcado `verified: false` NO debe mostrarse como dato
 * definitivo ni usarse en structured data hasta que Eurocars lo confirme.
 * Ver docs/01-AUDITORIA.md.
 */
export const site = {
  name: "Eurocars Mérida",
  url: "https://eurocarsmerida.com",
  /** Mientras haya datos/fotos de ejemplo, el sitio no se indexa. */
  isPreview: true,
  whatsapp: { e164: "529993311140", display: "+52 999 331 1140", verified: false },
  location: {
    neighborhood: "Santa Gertrudis Copó",
    city: "Mérida",
    region: "Yucatán",
    /** Dos direcciones distintas en directorios; pendiente de confirmar. */
    streetAddress: null as string | null,
    verified: false,
  },
  social: {
    instagram: "https://www.instagram.com/eurocarsmerida/",
    facebook: "https://www.facebook.com/eurocarsmeridayuc",
    tiktok: "https://www.tiktok.com/@eurocarsmid",
  },
  maps: "https://maps.app.goo.gl/9G9rfZMcazzWYHyGA",
} as const;

export const nav = [
  { label: "Inicio", href: "/" },
  { label: "Inventario", href: "/inventario" },
  { label: "Vende tu auto", href: "/#vende-tu-auto" },
  { label: "Financiamiento", href: "/#financiamiento" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" },
] as const;

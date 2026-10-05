/**
 * Datos del negocio. Los textos marcados "MOCKUP" vienen del diseño de referencia
 * (docs/mockup-referencia.webp) y están PENDIENTES DE VERIFICAR con Eurocars antes de
 * publicar. Ver docs/03-CONTENIDO-PENDIENTE.md.
 */
// Constante local (no importada) para que el compilador pode los valores reales al compilar en modo demo.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export const site = {
  name: "Eurocars Mérida",
  /** Dominio público: variable de entorno > dominio de producción de Vercel > dominio final. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://eurocarsmerida.com"),
  /** Mientras haya contenido sin verificar: noindex + aviso discreto de vista previa. */
  isPreview: true,
  /** Teléfono/WhatsApp: "Probable" (docs/01). En modo demo se omite del bundle: ningún botón puede contactar al número real. */
  whatsapp: DEMO_MODE ? { e164: "", display: "" } : { e164: "529993311140", display: "+52 999 331 1140" },
  location: {
    label: "Santa Gertrudis Copó, Mérida, Yucatán.",
    neighborhood: "Santa Gertrudis Copó",
    city: "Mérida",
    region: "Yucatán",
  },
  /** MOCKUP — confirmar en Google Business Profile. */
  google: DEMO_MODE
    ? { rating: "", reviewCount: 0, url: "https://maps.app.goo.gl/9G9rfZMcazzWYHyGA" }
    : {
        rating: "4.8",
        reviewCount: 27,
        url: "https://maps.app.goo.gl/9G9rfZMcazzWYHyGA",
      },
  social: {
    instagram: "https://www.instagram.com/eurocarsmerida/",
    facebook: "https://www.facebook.com/eurocarsmeridayuc",
    tiktok: "https://www.tiktok.com/@eurocarsmid",
  },
  maps: "https://maps.app.goo.gl/9G9rfZMcazzWYHyGA",
} as const;

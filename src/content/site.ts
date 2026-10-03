/**
 * Datos del negocio. Los textos marcados "MOCKUP" vienen del diseño de referencia
 * (docs/mockup-referencia.webp) y están PENDIENTES DE VERIFICAR con Eurocars antes de
 * publicar. Ver docs/03-CONTENIDO-PENDIENTE.md.
 */
export const site = {
  name: "Eurocars Mérida",
  url: "https://eurocarsmerida.com",
  /** Mientras haya contenido sin verificar: noindex + aviso discreto de vista previa. */
  isPreview: true,
  whatsapp: { e164: "529993311140", display: "+52 999 331 1140" },
  location: {
    label: "Santa Gertrudis Copó, Mérida, Yucatán.",
    neighborhood: "Santa Gertrudis Copó",
    city: "Mérida",
    region: "Yucatán",
  },
  /** MOCKUP — los directorios muestran horarios distintos; confirmar. */
  hours: [
    { days: "Lun - Sáb", time: "9:00 a 19:00" },
    { days: "Dom", time: "10:00 a 14:00" },
  ],
  /** MOCKUP — confirmar en Google Business Profile. */
  google: {
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

export const nav = [
  { label: "Inicio", href: "/" },
  { label: "Inventario", href: "/#inventario" },
  { label: "Vender tu auto", href: "/#vende-tu-auto" },
  { label: "Financiamiento", href: "/#financiamiento" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" },
] as const;

/** MOCKUP — condiciones a confirmar antes de publicar. */
export const financingPoints = [
  "Desde 10% de enganche",
  "Sin comprobar ingresos",
  "Crédito directo",
  "Sin consultar buró",
  "Sin aval",
];

/** MOCKUP — testimonios del diseño de referencia; sustituir por reseñas reales de Google. */
export const testimonials = [
  {
    initials: "CM",
    name: "Carlos Méndez",
    text: "Excelente atención y proceso muy transparente. Me ayudaron a encontrar el auto perfecto.",
  },
  {
    initials: "AR",
    name: "Ana R.",
    text: "Mi experiencia fue increíble, todo muy profesional y sin complicaciones.",
  },
  {
    initials: "LH",
    name: "Luis Herrera",
    text: "Gran variedad de autos y un equipo que realmente te asesora. 100% recomendados.",
  },
];

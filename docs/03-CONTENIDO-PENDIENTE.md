# Contenido tomado del mockup — pendiente de verificar antes de publicar

La home replica `docs/mockup-referencia.webp`. Estos elementos vienen del mockup y **no están
verificados** como información real de Eurocars. Mientras `site.isPreview = true` el sitio se
sirve con `noindex` y muestra un aviso pequeño de vista previa.

| Elemento | Dónde se edita | Riesgo si se publica sin verificar |
|---|---|---|
| Fotos (hero, inventario, interior, Porsche, rin) | `public/eurocars/**/mockup-*.webp` | Son recortes de baja resolución del mockup (probablemente generado con IA); no son fotos reales del inventario |
| Inventario: Huracán STO, Macan, X4 M Sport, Raptor (+2 añadidos) con precios y km | `src/content/vehicles.ts` | Anunciar unidades/precios que no existen |
| "Consignación sin comisión" | `ServicesStrip.tsx`, `SellCar.tsx` | Promesa comercial |
| Financiamiento: 10% enganche, crédito directo, sin aval, sin comprobar ingresos, sin buró | `src/content/site.ts` → `financingPoints` | Condiciones de crédito (posible tema PROFECO/CONDUSEF) |
| Testimonios Carlos Méndez / Ana R. / Luis Herrera | `src/content/site.ts` → `testimonials` | Reseñas inventadas; sustituir por reseñas reales de Google |
| Google 4.8/5, +27 reseñas | `src/content/site.ts` → `google` | Debe coincidir con Google Business Profile |
| Horario Lun–Sáb 9–19, Dom 10–14 | `src/content/site.ts` → `hours` | Los directorios muestran otros horarios |

## Desviaciones deliberadas respecto al mockup
- Ícono de YouTube → TikTok (Eurocars tiene TikTok; no se encontró canal de YouTube).
- Eyebrow del bloque final "VENDE TU AUTO" → "VISÍTANOS" (en el mockup parece un error de copia).
- Las 2 tarjetas que asoman en los bordes del carrusel (Aventador, Clase G) no tienen datos en
  el mockup: se muestran como "Precio a consultar".

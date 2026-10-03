# V1 · Entrega 1 — Header, logo animado, hero, redes, WhatsApp, inventario, temas, ES/EN

## Video del logo (análisis)
- Archivo recibido: MP4 H.264 666×476, 24 fps, 10 s, **con pista de audio**, 1.35 MB.
  Original preservado en `docs/assets/logo-animado-original.mp4` (fuera de `public/`).
- Fondo: **degradado gris (#1C1D22–#46464E), no negro**. No se funde con el header carbón.
- Movimiento: barridos de luz sobre el logo metálico + ligero acercamiento de cámara;
  el último cuadro está más cerca que el primero → al repetir en bucle hay un pequeño salto.
- Entregables web (mismo contenido visual, solo recodificado/escalado, sin audio):
  `logo-animado-480.webm` (145 KB), `logo-animado-480.mp4` (194 KB), `logo-animado-poster.webp`.
- Integración: en Dark se presenta como **placa enmarcada** (el gris se lee como placa
  metálica). Se probó una máscara radial difusa y se descartó: parecía una mancha.
  En Light, reduced-motion o error → logo estático (`logo-extracted-light` / `logo-mono-dark`).
  El video se carga después de `load` para no afectar el LCP.
- Ideal para producción: una versión del video con **fondo negro puro (#000)** o con canal
  alfa (WebM VP9 alfa / HEVC alfa) para integrarlo sin placa.

## Temas
- Dark Luxury: hero a sangre cinematográfico; tarjetas con panel sutil.
- Light Editorial: hero con foto enmarcada + pie de foto; tarjetas sin panel; más aire.
- Preferencia: localStorage `ec-theme` > `prefers-color-scheme`; script inline sin flash;
  transición de 300 ms solo durante el cambio.

## Idiomas
- `/es` y `/en` (middleware: cookie `ec-locale` > Accept-Language > es). hreflang es-MX / en /
  x-default, canonical por idioma. Ruta traducida preparada: `/es/inventario` ↔ `/en/inventory`.

## Pendiente (siguientes entregas)
Ficha individual + OG por vehículo (el botón Compartir apunta temporalmente a la home con
`?v=slug` para no difundir enlaces rotos; `VEHICLE_PAGES_READY` en `src/lib/vehicle-url.ts`),
mapa/LocationPreview, formulario de venta, reseñas reales, sitemap/robots/schema.

## Contenido aún sin verificar
Ver `docs/03-CONTENIDO-PENDIENTE.md`. Cambio en esta entrega: se **retiraron los testimonios
inventados**; solo queda la calificación agregada (4.8 / 27, dato del brief, a confirmar).

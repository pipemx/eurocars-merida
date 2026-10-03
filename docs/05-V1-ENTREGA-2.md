# V1 · Entrega 2 — Luxury, fichas de vehículo, mapa, Light con la estructura de Dark

## Cambios pedidos
1. **Light = misma estructura que Dark.** Hero a sangre con velo marfil direccional; todas
   las secciones usan la misma composición. Las franjas de contraste se invierten (claras en
   Dark, carbón en Light).
2. **Redes con animación llamativa** (`SocialLinks.tsx` + `.social-btn`): anillo cónico con
   colores de marca (gira al pasar), relleno de marca con rebote, desfase cian/rojo en TikTok,
   tooltip y un latido escalonado cada 7 s. Táctil: se activa con :active.
3. **Página por vehículo**: `/es/inventario/[slug]` y `/en/inventory/[slug]` (12 páginas
   estáticas). Galería con visor a pantalla completa, ficha técnica, descripción y equipamiento
   ES/EN, WhatsApp contextual, "Solicitar información", Compartir (Web Share / panel),
   financiamiento, relacionados, barra fija móvil WhatsApp | Compartir, evento `vehicle_view`.
   Metadata por vehículo: title, description, canonical, hreflang, Open Graph (JPG 1200×630
   en `public/eurocars/og/`) y Twitter card. Schema `Car` solo se emite para unidades reales.
4. **Mapa** (`LocationPreview.tsx`): Google Maps embebido sin API key, cargado al acercarse
   (IntersectionObserver), estilo oscuro en Dark, pin Eurocars y rótulo; todo el bloque abre
   el enlace oficial de Google Maps. Botón táctil "Abrir en Maps". Fondo cartográfico SVG de
   respaldo mientras carga o si el mapa no puede cargarse.
5. **Efectos luxury**: intro con logo y filete dorado (1 vez por sesión), zoom cinematográfico
   del hero, titular revelado línea por línea, destello dorado recurrente en la palabra clave,
   barras de progreso del carrusel, indicador de scroll, grano cinematográfico, destello en
   botones, reflejo y filete dorado en tarjetas, revelado de imágenes y textos al hacer
   scroll, filetes que se dibujan, marquesina de marcas. Todo se desactiva con
   prefers-reduced-motion.

## Verificado aquí
build/lint/typecheck OK · 0 px de desbordamiento horizontal en las 8 capturas · video del
logo reproduciéndose · hreflang/canonical/OG por ficha.

## No verificado aquí
- El mapa de Google: el dominio está bloqueado en este entorno (se ve el respaldo SVG).
- Vista previa real al compartir por WhatsApp/Facebook: requiere probar el link publicado.

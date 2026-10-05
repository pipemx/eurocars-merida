# Eurocars Mérida — Digital Showroom (contexto para continuar en local)

Next.js 15 (App Router) · TypeScript · Tailwind v4 · fuentes self-hosted (Jost + Cormorant Garamond).
Idiomas `/es` y `/en` (middleware propio, sin librerías i18n). Temas Dark/Light con `data-theme`.

## Comandos
- `npm install` · `npm run dev` (http://localhost:3000) · `npm run build` · `npm run lint` · `npx tsc --noEmit`
- QA visual: `npx playwright install chromium`, luego con el sitio en `next start -p 3100`:
  `node scripts/screenshots.mjs` (capturas en `qa/`) y `node scripts/qa-layout.mjs` (superposiciones,
  4 tamaños × 3 páginas × 2 temas; debe terminar en "problemas: 0").
  Si Playwright usa otro Chromium, define `PW_CHROMIUM=/ruta/al/chromium`.

## Estructura clave
- `src/content/site.ts` datos del negocio · `src/content/vehicles.ts` inventario demo (ES/EN)
- `src/i18n/` idiomas y diccionarios · `src/app/[locale]/` home y fichas
  (`inventario/[slug]` en ES, `inventory/[slug]` en EN)
- `src/components/` Header, Hero, InventorySection, VehicleCard, ShareVehicleButton,
  LocationPreview (mapa), FloatingWhatsApp, SocialLinks, AnimatedEurocarsLogo, etc.
- `src/app/globals.css` tokens de tema y todos los efectos/animaciones (respetan reduced-motion)
- `docs/` auditoría, brief visual, contenido pendiente, mockup de referencia y video original del logo

## Estado
Es una DEMO para mostrar al cliente. Las fotos son recortes reescalados del mockup
(`docs/mockup-referencia.webp`) y los autos/precios/km, condiciones de crédito, horario,
calificación de Google (4.8 / 27) vienen del mockup SIN VERIFICAR (ver `docs/03-CONTENIDO-PENDIENTE.md`).
No inventar datos. `site.isPreview = true` mantiene `noindex`.

## Pendiente
- Fotos reales en alta resolución, logo vectorial, versión del video del logo con fondo negro o alfa
- Inventario real (pasar a CMS/DB), formulario de "Valuar mi auto", reseñas reales
- sitemap.xml, robots.txt, schema LocalBusiness/AutoDealer con datos reales, aviso de privacidad
- Verificar en un navegador real: mapa de Google y vista previa al compartir por WhatsApp/Facebook

## Despliegue
Vercel (proyecto `eurocars-merida-demo`) despliega al hacer push a la rama `claude/jolly-faraday-dc2c7q`.

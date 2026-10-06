# Eurocars Mérida — Digital Showroom (contexto para continuar en local)

Next.js 15 (App Router) · TypeScript · Tailwind v4 · fuentes self-hosted (Jost + Cormorant Garamond).
Idiomas `/es` y `/en` (middleware propio, sin librerías i18n). Temas Dark/Light con `data-theme`.

## Comandos
- `npm install` · `npm run dev` (http://localhost:3000) · `npm run build` · `npm run lint` · `npx tsc --noEmit`
- QA visual: `npx playwright install chromium`, luego con el sitio en `next start -p 3100`:
  `node scripts/screenshots.mjs` (capturas en `qa/`) y `node scripts/qa-layout.mjs` (superposiciones,
  4 tamaños × 3 páginas × 2 temas; debe terminar en "problemas: 0").
  Si Playwright usa otro Chromium, define `PW_CHROMIUM=/ruta/al/chromium`.

## Reglas de trabajo (obligatorias)
1. **No inventar datos.** Precios, reseñas, horarios, condiciones de crédito y autos no verificados
   se marcan como demo o pendiente (ver `docs/03-CONTENIDO-PENDIENTE.md`). Nunca presentarlos como reales.
2. **Alta gama:** la página debe verse premium e impresionante, con la fotografía como protagonista
   y animaciones cuidadas.
3. **Dos temas (Dark y Light) con la misma estructura**, y **dos idiomas (ES y EN)**. Todo cambio
   se aplica a los cuatro casos.
4. **Móvil primero.** Antes de dar algo por terminado, revisar celular, tablet y escritorio, en
   ambos temas, sin elementos encimados, textos cortados ni desbordes. Usar `scripts/qa-layout.mjs`
   y `scripts/screenshots.mjs`.
5. **Respetar `prefers-reduced-motion`** en toda animación o efecto nuevo.
6. **Reportar con claridad qué se verificó y qué no se pudo verificar** (p. ej. dominios bloqueados,
   mapa de Google, vista previa al compartir).

## Estructura clave
- `src/content/site.ts` datos del negocio
- Arquitectura UI → services → data (demo): `src/data/demo/vehicles.ts` (8 autos, todo dato desconocido en `null`),
  `src/services/inventory` (async, único acceso a vehículos; mañana Supabase), `src/services/favorites|compare`
  (localStorage vía `storage/local-list-store.ts`), `src/services/inquiries` (prueba de manejo demo)
- `VehiclePhoto` = placeholder "Fotografía pendiente" mientras `gallery` esté vacío (TEMPORAL; no reusar fotos de otros autos)
- Rutas: `/{es,en}/inventario|inventory/[slug]`, `favoritos|favorites`, `comparar|compare`
- Admin demo (`/admin-demo`, solo español, noindex por metadata + X-Robots-Tag): `src/app/admin-demo/`, `src/components/admin/`.
  Datos: `src/data/demo/crm.ts` (14 leads ficticios sobre el inventario demo; KPIs, pendientes, actividad e insight se DERIVAN de ahí),
  `src/services/crm`, `src/services/ai` (insight mock detrás de `InsightProvider`), `src/services/inventory/admin.ts`
  (overrides + vehículos agregados en localStorage; el dataset fuente nunca se modifica)
- Content Studio (Fase 4): `src/services/ai/` (contrato `ContentGenerator`, `mockContentGenerator`, `content-guard` anti-datos-inventados,
  borradores en localStorage) y `src/components/admin/studio/`. Detalle en `docs/06-CONTENT-STUDIO.md`
- CRM demo (Fase 5): `src/data/demo/crm.ts` (14 prospectos sobre los 8 vehículos reales) → `src/services/crm/rules.ts` (prioridad, seguimientos, resumen,
  insight: TODO se deriva de aquí) + `state.ts` (cambios en localStorage `ec-demo-crm-state`) · IA simulada `src/services/ai/crm-assistant.ts`.
  UI en `src/components/admin/crm/`. Pruebas: `node scripts/test-crm.mjs`, `node scripts/qa-crm.mjs`
- Asistente de ventas (Fase 6): `src/services/assistant/*` (types, rules-provider = motor determinístico, guard anti-invención, summary, index con AI_PROVIDER; Gemini NO implementado) + UI `src/components/assistant/*` (solo demo y ES).
  Crea prospectos "Asistente IA" vía `createAssistantLead` (`ec-demo-assistant-leads`; "Restaurar datos demo" los borra). Pruebas: `node scripts/test-assistant.mjs`, `node scripts/qa-assistant.mjs`
- Inventario REAL público: `src/data/demo/vehicles.ts` + `inventory-manifest.json` + `public/eurocars/inventory/<unidad>/NN.webp` (+ og.jpg),
  importado de `eurocarsmerida.com/api/vehicles` con `node scripts/import-public-inventory.mjs`. Dato ausente en la fuente = `null`.
  Prueba: `node scripts/test-real-inventory.mjs`
- Modo demo (`src/lib/demo-mode.ts`, `NEXT_PUBLIC_DEMO_MODE`; activo salvo `VERCEL_ENV=production`): WhatsApp nunca abre el número real
  (modal `DemoWhatsApp`), y calificación/reseñas/horario/teléfono/crédito/dirección sin verificar se ocultan o llevan "Dato demo".
  Probar con `node scripts/test-demo-mode.mjs` (y `--prod` con build `NEXT_PUBLIC_DEMO_MODE=0`)
- Pruebas: `node scripts/test-studio.mjs`, `node scripts/qa-studio.mjs`
- Pruebas: `node scripts/test-admin.mjs`, `node scripts/qa-admin.mjs` (1440/1024/768/430/390, Dark y Light)
- Pruebas: `node scripts/test-collections.mjs` (favoritos, comparador, prueba de manejo demo)
- `src/i18n/` idiomas y diccionarios · `src/app/[locale]/` home y fichas
  (`inventario/[slug]` en ES, `inventory/[slug]` en EN; ambas existen, hreflang correcto)
- `src/components/` Header, Hero, InventorySection, VehicleCard, ShareVehicleButton,
  LocationPreview (mapa), FloatingWhatsApp, SocialLinks, AnimatedEurocarsLogo, etc.
- `src/app/globals.css` tokens de tema y todos los efectos/animaciones (respetan reduced-motion)
- `docs/` auditoría, brief visual, contenido pendiente, mockup de referencia y video original del logo

## Estado
Rama de trabajo: `demo/eurocars-ai` (EUROCARS AI — Interactive Demo, por fases; sin push hasta aprobación).
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

# EUROCARS AI — Content Studio (Fase 4)

Ruta: `/admin-demo/panel/contenido-ia` (biblioteca) y `/admin-demo/panel/contenido-ia/[slug]` (Studio).
Promesa: *publica el vehículo una vez y Eurocars AI lo convierte en contenido para web, Google, redes y WhatsApp.*

## Arquitectura (UI → services → proveedor)
```
UI (components/admin/studio/*)
  └─ getContentGenerator()            src/services/ai/index.ts
       ├─ valida la forma del JSON     content-guard.ts → validateGeneratedContent
       ├─ audita "cero datos inventados" content-guard.ts → auditContent
       └─ proveedor activo (config.ts, AI_PROVIDER = "mock")
            ├─ mockContentGenerator      mock-content-generator.ts  ← hoy (plantillas)
            └─ geminiContentGenerator    (futuro) mismo contrato, devuelve JSON validable
```
- Contrato: `src/services/ai/content-types.ts` (`ContentGenerator`, `ContentFacts`, `GeneratedVehicleContent`).
  `GeneratedVehicleContent` es estructurado (`web`, `seo`, `social.{instagram,facebook,marketplace,whatsapp}`,
  `accessibility`, `english`, `meta`), no un string gigante: Gemini podrá devolver este JSON y se valida igual.
- `ContentFacts` (`vehicleToFacts`) son los ÚNICOS datos que el generador puede usar. `null` = no existe = no se menciona.
- Borradores: `content-drafts.ts` (localStorage `ec-demo-content-drafts`, por slug). Mañana: tabla en Supabase.
- No hay `.env`, claves ni llamadas de red. `AI_PROVIDER` es una constante interna.

## Regla fundamental: nunca inventar
- Solo marca, modelo, versión, año, clasificación editorial y datos explícitos (precio, km, color, motor, transmisión,
  tracción, características) cuando existen.
- Precio/km desconocidos → no se mencionan (Marketplace usa "Consultar"); el copy invita a consultarlos.
- Hashtags solo de marca, modelo, categoría editorial y ciudad.
- Sin ficha pública (vehículo agregado) → no se inventa enlace.
- Las características capturadas en español no se traducen: la versión EN las omite.
- `auditContent` rechaza: precio/km sin dato, cifras ajenas a los datos y afirmaciones tipo "caballos", "lujoso",
  "garantía", "turbo"… si no existen como dato.

## Variantes
Tonos Premium / Directo / Social × 2 variantes de redacción (`variant`). "Regenerar" avanza la variante; cambiar de
tono regenera. Las variantes cambian palabras, nunca datos.

## Para sustituir por Gemini (futuro)
1. Crear `geminiContentGenerator` (servidor) que arme el prompt desde `ContentFacts` y exija JSON con la forma de
   `GeneratedVehicleContent`.
2. Añadirlo en `baseGenerator()` y poner `AI_PROVIDER = "gemini"` (o leerlo de config del servidor).
3. `getContentGenerator()` ya valida forma y datos inventados: reintentar o rechazar si falla.
La UI no cambia.

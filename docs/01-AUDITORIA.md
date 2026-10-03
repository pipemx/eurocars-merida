# Fase 1 — Auditoría de fuentes (3 oct 2026)

## Limitación importante
El entorno de desarrollo bloquea por política de red: eurocarsmerida.com, instagram.com,
facebook.com, tiktok.com, Google Maps, waze.com y los directorios web. **Ninguna fuente oficial
pudo abrirse directamente.** Lo de abajo proviene de *fragmentos de buscador* (resúmenes de
terceros), no de las páginas oficiales. Nada de esto se publica como dato real hasta que
Eurocars lo confirme.

## Datos encontrados — estado

| Dato | Valor reportado | Fuente | Estado |
|---|---|---|---|
| Nombre comercial | Eurocars Mérida | Brief del cliente, Instagram/Facebook (títulos en buscador) | Probable |
| Teléfono / WhatsApp | +52 999 331 1140 | Brief + directorios | Probable (confirmar que es WhatsApp) |
| Servicios | Compra, venta, consignación; crédito | Brief + directorios | Probable |
| Plazo de crédito | "hasta 48 meses" | Directorios de terceros | **NO verificado — no publicar** |
| Buy Here Pay Here | Mencionado en el brief | — | **NO verificado** |
| Dirección | (a) Calle 9-A, Col. Santa Gertrudis Copó · (b) Calle 11 #299, Lateral Periférico Norte esq. Calle 8, Santa Gertrudis Copó | Directorios / Waze (fragmentos) | **CONFLICTO — confirmar** |
| Horario | (a) L–V 9:00–18:00, S 9:00–16:00 · (b) L 9–19, Ma–V 10–19, S 10–16 | Dos directorios distintos | **CONFLICTO — confirmar** |
| Rating Google | 4.8 / 27 reseñas (brief) vs 16 reseñas (directorio, fecha desconocida) | Brief / directorio | **Confirmar en Google Business Profile** |
| Razón social | "RL Ventas y Consignaciones SA de CV" (registro oct 2016) | Directorio (agenciasdeautos / guiamexican) | No verificado; útil para aviso de privacidad |
| Seguidores IG | ~16,000 | Fragmento de buscador | No verificado; no publicar |

Testimonios: los fragmentos ("Excelentes autos de confianza", "Muy profesionales") no tienen
autor ni fecha verificables → **no se usan**.

## Activos visuales
- Logo: solo existe una foto de render/mockup (logo metálico en muro). Se extrajo con máscara
  de luminancia sin redibujar (`public/eurocars/brand/logo-extracted-light.*`) y un recorte de la
  palabra (`wordmark-extracted-light.*`). **Se necesita el archivo vectorial original (AI/SVG/PDF)**
  para producción y para un favicon/isotipo legítimo.
- Fotografía de vehículos / showroom: **ninguna disponible**. Se usan fondos neutros de estudio
  generados (sin autos) marcados como placeholder.

## Pendiente del cliente
1. Fotos reales en alta (hero en showroom, inventario, interior, entrega de llaves, fachada).
2. Logo vectorial.
3. Dirección y horario oficiales; confirmar WhatsApp.
4. Condiciones reales de financiamiento (plazos, enganche, instituciones) y si BHPH sigue vigente.
5. Inventario actual (marca, modelo, versión, año, km, precio, estatus).
6. Destino de leads del formulario (WhatsApp, correo, CRM).
7. Permiso para usar 3–4 publicaciones de redes.

# Fase 2 — Brief de dirección visual (1 página)

**Idea:** *Digital showroom editorial.* La pantalla es una sala oscura; la fotografía es la única
fuente de luz. La interfaz es tipografía, reglas finas y espacio — nada de tarjetas con relleno,
sombras, glow ni pills.

**Referencia mental:** revista automotriz impresa + ficha técnica de casa de subastas, no un lote.

**Color.** Carbón #0A0B0B como lienzo, #101112/#171819 para cambios de plano. Texto blanco
cálido #F3F1EC; metadatos gris #9A9A96. Champagne #C7A66A en ≤ 3 lugares por pantalla: CTA
primario, precio, estado activo / regla editorial. Una sola sección clara (Confianza) en
#F3F1EC rompe el ritmo.

**Tipografía (2 familias, self-hosted).** *Archivo* variable (grotesca con eje de ancho):
semi-condensada y en mayúsculas para titulares, normal para UI y datos con cifras tabulares.
*Instrument Serif* itálica solo como acento editorial (una frase por sección, nunca en UI).
Escala amplia: H1 hasta ~9rem en desktop, eyebrows de 11–12px con tracking 0.28em.

**Composición.** Retícula de 12 columnas, márgenes generosos (24px móvil / 56–80px desktop).
Numeración editorial de sección (01, 02…) y reglas de 1px como estructura. Cada sección cambia
de composición (hero a sangre → retícula de inventario → split → franja horizontal → sección
clara) para evitar la repetición de plantilla.

**Inventario.** Sin cajas: la foto (3:2, esquinas rectas) es la tarjeta. Debajo, marca en
versalitas, modelo grande, línea de datos con separadores "·", precio en champagne y
"Ver vehículo →". Toda el área clicable. Hover: zoom 2–3 %, leve subida de contraste, flecha
+4px. Filtros como texto subrayado, no pills. Móvil: carrusel con scroll-snap mostrando ~85 %
de la siguiente foto como invitación.

**Movimiento.** Solo fade/translate 16px, 500ms, `cubic-bezier(.2,.7,.2,1)`; respeta
`prefers-reduced-motion`. Sin parallax, sin cursor custom, sin animación continua.

**Conversión.** WhatsApp contextual en cada punto de decisión (vehículo, financiamiento, venta).
En móvil: botón compacto de WhatsApp en el header; en la ficha, barra sticky inferior.

**Honestidad.** Ningún dato no verificado se presenta como real: placeholders visibles,
`noindex` mientras el sitio tenga datos de ejemplo.

**Prueba anti-plantilla por sección:** ¿la foto domina? ¿hay ≤1 acento champagne por bloque?
¿cero cajas con fondo/sombra? ¿la sección se distingue de la anterior?

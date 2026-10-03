# Eurocars Mérida — Digital Showroom

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · fuentes self-hosted (Archivo, Instrument Serif).

**Estado: Fase 3–5 (header + hero + inventario destacado) para revisión de dirección visual.**
Todo el contenido de vehículos y las fotos son **de ejemplo** (`isPlaceholder`); el sitio emite
`noindex` mientras `site.isPreview = true`.

- Auditoría de fuentes: `docs/01-AUDITORIA.md`
- Brief visual: `docs/02-BRIEF-VISUAL.md`
- Capturas QA: `qa/` (regenerar con `npm run build && npx next start -p 3100` y `node scripts/screenshots.mjs`)

```bash
npm install
npm run dev
```

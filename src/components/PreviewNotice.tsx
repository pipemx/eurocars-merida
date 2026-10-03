import { site } from "@/content/site";

/** Aviso mínimo mientras el sitio muestra contenido del mockup sin verificar. */
export function PreviewNotice() {
  if (!site.isPreview) return null;
  return (
    <p className="fixed bottom-3 left-3 z-40 rounded-[2px] bg-carbon/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-bone/55 backdrop-blur">
      Vista previa · contenido del mockup sin verificar
    </p>
  );
}

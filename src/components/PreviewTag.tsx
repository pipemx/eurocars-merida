import { site } from "@/content/site";

/** Marca visible de contenido de ejemplo. Desaparece cuando site.isPreview = false. */
export function PreviewTag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  if (!site.isPreview) return null;
  return (
    <span
      className={`pointer-events-none inline-block border border-bone/25 bg-carbon/60 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-bone/70 ${className}`}
    >
      {children}
    </span>
  );
}

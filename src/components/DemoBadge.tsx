/** Etiqueta discreta: el dato mostrado no está verificado (demostración). */
export function DemoBadge({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-current/30 px-2 py-[3px] text-[9.5px] font-medium uppercase leading-none tracking-[0.16em] opacity-70 ${className}`}>
      {label}
    </span>
  );
}

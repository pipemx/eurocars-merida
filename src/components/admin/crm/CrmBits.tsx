"use client";

import { Info } from "lucide-react";
import type { LeadStatus, Priority } from "@/types/crm";
import { PRIORITY_LABEL, PRIORITY_TOOLTIP, STATUS_LABEL, STATUS_ORDER, type FollowUpGroup } from "@/services/crm/rules";

const priorityStyle: Record<Priority, string> = {
  alta: "border-[#e0735a]/60 text-[#e0735a]",
  media: "border-accent/60 text-accent",
  normal: "border-line-strong/50 text-muted",
  cerrado: "border-line-strong/40 text-muted",
};

/** Prioridad DEMO calculada con reglas simples (ver "¿Cómo se calcula?"). Nunca es una predicción. */
export function PriorityChip({ level, reason, className = "" }: { level: Priority; reason?: string; className?: string }) {
  return (
    <span
      data-priority={level}
      title={`${PRIORITY_TOOLTIP}${reason ? ` Motivo: ${reason}.` : ""}`}
      aria-label={`Prioridad ${PRIORITY_LABEL[level]}${reason ? `: ${reason}` : ""}. ${PRIORITY_TOOLTIP}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium uppercase leading-none tracking-[0.14em] ${priorityStyle[level]} ${className}`}
    >
      {PRIORITY_LABEL[level]}
      <Info className="h-3 w-3 opacity-60" strokeWidth={1.6} aria-hidden />
    </span>
  );
}

const statusDot: Record<LeadStatus, string> = {
  nuevo: "bg-accent",
  contactado: "bg-ink/50",
  seguimiento: "bg-[#e0a35a]",
  cita: "bg-[#4caf7a]",
  negociacion: "bg-[#6aa0e0]",
  vendido: "bg-muted",
};

export function LeadStatusChip({ status }: { status: LeadStatus }) {
  return (
    <span data-lead-status={status} className="inline-flex items-center gap-2 text-[13px] text-ink/85">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Selector de estado (ficha del prospecto). */
export function LeadStatusSelect({ value, onChange, id = "lead-status" }: { value: LeadStatus; onChange: (s: LeadStatus) => void; id?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] uppercase tracking-[0.22em] text-muted">
        Estado
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as LeadStatus)} className="mt-2 block min-h-12 w-full min-w-[200px] border border-line-strong/50 bg-bg px-4 text-[15px] text-ink outline-none transition-colors focus:border-accent">
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

export const groupStyle: Record<FollowUpGroup, { dot: string; label: string }> = {
  overdue: { dot: "bg-[#e0735a]", label: "Vencidos" },
  today: { dot: "bg-[#e0a35a]", label: "Hoy" },
  upcoming: { dot: "bg-[#4caf7a]", label: "Próximos" },
};

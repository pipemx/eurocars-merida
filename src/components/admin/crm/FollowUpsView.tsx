"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Check } from "lucide-react";
import { ACTION_LABEL, followUpGroup, followUpReason, priorityOf, type EffectiveLead, type FollowUpGroup } from "@/services/crm/rules";
import { setFollowUpDone } from "@/services/crm/state";
import { Avatar, DemoTag, PageHeader } from "../AdminBits";
import { useAdmin } from "../AdminProviders";
import { PriorityChip, groupStyle } from "./CrmBits";

const BASE = "/admin-demo/panel";

const empty: Record<FollowUpGroup, string> = {
  overdue: "Nada vencido. Buen trabajo.",
  today: "No hay seguimientos ni citas para hoy.",
  upcoming: "No hay seguimientos próximos.",
};

/** Etiqueta del botón principal según el bloque y la acción programada. */
function primaryLabel(group: FollowUpGroup, l: EffectiveLead) {
  if (group === "overdue") return "Dar seguimiento";
  if (group === "today") return l.followUp?.action === "reply" ? "Responder" : "Abrir prospecto";
  return l.appointment && l.appointment.dayOffset >= 0 ? "Ver cita" : "Abrir prospecto";
}

export function FollowUpsView() {
  const { leads, vehicleNames, toast } = useAdmin();

  const groups = useMemo(() => {
    const out: Record<FollowUpGroup, EffectiveLead[]> = { overdue: [], today: [], upcoming: [] };
    for (const l of leads) {
      const g = followUpGroup(l);
      if (g) out[g].push(l);
    }
    const t = (l: EffectiveLead) => (l.appointment?.dayOffset === 0 ? l.appointment.time : l.followUp?.time ?? "99:99");
    out.overdue.sort((a, b) => (a.followUp?.dayOffset ?? 0) - (b.followUp?.dayOffset ?? 0) || (a.followUp?.time ?? "").localeCompare(b.followUp?.time ?? ""));
    out.today.sort((a, b) => t(a).localeCompare(t(b)));
    out.upcoming.sort((a, b) => (a.appointment?.dayOffset ?? a.followUp?.dayOffset ?? 9) - (b.appointment?.dayOffset ?? b.followUp?.dayOffset ?? 9) || t(a).localeCompare(t(b)));
    return out;
  }, [leads]);

  const total = groups.overdue.length + groups.today.length + groups.upcoming.length;

  return (
    <div>
      <PageHeader eyebrow="CRM" title="Seguimientos">
        <DemoTag label="Datos demo" />
      </PageHeader>
      <p className="rise mt-6 max-w-[62ch] text-[15px] leading-relaxed text-ink/85" style={{ "--d": "80ms" } as React.CSSProperties}>
        {groups.overdue.length + groups.today.length} {groups.overdue.length + groups.today.length === 1 ? "persona necesita" : "personas necesitan"} atención hoy
        {groups.overdue.length > 0 && <>, {groups.overdue.length} con seguimiento vencido</>}. Nada se envía desde aquí: cada acción abre el prospecto.
      </p>

      <div className="mt-10 space-y-14">
        {(["overdue", "today", "upcoming"] as const).map((g, gi) => (
          <section key={g} aria-labelledby={`g-${g}`} data-group={g} className="rise" style={{ "--d": `${120 + gi * 60}ms` } as React.CSSProperties}>
            <h2 id={`g-${g}`} className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em]">
              <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${groupStyle[g].dot}`} />
              {groupStyle[g].label}
              <span className="font-normal tabular-nums text-muted">{groups[g].length}</span>
            </h2>
            {groups[g].length === 0 ? (
              <p className="mt-4 border-l border-line-strong/50 pl-5 text-[14.5px] text-muted">{empty[g]}</p>
            ) : (
              <ul className="mt-4 border-t border-line">
                {groups[g].map((l) => {
                  const v = vehicleNames(l.vehicleSlug);
                  const pr = priorityOf(l);
                  const label = primaryLabel(g, l);
                  const href = `${BASE}/prospectos/${l.id}${label === "Dar seguimiento" || label === "Responder" ? "?accion=sugerir" : ""}`;
                  return (
                    <li key={l.id} data-followup={l.id} className="border-b border-line py-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <Avatar name={l.name} />
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[17px] font-medium">
                              {l.name}
                              <PriorityChip level={pr.level} reason={pr.reason} />
                            </p>
                            <p className="mt-0.5 break-words text-[14px] text-accent">{v.full}</p>
                            <p className="mt-1 text-[13.5px] text-ink/80">{followUpReason(l)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">
                          <Link href={href} className="btn-ghost group w-full !min-h-11 !px-5 sm:w-auto">
                            {label} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.6} aria-hidden />
                          </Link>
                          {l.followUp && (
                            <button
                              type="button"
                              data-mark-done={l.id}
                              onClick={() => {
                                setFollowUpDone(l.id, true);
                                toast(`Seguimiento de ${l.name} marcado como hecho (solo en este navegador, demo).`);
                              }}
                              aria-label={`Marcar como hecho el seguimiento de ${l.name}`}
                              className="inline-flex min-h-11 items-center justify-center gap-2 px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/70 hover:text-accent"
                            >
                              <Check className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Hecho
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
      {total === 0 && <p className="mt-10 font-serif text-[1.4rem] italic">Sin seguimientos pendientes.</p>}
      <p className="mt-12 text-[12.5px] text-muted">{ACTION_LABEL.follow_up}, responder o revisar abren el prospecto con una acción simulada. No se envía ningún mensaje.</p>
    </div>
  );
}

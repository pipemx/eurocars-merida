"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Search, X } from "lucide-react";
import { agoLong } from "@/lib/admin-format";
import { resetCrmState } from "@/services/crm/state";
import { PRIORITY_RULES, PRIORITY_LABEL, SOURCE_LABEL, followUpGroup, followUpReason, isClosed, priorityOf, priorityRank, summarizeLeads, type EffectiveLead } from "@/services/crm/rules";
import { Avatar, DemoTag, PageHeader } from "../AdminBits";
import { useAdmin } from "../AdminProviders";
import { Modal } from "../Modal";
import { LeadStatusChip, PriorityChip, groupStyle } from "./CrmBits";

const BASE = "/admin-demo/panel";

type FilterId = "todos" | "nuevos" | "seguimiento" | "citas" | "negociacion";
const FILTERS: { id: FilterId; label: string; match: (l: EffectiveLead) => boolean }[] = [
  { id: "todos", label: "Todos", match: () => true },
  { id: "nuevos", label: "Nuevos", match: (l) => l.status === "nuevo" },
  { id: "seguimiento", label: "Seguimiento", match: (l) => l.status === "seguimiento" },
  { id: "citas", label: "Citas", match: (l) => l.status === "cita" || Boolean(l.appointment && !isClosed(l)) },
  { id: "negociacion", label: "Negociación", match: (l) => l.status === "negociacion" },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function LeadsView() {
  const { leads, vehicleNames, hasCrmChanges, toast } = useAdmin();
  const [filter, setFilter] = useState<FilterId>("todos");
  const [q, setQ] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  // ?filtro=nuevos|seguimiento|citas|negociacion y ?q=texto (enlaces desde el dashboard)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const f = sp.get("filtro") as FilterId | null;
    if (f && FILTERS.some((x) => x.id === f)) setFilter(f);
    const query = sp.get("q");
    if (query) setQ(query);
  }, []);

  const sum = useMemo(() => summarizeLeads(leads), [leads]);
  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, leads.filter(f.match).length])) as Record<FilterId, number>, [leads]);

  const list = useMemo(() => {
    const active = FILTERS.find((f) => f.id === filter)!;
    const needle = norm(q.trim());
    return leads
      .filter(active.match)
      .filter((l) => {
        if (!needle) return true;
        const v = vehicleNames(l.vehicleSlug);
        return norm(`${l.name} ${v.full} ${v.short} ${SOURCE_LABEL[l.source]}`).includes(needle);
      })
      .sort((a, b) => priorityRank(a) - priorityRank(b) || b.lastInteraction.minutesAgo - a.lastInteraction.minutesAgo);
  }, [leads, filter, q, vehicleNames]);

  return (
    <div>
      <PageHeader eyebrow="CRM" title="Prospectos">
        <DemoTag label="Datos demo" />
      </PageHeader>

      <p className="rise mt-6 text-[15px] text-ink/85" style={{ "--d": "80ms" } as React.CSSProperties}>
        {sum.active} prospectos activos · <span className="text-accent">{sum.pendientes} requieren atención hoy</span>
        {sum.vencidos > 0 && <> · {sum.vencidos} con seguimiento vencido</>}
      </p>

      <div className="rise mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" style={{ "--d": "120ms" } as React.CSSProperties}>
        <div role="group" aria-label="Filtrar prospectos" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <button key={f.id} type="button" aria-pressed={on} data-filter={f.id} onClick={() => setFilter(f.id)} className={`min-h-11 shrink-0 border px-4 text-[13px] transition-colors ${on ? "border-accent bg-accent/10 text-accent" : "border-line-strong/50 text-ink/80 hover:border-ink/60"}`}>
                {f.label} <span className="ml-1 tabular-nums opacity-60">{counts[f.id]}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full lg:w-[320px]">
          <label htmlFor="lead-search" className="sr-only">
            Buscar por nombre, vehículo u origen
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.6} aria-hidden />
          <input id="lead-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre, vehículo u origen" autoComplete="off" className="block min-h-11 w-full border border-line-strong/50 bg-transparent pl-11 pr-11 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent" />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Limpiar búsqueda" className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-muted hover:text-ink">
              <X className="h-4 w-4" strokeWidth={1.6} />
            </button>
          )}
        </div>
      </div>

      <div className="rise mt-6" style={{ "--d": "160ms" } as React.CSSProperties}>
        <div role="row" className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_130px_100px_minmax(0,1fr)_auto] items-center gap-5 border-b border-line-strong/50 pb-3 text-[11px] uppercase tracking-[0.22em] text-muted xl:grid">
          <span>Prospecto</span>
          <span>Vehículo</span>
          <span>Estado</span>
          <span>Prioridad</span>
          <span>Próximo paso</span>
          <span className="w-[110px]" />
        </div>
        {list.length === 0 ? (
          <p role="status" className="mt-8 border-l border-accent pl-6 font-serif text-[1.5rem] italic">
            Ningún prospecto coincide con el filtro o la búsqueda.
          </p>
        ) : (
          <ul data-lead-list>
            {list.map((l) => {
              const v = vehicleNames(l.vehicleSlug);
              const pr = priorityOf(l);
              const g = followUpGroup(l);
              const href = `${BASE}/prospectos/${l.id}`;
              return (
                <li key={l.id} data-lead={l.id} className="border-b border-line">
                  <div className="grid items-center gap-x-5 gap-y-3 py-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_130px_100px_minmax(0,1fr)_auto]">
                    <div className="flex min-w-0 items-start gap-4">
                      <Avatar name={l.name} />
                      <div className="min-w-0">
                        <Link href={href} className="block break-words text-[17px] font-medium leading-snug hover:text-accent">
                          {l.name}
                        </Link>
                        <p className="mt-0.5 text-[12.5px] text-muted">
                          {SOURCE_LABEL[l.source]} · {l.lastInteraction.label} · {agoLong(l.lastInteraction.minutesAgo)}
                        </p>
                      </div>
                      <PriorityChip level={pr.level} reason={pr.reason} className="ml-auto shrink-0 xl:hidden" />
                    </div>
                    <p className="min-w-0 break-words text-[14.5px] text-accent">{v.full}</p>
                    <div className="flex items-center justify-between gap-3 xl:block">
                      <LeadStatusChip status={l.status} />
                    </div>
                    <div className="hidden xl:block">
                      <PriorityChip level={pr.level} reason={pr.reason} />
                    </div>
                    <p className="flex min-w-0 items-start gap-2 text-[13.5px] text-ink/85">
                      {g && <span aria-hidden className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${groupStyle[g].dot}`} />}
                      <span>{followUpReason(l)}</span>
                    </p>
                    <div className="xl:flex xl:w-[110px] xl:justify-end">
                      <Link href={href} className="btn-ghost group w-full !min-h-11 !px-4 xl:w-auto">
                        Abrir <ArrowRight className="arrow h-4 w-4" strokeWidth={1.6} aria-hidden />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-10 grid gap-6 border-t border-line pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <details className="group max-w-[640px] text-[13.5px] text-ink/80">
          <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/75 hover:text-ink">¿Cómo se calcula la prioridad?</summary>
          <p className="mt-2 text-muted">Prioridad demo calculada a partir del estado y seguimiento. No es una predicción: son reglas simples y visibles.</p>
          <ul className="mt-3 space-y-2">
            {PRIORITY_RULES.map((r) => (
              <li key={r.level}>
                <span className="font-medium">{PRIORITY_LABEL[r.level]}:</span> {r.rules.join(" · ")}
              </li>
            ))}
          </ul>
        </details>
        {hasCrmChanges && (
          <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:text-ink">
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Restaurar datos demo
          </button>
        )}
      </div>

      {confirmReset && (
        <Modal title="Restaurar datos demo" eyebrow="Confirmación" onClose={() => setConfirmReset(false)}>
          <p className="text-[15px] leading-relaxed text-ink/85">Se descartarán los cambios de estado, notas y seguimientos que hiciste, y el CRM volverá a los prospectos originales de la demo.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              className="btn-primary w-full sm:w-auto"
              onClick={() => {
                resetCrmState();
                setConfirmReset(false);
                toast("CRM restaurado a los datos demo.");
              }}
            >
              Restaurar
            </button>
            <button type="button" data-autofocus className="btn-ghost w-full sm:w-auto" onClick={() => setConfirmReset(false)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

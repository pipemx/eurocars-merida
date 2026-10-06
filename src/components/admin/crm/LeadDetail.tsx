"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ExternalLink, FileText, RefreshCw, Sparkles, StickyNote } from "lucide-react";
import { agoLong, formatSaved } from "@/lib/admin-format";
import { getCrmAssistant, type CrmAssistContext } from "@/services/ai";
import { ACTION_LABEL, SOURCE_LABEL, followUpGroup, followUpReason, isClosed, leadTimeline, nextActionHint, priorityOf } from "@/services/crm/rules";
import { addLeadNote, setFollowUpDone, setLeadStatus } from "@/services/crm/state";
import { VehiclePhoto } from "../../VehiclePhoto";
import { Avatar, DemoTag, Eyebrow } from "../AdminBits";
import { useAdmin } from "../AdminProviders";
import { EditableBlock } from "../studio/EditableBlock";
import { LeadStatusSelect, PriorityChip, groupStyle } from "./CrmBits";

const BASE = "/admin-demo/panel";
const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</dt>
      <dd className="mt-1.5 break-words text-[15px]">{children}</dd>
    </div>
  );
}

/** Ficha del prospecto: estado, vehículo, qué hacer ahora, asistencia IA (simulada), línea de tiempo y notas locales. */
export function LeadDetail({ id }: { id: string }) {
  const { leads, vehicles, vehicleNames, toast } = useAdmin();
  const lead = leads.find((l) => l.id === id);
  const vehicle = lead ? vehicles.find((v) => v.slug === lead.vehicleSlug) : undefined;

  const [hydrated, setHydrated] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [replyVariant, setReplyVariant] = useState(0);
  const [summary, setSummary] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<null | "reply" | "summary">(null);
  const [note, setNote] = useState("");
  const aiRef = useRef<HTMLElement>(null);
  const autoRan = useRef(false);

  useEffect(() => setHydrated(true), []);

  const ctx: CrmAssistContext | null = useMemo(
    () =>
      lead
        ? {
            name: lead.name,
            vehicleFullName: vehicleNames(lead.vehicleSlug).full,
            price: vehicle?.price ?? null,
            mileage: vehicle?.mileage ?? null,
            source: lead.source,
            status: lead.status,
            lastInteraction: lead.lastInteraction,
            followUp: lead.followUpDone ? null : lead.followUp,
            appointment: lead.appointment,
            notesCount: lead.notes.length,
            aiSummary: lead.aiSummary,
          }
        : null,
    [lead, vehicle, vehicleNames],
  );

  const suggest = useCallback(
    async (variant: number) => {
      if (!ctx) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setBusy("reply");
      const [text] = await Promise.all([getCrmAssistant().suggestReply(ctx, { variant }), wait(reduce ? 0 : 700)]);
      setReply(text);
      setReplyVariant(variant);
      setBusy(null);
    },
    [ctx],
  );

  const summarize = useCallback(async () => {
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBusy("summary");
    const [lines] = await Promise.all([getCrmAssistant().summarizeConversation(ctx), wait(reduce ? 0 : 600)]);
    setSummary(lines);
    setBusy(null);
  }, [ctx]);

  // ?accion=sugerir (desde "Dar seguimiento" / "Responder"): abre la asistencia con la respuesta ya sugerida
  useEffect(() => {
    if (!hydrated || !lead || autoRan.current) return;
    autoRan.current = true;
    if (new URLSearchParams(window.location.search).get("accion") === "sugerir") {
      void suggest(0);
      window.setTimeout(() => aiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [hydrated, lead, suggest]);

  if (!lead) {
    return (
      <div>
        <Link href={`${BASE}/prospectos`} className="inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:text-ink">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Prospectos
        </Link>
        {hydrated ? (
          <div className="mt-10 border-l border-accent pl-6">
            <p className="font-serif text-[1.8rem] italic">No encontramos este prospecto</p>
          </div>
        ) : (
          <div aria-hidden className="mt-10 h-40" />
        )}
      </div>
    );
  }

  const v = vehicleNames(lead.vehicleSlug);
  const pr = priorityOf(lead);
  const hint = nextActionHint(lead);
  const g = followUpGroup(lead);
  const hasOpenFollowUp = Boolean(lead.followUp) && !lead.followUpDone && !isClosed(lead);
  const timeline = leadTimeline(lead, v.full);

  const saveNote = () => {
    if (!note.trim()) return toast("Escribe una nota antes de guardarla.", "error");
    if (addLeadNote(lead.id, note)) {
      setNote("");
      toast("Nota guardada solo en este navegador (demo).");
    } else toast("No se pudo guardar: el navegador rechazó la escritura.", "error");
  };

  return (
    <div>
      <Link href={`${BASE}/prospectos`} className="group inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.6} aria-hidden /> Prospectos
      </Link>

      <header className="rise mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <Avatar name={lead.name} className="!h-16 !w-16 !text-[22px]" />
          <div className="min-w-0">
            <Eyebrow>Prospecto</Eyebrow>
            <h1 className="serif-title mt-3 break-words text-[clamp(2rem,4vw,3rem)] font-normal">{lead.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <PriorityChip level={pr.level} reason={pr.reason} />
              <span className="text-[13px] text-muted">{pr.reason}</span>
              <DemoTag label={lead.createdAt ? "Creado en la demo" : "Prospecto ficticio"} />
            </div>
          </div>
        </div>
        <LeadStatusSelect
          value={lead.status}
          onChange={(s) => {
            setLeadStatus(lead.id, s);
            toast("Estado actualizado solo en este navegador (demo).");
          }}
        />
      </header>

      <dl className="rise mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-6 lg:grid-cols-4" style={{ "--d": "80ms" } as React.CSSProperties}>
        <Fact label="Origen">
          {SOURCE_LABEL[lead.source]}
          {lead.phone && <span className="block text-[13px] text-muted">Tel. (demo): {lead.phone}</span>}
        </Fact>
        <Fact label="Fecha de entrada">{agoLong(lead.enteredMinutesAgo)}</Fact>
        <Fact label="Última interacción">
          {lead.lastInteraction.label}
          <span className="block text-[13px] text-muted">{agoLong(lead.lastInteraction.minutesAgo)}</span>
        </Fact>
        <Fact label="Próximo seguimiento">
          <span className="flex items-start gap-2">
            {g && <span aria-hidden className={`mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full ${groupStyle[g].dot}`} />}
            {isClosed(lead) ? "—" : lead.followUpDone ? "Marcado como hecho (demo)" : followUpReason(lead)}
          </span>
        </Fact>
      </dl>

      {vehicle && (
        <section aria-label="Vehículo de interés" className="rise mt-10 flex flex-col gap-5 border border-line bg-surface p-4 sm:flex-row sm:items-center sm:p-5" style={{ "--d": "120ms" } as React.CSSProperties}>
          <div className="relative aspect-[1.45] w-full shrink-0 overflow-hidden ring-1 ring-line sm:w-48 md:w-56">
            <VehiclePhoto vehicle={vehicle} image={vehicle.gallery[0]} sizes="224px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Vehículo de interés</p>
            <p className="serif-title mt-1 break-words text-[clamp(1.4rem,2.4vw,1.9rem)] font-normal">{v.full}</p>
            <p className="mt-2 text-[14px] text-ink/80">
              {vehicle.price !== null ? `$${nf.format(vehicle.price)} MXN` : "Precio a consultar"}
              {" · "}
              {vehicle.mileage !== null ? `${nf.format(vehicle.mileage)} km` : "Kilometraje a consultar"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {vehicle.origin === "demo" && (
                <a href={`/es/inventario/${vehicle.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
                  <ExternalLink className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Ver ficha pública
                </a>
              )}
              <Link href={`${BASE}/inventario/${vehicle.slug}`} className="inline-flex min-h-11 items-center text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/75 hover:text-ink">
                Ver en inventario
              </Link>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="hint-title" className="rise mt-8 border-l-2 border-accent bg-accent/[0.06] px-5 py-5" style={{ "--d": "160ms" } as React.CSSProperties}>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Qué hacer ahora</p>
        <h2 id="hint-title" data-hint className="serif-title mt-2 text-[1.6rem] font-normal">
          {hint.title}
        </h2>
        <p className="mt-2 max-w-[62ch] text-[14.5px] leading-relaxed text-ink/85">{hint.detail}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {!isClosed(lead) && (
            <button type="button" data-suggest onClick={() => { void suggest(0); aiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="btn-primary group w-full sm:w-auto">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Sugerir respuesta
            </button>
          )}
          {hasOpenFollowUp && (
            <button
              type="button"
              data-followup-done
              onClick={() => {
                setFollowUpDone(lead.id, true);
                toast("Seguimiento marcado como hecho (solo en este navegador, demo).");
              }}
              className="btn-ghost group w-full sm:w-auto"
            >
              <Check className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Marcar seguimiento como hecho
            </button>
          )}
          {lead.followUpDone && (
            <button type="button" onClick={() => setFollowUpDone(lead.id, false)} className="btn-ghost group w-full sm:w-auto">
              Reabrir seguimiento
            </button>
          )}
        </div>
        {lead.followUp && hasOpenFollowUp && <p className="mt-3 text-[12.5px] text-muted">Acción programada: {ACTION_LABEL[lead.followUp.action]}.</p>}
      </section>

      <div className="mt-12 grid gap-12 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:gap-14">
        {/* Asistencia IA (simulada) */}
        <section ref={aiRef} aria-labelledby="ai-title" className="min-w-0 scroll-mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id="ai-title" className="eyebrow flex items-center gap-3 text-accent">
              <Sparkles className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Eurocars AI
            </p>
            <DemoTag label="Generado con plantillas (demo)" />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => suggest(reply === null ? 0 : replyVariant + 1)} disabled={busy !== null} data-ai-reply className="btn-ghost group w-full !px-5 sm:w-auto">
              {reply === null ? <Sparkles className="h-4 w-4" strokeWidth={1.6} aria-hidden /> : <RefreshCw className="h-4 w-4" strokeWidth={1.6} aria-hidden />}
              {busy === "reply" ? "Preparando…" : reply === null ? "Sugerir respuesta" : "Otra versión"}
            </button>
            <button type="button" onClick={summarize} disabled={busy !== null} data-ai-summary className="btn-ghost group w-full !px-5 sm:w-auto">
              <FileText className="h-4 w-4" strokeWidth={1.6} aria-hidden /> {busy === "summary" ? "Resumiendo…" : "Resumir conversación"}
            </button>
          </div>

          {reply !== null && (
            <div className="mt-6" data-reply-block>
              <EditableBlock id="crm-reply" label="Respuesta sugerida" rows={7} value={reply} onChange={setReply} />
              <p className="mt-3 text-[12.5px] leading-snug text-muted">Simulado: no se envía ningún mensaje. Copia el texto, ajústalo si quieres y envíalo tú desde tu canal habitual.</p>
            </div>
          )}

          {summary && (
            <div className="mt-6 border-t border-line pt-5" data-summary-block>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Resumen de la conversación</p>
              <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed">
                {summary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="min-w-0 space-y-12">
          <section aria-labelledby="tl-title">
            <p id="tl-title" className="eyebrow flex items-center gap-4 text-muted">
              <span aria-hidden className="h-px w-8 bg-accent" />
              Línea de tiempo
            </p>
            <ol className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line" data-timeline>
              {timeline.map((e) => (
                <li key={e.id} className="relative pl-7">
                  <span aria-hidden className={`absolute left-0 top-[7px] h-[11px] w-[11px] rounded-full border ${e.pending ? "border-accent bg-bg" : "border-accent bg-accent"}`} />
                  <p className="text-[12.5px] text-muted">{e.when}</p>
                  <p className={`mt-0.5 text-[15px] ${e.pending ? "text-accent" : ""}`}>{e.text}</p>
                  {e.detail && (
                    <ul className="mt-1.5 space-y-1 text-[13.5px] text-ink/80" data-timeline-detail>
                      {e.detail.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="notes-title">
            <p id="notes-title" className="eyebrow flex items-center gap-4 text-muted">
              <span aria-hidden className="h-px w-8 bg-accent" />
              Notas
            </p>
            <label htmlFor="lead-note" className="mt-5 block text-[11px] uppercase tracking-[0.22em] text-muted">
              Agregar nota
            </label>
            <textarea id="lead-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 block w-full border border-line-strong/50 bg-transparent px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-accent" />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={saveNote} data-save-note className="btn-ghost group w-full !px-5 sm:w-auto">
                <StickyNote className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Guardar nota
              </button>
              <p className="text-[12.5px] text-muted">Guardado solo en este navegador (demo)</p>
            </div>
            {lead.notes.length > 0 && (
              <ul className="mt-6 space-y-4" data-notes>
                {lead.notes.map((n) => (
                  <li key={n.id} className="border-l border-accent pl-4">
                    <p className="whitespace-pre-wrap break-words text-[15px]">{n.text}</p>
                    <p className="mt-1 text-[12px] text-muted">{formatSaved(n.at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

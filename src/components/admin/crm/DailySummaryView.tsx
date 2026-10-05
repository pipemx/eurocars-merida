"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Monitor, Send, Smartphone } from "lucide-react";
import { agendaToday, deriveRisingInterest, followUpGroup, isClosed, priorityOf, summarizeLeads, type EffectiveLead } from "@/services/crm/rules";
import { DemoTag, PageHeader } from "../AdminBits";
import { useAdmin } from "../AdminProviders";

const BASE = "/admin-demo/panel";
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type Send = "idle" | "sending" | "done";

/**
 * Vista previa del correo diario. Todo se calcula a partir del CRM demo (mismos prospectos que el dashboard).
 * No hay envío real: en producción lo enviaría un proveedor de email + un scheduler.
 */
export function DailySummaryView() {
  const { leads, vehicleNames } = useAdmin();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [send, setSend] = useState<Send>("idle");
  const [today, setToday] = useState("");
  const timer = useRef(0);

  useEffect(() => {
    const s = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
    setToday(s.charAt(0).toUpperCase() + s.slice(1));
    return () => window.clearTimeout(timer.current);
  }, []);

  const sum = useMemo(() => summarizeLeads(leads), [leads]);
  const high = useMemo(() => {
    const rank = (l: EffectiveLead) => (followUpGroup(l) === "overdue" ? 0 : l.appointment?.dayOffset === 0 ? 1 : 2);
    return leads.filter((l) => priorityOf(l).level === "alta").sort((a, b) => rank(a) - rank(b));
  }, [leads]);
  const agenda = useMemo(() => agendaToday(leads, (slug) => vehicleNames(slug).short), [leads, vehicleNames]);
  const rising = useMemo(() => deriveRisingInterest(leads), [leads]);
  const negotiations = useMemo(() => leads.filter((l) => l.status === "negociacion"), [leads]);

  const opportunities: string[] = [];
  if (rising) {
    const n = vehicleNames(rising.vehicleSlug).short;
    opportunities.push(`El ${n} concentra ${plural(rising.activeLeadIds.length, "prospecto activo", "prospectos activos")}${rising.pendingLeadIds.length ? ` y ${rising.pendingLeadIds.length} ${rising.pendingLeadIds.length === 1 ? "requiere" : "requieren"} seguimiento` : ""}.`);
  }
  for (const l of negotiations) opportunities.push(`${l.name} está en negociación por el ${vehicleNames(l.vehicleSlug).short}.`);

  const simulate = () => {
    if (send === "sending") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setSend("done");
    setSend("sending");
    timer.current = window.setTimeout(() => setSend("done"), 1300);
  };

  const row = "px-1";
  const stat = (n: number, text: string) => (
    <li className="flex items-baseline gap-3">
      <span className="w-8 shrink-0 text-right text-[1.7rem] font-light leading-none tabular-nums text-[#9b7b45]">{n}</span>
      <span>{text}</span>
    </li>
  );

  return (
    <div>
      <PageHeader eyebrow="CRM" title="Resumen diario">
        <DemoTag label="Datos demo" />
      </PageHeader>
      <p className="rise mt-6 max-w-[64ch] text-[15px] leading-relaxed text-ink/85" style={{ "--d": "80ms" } as React.CSSProperties}>
        Así sería el correo que el equipo recibiría cada mañana. Se calcula con los mismos prospectos del panel: si cambias un estado o marcas un seguimiento como hecho, el resumen se actualiza.
      </p>

      <div className="rise mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" style={{ "--d": "120ms" } as React.CSSProperties}>
        <div role="group" aria-label="Vista previa del email" className="flex items-center gap-2">
          <span className="mr-2 text-[11px] uppercase tracking-[0.22em] text-muted">Vista previa del email</span>
          {([["desktop", "Escritorio", Monitor], ["mobile", "Móvil", Smartphone]] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" aria-pressed={device === id} onClick={() => setDevice(id)} className={`inline-flex min-h-11 items-center gap-2 border px-4 text-[12.5px] transition-colors ${device === id ? "border-accent bg-accent/10 text-accent" : "border-line-strong/50 text-ink/80 hover:border-ink/60"}`}>
              <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <button type="button" onClick={simulate} disabled={send === "sending"} data-simulate-send className="btn-primary group w-full !px-6 sm:w-auto">
          <Send className="h-4 w-4" strokeWidth={1.8} aria-hidden /> {send === "sending" ? "Simulando envío…" : "Simular envío"}
        </button>
      </div>

      <div aria-live="polite">
        {send === "done" && (
          <div data-send-result className="mt-5 flex items-start gap-3 border border-accent/50 bg-accent/[0.07] px-5 py-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} aria-hidden />
            <div>
              <p className="font-medium">Simulación completada.</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-ink/85">En producción este resumen podrá enviarse automáticamente cada mañana. No se envió ningún email.</p>
            </div>
          </div>
        )}
      </div>

      {/* "Cliente de correo": colores fijos claros, como se vería un email real */}
      <div className={`mx-auto mt-8 w-full ${device === "mobile" ? "max-w-[390px]" : "max-w-[720px]"} transition-[max-width] duration-500`}>
        <div className="overflow-hidden border border-line-strong/40 bg-[#e9e6df] shadow-[var(--shadow)]">
          <dl className="space-y-1 border-b border-black/10 px-5 py-4 text-[12.5px] text-[#4a4a47]">
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-[#7a7a76]">De</dt>
              <dd>Eurocars AI (demo)</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-[#7a7a76]">Para</dt>
              <dd>Equipo Eurocars (demo)</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-[#7a7a76]">Asunto</dt>
              <dd className="font-medium text-[#1a1a1a]">Resumen diario{today ? ` — ${today}` : ""}</dd>
            </div>
          </dl>

          <article data-email className="bg-white px-6 py-8 text-[#1a1a1a] sm:px-10" style={{ fontFamily: "var(--font-sans)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9b7b45]">Eurocars Mérida</p>
            <h2 className="mt-2 font-serif text-[2.1rem] uppercase leading-none tracking-[0.03em]">Resumen diario</h2>
            <span aria-hidden className="mt-4 block h-px w-14 bg-[#c6a66a]" />
            <p className="mt-6 text-[16px]">Buenos días.</p>
            <p className="mt-2 text-[15px] text-[#3a3a37]">Hoy requieren atención:</p>

            <ul data-email-stats className="mt-4 space-y-2.5 text-[15px]">
              {stat(sum.pendientes, plural(sum.pendientes, "prospecto pendiente", "prospectos pendientes").replace(/^\d+ /, ""))}
              {stat(sum.vencidos, plural(sum.vencidos, "seguimiento vencido", "seguimientos vencidos").replace(/^\d+ /, ""))}
              {stat(sum.citas, plural(sum.citas, "cita próxima", "citas próximas").replace(/^\d+ /, ""))}
              {stat(sum.negociaciones, plural(sum.negociaciones, "negociación activa", "negociaciones activas").replace(/^\d+ /, ""))}
            </ul>

            <h3 className="mt-9 border-t border-black/10 pt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9b7b45]">Prioridad alta</h3>
            {high.length === 0 ? (
              <p className="mt-3 text-[14.5px] text-[#5a5a56]">Sin prioridades altas por ahora.</p>
            ) : (
              <ul data-email-high className="mt-3 divide-y divide-black/10">
                {high.map((l) => {
                  const pr = priorityOf(l);
                  return (
                    <li key={l.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{l.name}</p>
                        <p className="break-words text-[14px] text-[#3a3a37]">{vehicleNames(l.vehicleSlug).title}</p>
                        <p className="text-[13px] text-[#8a5a3c]">{pr.reason}</p>
                      </div>
                      <Link href={`${BASE}/prospectos/${l.id}`} className="inline-flex min-h-11 shrink-0 items-center justify-center self-start bg-[#c6a66a] px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#15130f] sm:self-center">
                        Ver prospecto
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <h3 className="mt-9 border-t border-black/10 pt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9b7b45]">Agenda de hoy</h3>
            {agenda.length === 0 ? (
              <p className="mt-3 text-[14.5px] text-[#5a5a56]">No hay actividades con hora para hoy.</p>
            ) : (
              <ul data-email-agenda className="mt-3 space-y-2 text-[15px]">
                {agenda.map((a) => (
                  <li key={a.leadId} className={row}>
                    <Link href={`${BASE}/prospectos/${a.leadId}`} className="hover:underline">
                      <span className="font-medium tabular-nums">{a.time}</span> — {a.text}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mt-9 border-t border-black/10 pt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9b7b45]">Oportunidades</h3>
            {opportunities.length === 0 ? (
              <p className="mt-3 text-[14.5px] text-[#5a5a56]">Sin oportunidades destacadas.</p>
            ) : (
              <ul data-email-opps className="mt-3 space-y-2 text-[15px] leading-snug">
                {opportunities.map((o) => (
                  <li key={o}>“{o}”</li>
                ))}
              </ul>
            )}

            <Link href={BASE} className="mt-9 inline-flex min-h-12 items-center justify-center bg-[#15130f] px-7 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#f3f1ec]">
              Abrir panel
            </Link>
            <p className="mt-6 border-t border-black/10 pt-4 text-[11.5px] leading-snug text-[#7a7a76]">Correo de demostración con datos ficticios. En producción este resumen podrá enviarse automáticamente cada mañana.</p>
          </article>
        </div>
      </div>
      {leads.every(isClosed) && <p className="mt-6 text-[13px] text-muted">Todos los prospectos están cerrados.</p>}
    </div>
  );
}

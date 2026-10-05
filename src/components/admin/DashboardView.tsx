"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarCheck, Heart, MessageCircle, Share2, Sparkles } from "lucide-react";
import type { ActivityItem } from "@/types/crm";
import { ACTION_LABEL, deriveRisingInterest, followUpState, pendingFollowUps, summarizeLeads } from "@/services/crm/rules";
import { agoLong, agoShort } from "@/lib/admin-format";
import { Avatar, DemoTag, DueChip, Eyebrow } from "./AdminBits";
import { useAdmin } from "./AdminProviders";

const BASE = "/admin-demo/panel";

const activityMeta = {
  inquiry: { label: "Nueva consulta", icon: MessageCircle },
  share: { label: "Vehículo compartido", icon: Share2 },
  test_drive: { label: "Solicitud de prueba", icon: CalendarCheck },
  favorite: { label: "Favorito", icon: Heart },
} as const;

function TodayLabel() {
  const [text, setText] = useState("");
  useEffect(() => {
    const s = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
    setText(s.charAt(0).toUpperCase() + s.slice(1));
  }, []);
  return <span className="min-h-[1em]">{text}</span>;
}

type KpiProps = { label: string; value: number; unit: string; hint: string; href: string; delay: number };

function Kpi({ label, value, unit, hint, href, delay }: KpiProps) {
  return (
    <li className="rise relative" style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      <Link href={href} className="group relative flex h-full flex-col px-5 py-6 transition-colors hover:bg-ink/[0.03] md:px-7 md:py-8">
        <span aria-hidden className="absolute inset-x-5 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-x-100 md:inset-x-7" />
        <span className="eyebrow !tracking-[0.2em] text-muted">{label}</span>
        <span className="mt-4 flex items-baseline gap-2">
          <span data-kpi-value className="text-[clamp(3rem,5vw,4.2rem)] font-light tabular-nums leading-none tracking-tight">{value}</span>
          <span className="text-[13px] text-muted">{unit}</span>
        </span>
        <span className="mt-3 text-[13px] leading-snug text-ink/75">{hint}</span>
        <DemoTag className="mt-4 self-start" />
      </Link>
    </li>
  );
}

/** Dashboard: todo se calcula desde el CRM demo (mismos prospectos que Prospectos, Seguimientos y Resumen diario). */
export function DashboardView({ activity }: { activity: ActivityItem[] }) {
  const { leads, vehicleNames } = useAdmin();
  const sum = useMemo(() => summarizeLeads(leads), [leads]);
  const pending = useMemo(() => pendingFollowUps(leads), [leads]);
  const negotiations = useMemo(() => leads.filter((l) => l.status === "negociacion"), [leads]);
  const rising = useMemo(() => deriveRisingInterest(leads), [leads]);
  const risingPending = rising ? leads.filter((l) => rising.pendingLeadIds.includes(l.id)) : [];

  return (
    <div>
      <header className="rise flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>
            <TodayLabel />
          </Eyebrow>
          <h1 className="serif-title mt-4 text-[clamp(2.6rem,5.2vw,4.2rem)] font-normal">Buenos días 👋</h1>
          <p className="mt-3 max-w-[48ch] font-serif text-[clamp(1.25rem,2.2vw,1.6rem)] italic text-ink/85">Esto es lo que está pasando hoy en Eurocars.</p>
        </div>
        <DemoTag label="Entorno de demostración · datos ficticios" className="self-start md:self-auto" />
      </header>

      <section aria-label="Cifras del día" className="mt-10">
        <ul className="grid grid-cols-2 divide-x divide-y divide-line border border-line lg:grid-cols-4 lg:divide-y-0">
          <Kpi label="Prospectos nuevos" value={sum.nuevos} unit="sin atender" hint={`${sum.active} prospectos activos en total`} href={`${BASE}/prospectos?filtro=nuevos`} delay={80} />
          <Kpi label="Seguimientos pendientes" value={sum.pendientes} unit="personas" hint={sum.vencidos > 0 ? `${sum.vencidos} vencido${sum.vencidos > 1 ? "s" : ""} · ${sum.pendientes - sum.vencidos} para hoy` : "Todos para hoy"} href={`${BASE}/seguimientos`} delay={140} />
          <Kpi label="Citas" value={sum.citas} unit="agendadas" hint={`${sum.citasHoy} hoy · ${sum.citas - sum.citasHoy} próximas`} href={`${BASE}/prospectos?filtro=citas`} delay={200} />
          <Kpi
            label="Negociaciones"
            value={sum.negociaciones}
            unit="activas"
            hint={negotiations.length === 1 ? `${negotiations[0].name} · ${vehicleNames(negotiations[0].vehicleSlug).short}` : negotiations.length ? `${negotiations.length} prospectos negociando` : "Ninguna por ahora"}
            href={`${BASE}/prospectos?filtro=negociacion`}
            delay={260}
          />
        </ul>
      </section>

      <div className="mt-14 grid gap-14 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:gap-12">
        <section aria-labelledby="pendientes-title" className="rise min-w-0" style={{ "--d": "300ms" } as React.CSSProperties}>
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Pendientes de hoy</Eyebrow>
            <DemoTag />
          </div>
          <h2 id="pendientes-title" className="serif-title mt-3 text-[clamp(1.6rem,2.6vw,2.2rem)] font-normal">
            {pending.length} {pending.length === 1 ? "persona necesita" : "personas necesitan"} seguimiento
          </h2>
          {pending.length === 0 ? (
            <p className="mt-6 border-l border-accent pl-5 text-[15px] text-ink/80">No hay seguimientos pendientes. <Link href={`${BASE}/seguimientos`} className="text-accent underline-offset-4 hover:underline">Ver próximos</Link></p>
          ) : (
            <ul data-pending-list className="mt-6 border-t border-line">
              {pending.map((l) => {
                const act = l.followUp!.action;
                return (
                  <li key={l.id} data-pending={l.id} className="border-b border-line py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <Avatar name={l.name} />
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[17px] font-medium">
                            <Link href={`${BASE}/prospectos/${l.id}`} className="hover:text-accent">
                              {l.name}
                            </Link>
                            <DueChip state={followUpState(l.followUp!.dayOffset)} />
                          </p>
                          <Link href={`${BASE}/inventario/${l.vehicleSlug}`} className="mt-0.5 block break-words text-[14px] text-accent underline-offset-4 hover:underline">
                            {vehicleNames(l.vehicleSlug).title}
                          </Link>
                          <p className="mt-1 text-[13px] text-muted">
                            {l.lastInteraction.label} · {agoLong(l.lastInteraction.minutesAgo)}
                          </p>
                        </div>
                      </div>
                      <Link href={`${BASE}/prospectos/${l.id}${act === "review" ? "" : "?accion=sugerir"}`} className="btn-ghost group w-full shrink-0 !px-5 sm:w-auto">
                        {ACTION_LABEL[act]} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.6} aria-hidden />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="min-w-0 space-y-14">
          {rising && (
            <section aria-labelledby="insight-title" className="rise gold-edge group relative border border-line-strong/40 bg-surface p-6 md:p-7" style={{ "--d": "360ms" } as React.CSSProperties}>
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]" />
              <div className="flex items-center justify-between gap-3">
                <p id="insight-title" className="eyebrow flex items-center gap-3 text-accent">
                  <Sparkles className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Eurocars AI
                </p>
                <DemoTag label="Insight demo" />
              </div>
              <p data-insight className="mt-5 font-serif text-[1.55rem] italic leading-snug">
                El {vehicleNames(rising.vehicleSlug).title} tiene {rising.activeLeadIds.length} prospectos activos
                {rising.pendingLeadIds.length > 0 ? ` y ${rising.pendingLeadIds.length} ${rising.pendingLeadIds.length === 1 ? "requiere" : "requieren"} seguimiento` : ""}.
              </p>
              {risingPending.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
                  {risingPending.map((l) => (
                    <li key={l.id}>
                      <Link href={`${BASE}/prospectos/${l.id}`} className="flex items-center gap-2 hover:text-accent">
                        <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={`${BASE}/prospectos?q=${encodeURIComponent(vehicleNames(rising.vehicleSlug).short)}`} className="btn-primary group w-full sm:w-auto">
                  Ver prospectos <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
                </Link>
                <Link href={`${BASE}/contenido-ia/${rising.vehicleSlug}`} className="btn-ghost group w-full !px-5 sm:w-auto">
                  <Sparkles className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Crear contenido
                </Link>
              </div>
              <p className="mt-4 text-[11.5px] leading-snug text-muted">Calculado con reglas simples sobre los prospectos de la demo. En producción lo redactará la IA con los datos reales.</p>
            </section>
          )}

          <section aria-labelledby="actividad-title" className="rise" style={{ "--d": "420ms" } as React.CSSProperties}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <Eyebrow>Actividad reciente</Eyebrow>
                <h2 id="actividad-title" className="sr-only">Actividad reciente</h2>
              </div>
              <DemoTag />
            </div>
            <ol className="relative mt-6 space-y-6 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-px before:bg-line">
              {activity.map((a) => {
                const meta = activityMeta[a.kind];
                const Icon = meta.icon;
                const who = a.leadId ? leads.find((l) => l.id === a.leadId) : undefined;
                return (
                  <li key={a.id} className="relative flex gap-4">
                    <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong/50 bg-bg text-accent">
                      <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="flex items-baseline justify-between gap-3">
                        <span className="text-[14px] font-medium">{meta.label}</span>
                        <span className="shrink-0 text-[12px] text-muted">{agoShort(a.minutesAgo)}</span>
                      </p>
                      <p className="mt-0.5 break-words text-[14px] text-ink/80">{vehicleNames(a.vehicleSlug).title}</p>
                      {who && (
                        <p className="mt-0.5 text-[12.5px] text-muted">
                          <Link href={`${BASE}/prospectos/${who.id}`} className="hover:text-accent">{who.name}</Link>
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

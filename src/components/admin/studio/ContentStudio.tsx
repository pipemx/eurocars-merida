"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, RefreshCw, Save, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { formatSaved, vehicleTitle } from "@/lib/admin-format";
import {
  CONTENT_TONES,
  factsKey,
  getContentGenerator,
  vehicleToFacts,
  type ContentTone,
  type GeneratedVehicleContent,
} from "@/services/ai";
import { deleteContentDraft, saveContentDraft, useContentDrafts } from "@/services/ai/content-drafts";
import { priceLabel, mileageLabel, knownDetails } from "@/services/ai/content-facts";
import { VehiclePhoto } from "../../VehiclePhoto";
import { DemoTag } from "../AdminBits";
import { useAdmin } from "../AdminProviders";
import { Modal } from "../Modal";
import { AltPanel, EnglishPanel, FacebookPanel, InstagramPanel, MarketplacePanel, SeoPanel, WebPanel, WhatsappPanel, type PanelProps } from "./StudioPanels";

const BASE = "/admin-demo/panel";

const TABS = [
  { id: "web", label: "Descripción web", Panel: WebPanel },
  { id: "seo", label: "SEO", Panel: SeoPanel },
  { id: "instagram", label: "Instagram", Panel: InstagramPanel },
  { id: "facebook", label: "Facebook", Panel: FacebookPanel },
  { id: "marketplace", label: "Marketplace", Panel: MarketplacePanel },
  { id: "whatsapp", label: "WhatsApp", Panel: WhatsappPanel },
  { id: "alt", label: "Texto alternativo", Panel: AltPanel },
  { id: "english", label: "English", Panel: EnglishPanel },
] as const;
type TabId = (typeof TABS)[number]["id"];

const STEPS = ["Analizando información del vehículo…", "Preparando descripción…", "Optimizando contenido para buscadores…", "Preparando redes sociales…"];
const TOTAL_MS = 2600;

function setIn(content: GeneratedVehicleContent, path: string[], value: unknown): GeneratedVehicleContent {
  const root = structuredClone(content) as unknown as Record<string, unknown>;
  let cur = root;
  for (const key of path.slice(0, -1)) cur = cur[key] as Record<string, unknown>;
  cur[path[path.length - 1]] = value;
  return root as unknown as GeneratedVehicleContent;
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

type Phase = "idle" | "generating" | "done";

export function ContentStudio({ slug }: { slug: string }) {
  const { vehicles, toast } = useAdmin();
  const drafts = useContentDrafts();
  const draft = drafts[slug];
  const v = vehicles.find((x) => x.slug === slug);

  const [hydrated, setHydrated] = useState(false);
  const [origin, setOrigin] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState<ContentTone>("premium");
  const [variant, setVariant] = useState(0);
  const [content, setContent] = useState<GeneratedVehicleContent | null>(null);
  const [tab, setTab] = useState<TabId>("web");
  const [edited, setEdited] = useState(false);
  const [savedJson, setSavedJson] = useState<string | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const [confirm, setConfirm] = useState<null | { kind: "regen"; tone: ContentTone; variant: number } | { kind: "delete" }>(null);
  const loaded = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    setOrigin(window.location.origin);
    setHydrated(true);
    return () => {
      alive.current = false;
    };
  }, []);

  // Recupera el borrador guardado (una sola vez, ya con el estado local cargado).
  useEffect(() => {
    if (!hydrated || loaded.current || !v) return;
    loaded.current = true;
    if (draft) {
      setContent(draft.content);
      setTone(draft.tone);
      setVariant(draft.variant);
      setSavedJson(JSON.stringify(draft.content));
      setPhase("done");
      setRevealKey((k) => k + 1);
    }
  }, [hydrated, v, draft]);

  const facts = useMemo(() => (v ? vehicleToFacts(v, origin) : null), [v, origin]);
  const currentKey = useMemo(() => (facts ? factsKey(facts) : ""), [facts]);

  const run = useCallback(
    async (nextTone: ContentTone, nextVariant: number) => {
      if (!facts) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const total = reduce ? 0 : TOTAL_MS;
      setPhase("generating");
      setStep(0);
      const timers = reduce ? [] : [1, 2, 3].map((i) => window.setTimeout(() => alive.current && setStep(i), (i * total) / STEPS.length));
      try {
        // La generación mock es instantánea; la espera existe solo para mostrar el proceso en la demo.
        const [result] = await Promise.all([getContentGenerator().generate(facts, { tone: nextTone, variant: nextVariant }), wait(total)]);
        if (!alive.current) return;
        setContent(result);
        setTone(nextTone);
        setVariant(nextVariant);
        setEdited(false);
        setRevealKey((k) => k + 1);
        setPhase("done");
      } catch (e) {
        if (!alive.current) return;
        console.error(e);
        setPhase(content ? "done" : "idle");
        toast("No se pudo generar el contenido. Intenta de nuevo.", "error");
      } finally {
        timers.forEach((t) => window.clearTimeout(t));
      }
    },
    [facts, content, toast],
  );

  const requestRun = (nextTone: ContentTone, nextVariant: number) => {
    if (content && edited) return setConfirm({ kind: "regen", tone: nextTone, variant: nextVariant });
    void run(nextTone, nextVariant);
  };

  const update = useCallback((path: string[], value: unknown) => {
    setContent((c) => (c ? setIn(c, path, value) : c));
    setEdited(true);
  }, []);

  const saveDraft = () => {
    if (!content) return;
    const ok = saveContentDraft(slug, { content, tone, variant, savedAt: new Date().toISOString() });
    if (ok) {
      setSavedJson(JSON.stringify(content));
      toast("Borrador guardado solo en este navegador (demo).");
    } else toast("No se pudo guardar: el navegador rechazó la escritura.", "error");
  };

  const removeDraft = () => {
    deleteContentDraft(slug);
    setContent(null);
    setSavedJson(null);
    setEdited(false);
    setPhase("idle");
    setVariant(0);
    toast("Borrador eliminado.");
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const go = (n: number) => {
      const next = TABS[(n + TABS.length) % TABS.length].id;
      setTab(next);
      document.getElementById(`tab-${next}`)?.focus();
    };
    if (e.key === "ArrowRight") go(i + 1);
    else if (e.key === "ArrowLeft") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(TABS.length - 1);
    else return;
    e.preventDefault();
  };

  if (!v || !facts) {
    return (
      <div>
        <Link href={`${BASE}/contenido-ia`} className="inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:text-ink">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Contenido IA
        </Link>
        {hydrated ? (
          <div className="mt-10 border-l border-accent pl-6">
            <p className="font-serif text-[1.8rem] italic">No encontramos este vehículo</p>
            <p className="mt-2 text-[15px] text-muted">Puede que lo hayas restaurado o que pertenezca a otro navegador.</p>
          </div>
        ) : (
          <div aria-hidden className="mt-10 h-40" />
        )}
      </div>
    );
  }

  const title = vehicleTitle(v);
  const stale = content !== null && content.meta.factsKey !== currentKey;
  const unsaved = content !== null && JSON.stringify(content) !== savedJson;
  const known = knownDetails(facts, "es", { includeYear: false, includePriceKm: false });
  const missing = [facts.price === null && "precio", facts.mileage === null && "kilometraje", !facts.color && "color", !facts.engine && "motor", !facts.transmission && "transmisión"].filter(Boolean) as string[];
  const panelProps: PanelProps | null = content ? { content, facts, vehicle: v, image: v.gallery[0], update } : null;
  const ActivePanel = TABS.find((t) => t.id === tab)!.Panel;

  return (
    <div>
      <Link href={`${BASE}/contenido-ia`} className="group inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.6} aria-hidden /> Contenido IA
      </Link>

      <header className="rise mt-4">
        <p className="eyebrow flex items-center gap-4 text-accent">
          <Sparkles className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Eurocars AI
        </p>
        <h1 className="serif-title mt-4 text-[clamp(2.4rem,5vw,3.8rem)] font-normal">Content Studio</h1>
        <p className="mt-4 max-w-[62ch] font-serif text-[clamp(1.2rem,2vw,1.55rem)] italic leading-snug text-ink/85">
          Publica el vehículo una sola vez y Eurocars AI transforma esa información en contenido listo para web, Google, redes sociales y WhatsApp.
        </p>
      </header>

      {/* Vehículo seleccionado */}
      <section aria-label="Vehículo seleccionado" className="rise mt-8 flex flex-col gap-5 border border-line bg-surface p-4 sm:flex-row sm:items-center sm:p-5" style={{ "--d": "100ms" } as React.CSSProperties}>
        <div className="relative aspect-[1.45] w-full shrink-0 overflow-hidden ring-1 ring-line sm:w-48 md:w-56">
          <VehiclePhoto vehicle={v} image={v.gallery[0]} sizes="224px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{v.brand}</p>
          <p className="serif-title mt-1 break-words text-[clamp(1.5rem,2.6vw,2.1rem)] font-normal">{`${title} ${v.year}`}</p>
          <ul className="mt-3 flex flex-wrap gap-2 text-[13px]">
            <li className="border border-line-strong/50 px-3 py-1.5">Año {v.year}</li>
            <li className={`border border-line-strong/50 px-3 py-1.5 ${v.price === null ? "text-muted" : ""}`}>Precio: {v.price === null ? "a consultar" : priceLabel(facts, "es")}</li>
            <li className={`border border-line-strong/50 px-3 py-1.5 ${v.mileage === null ? "text-muted" : ""}`}>Kilometraje: {v.mileage === null ? "a consultar" : mileageLabel(facts, "es")}</li>
            {known.map((d) => (
              <li key={d.label} className="border border-line-strong/50 px-3 py-1.5">
                {d.label}: {d.value}
              </li>
            ))}
            {facts.features.length > 0 && <li className="border border-line-strong/50 px-3 py-1.5">{facts.features.length} características</li>}
          </ul>
          <p className="mt-3 text-[12.5px] leading-snug text-muted">
            El generador solo usa estos datos confirmados.
            {missing.length > 0 && (
              <>
                {" "}
                No tiene: {missing.join(", ")}.{" "}
                <Link href={`${BASE}/inventario/${v.slug}`} className="text-accent underline-offset-4 hover:underline">
                  Completar datos
                </Link>
              </>
            )}
          </p>
        </div>
      </section>

      {v.status !== "available" && (
        <p className="mt-4 flex items-start gap-3 border-l border-accent pl-4 text-[13px] text-ink/85">
          Este vehículo está marcado como {v.status === "reserved" ? "apartado" : "vendido"}: el contenido lo mencionará así.
        </p>
      )}

      {/* Estado idle: promesa + CTA */}
      {phase === "idle" && (
        <section aria-labelledby="gen-title" className="rise mt-10 border border-line-strong/40 bg-surface p-6 md:p-10" style={{ "--d": "180ms" } as React.CSSProperties}>
          <h2 id="gen-title" className="serif-title text-[clamp(1.6rem,3vw,2.4rem)] font-normal">
            Todo el contenido de este vehículo, en un solo paso
          </h2>
          <ul className="mt-6 grid gap-x-8 gap-y-2 text-[15px] sm:grid-cols-2 lg:grid-cols-4">
            {TABS.map((t) => (
              <li key={t.id} className="flex items-center gap-3 text-ink/85">
                <span aria-hidden className="h-px w-4 bg-accent" />
                {t.label}
              </li>
            ))}
          </ul>
          <div className="mt-8" role="radiogroup" aria-label="Tono">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Tono</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CONTENT_TONES.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={tone === t.id} onClick={() => setTone(t.id)} className={`min-h-11 border px-5 text-[13px] transition-colors ${tone === t.id ? "border-accent bg-accent/10 text-accent" : "border-line-strong/50 text-ink/80 hover:border-ink/60"}`}>
                  {t.label}
                  <span className="ml-2 hidden text-[11.5px] text-muted sm:inline">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => requestRun(tone, 0)} data-generate className="btn-primary group mt-8 w-full !px-8 sm:w-auto">
            <Sparkles className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Generar con IA
          </button>
          <p className="mt-5 max-w-[64ch] text-[12.5px] leading-snug text-muted">Demostración: el contenido se genera con plantillas a partir de los datos del vehículo. Revísalo antes de usarlo; no se publica nada automáticamente.</p>
        </section>
      )}

      {/* Generando */}
      {phase === "generating" && (
        <section aria-label="Generando contenido" className="rise mt-10 border border-line-strong/40 bg-surface px-6 py-14 text-center md:py-20">
          <Sparkles className="mx-auto h-8 w-8 animate-pulse text-accent" strokeWidth={1.3} aria-hidden />
          <p key={step} role="status" aria-live="polite" className="rise mt-6 font-serif text-[clamp(1.4rem,2.6vw,2rem)] italic">
            {STEPS[step]}
          </p>
          <div aria-hidden className="mx-auto mt-8 grid max-w-[420px] grid-cols-4 gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-[3px] transition-colors duration-500 ${i <= step ? "bg-accent" : "bg-line-strong/40"}`} />
            ))}
          </div>
        </section>
      )}

      {/* Resultados */}
      {phase === "done" && content && panelProps && (
        <section aria-label="Contenido generado" className="mt-10">
          <div className="rise flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="flex items-center gap-2 text-[13px] text-ink/85">
                <Check className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden /> Contenido generado
              </p>
              <DemoTag label="Generado con plantillas (demo)" />
              {draft && !unsaved && (
                <span data-draft-saved className="inline-flex items-center gap-2 text-[12.5px] text-accent">
                  <Save className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden /> Borrador guardado (solo en este navegador) · {formatSaved(draft.savedAt)}
                </span>
              )}
              {unsaved && (draft || edited) && <span className="text-[12.5px] text-[#e0a35a]">Cambios sin guardar</span>}
              {!draft && !edited && <span className="text-[12.5px] text-muted">Aún sin guardar</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => requestRun(tone, variant + 1)} data-regenerate className="btn-ghost group !min-h-11 !px-4">
                <RefreshCw className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Regenerar
              </button>
              <button type="button" onClick={saveDraft} data-save className="btn-primary group !min-h-11 !px-5">
                <Save className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Guardar borrador
              </button>
              {draft && (
                <button type="button" onClick={() => setConfirm({ kind: "delete" })} data-delete className="inline-flex min-h-11 items-center gap-2 px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/70 hover:text-[#e0735a]">
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Eliminar borrador
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Tono del contenido">
            <span className="mr-2 text-[11px] uppercase tracking-[0.22em] text-muted">Tono</span>
            {CONTENT_TONES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={tone === t.id} onClick={() => tone !== t.id && requestRun(t.id, 0)} className={`min-h-11 border px-4 text-[12.5px] transition-colors ${tone === t.id ? "border-accent bg-accent/10 text-accent" : "border-line-strong/50 text-ink/80 hover:border-ink/60"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {stale && (
            <p role="status" data-stale className="mt-5 flex items-start gap-3 border border-[#e0a35a]/50 bg-[#e0a35a]/10 px-4 py-3 text-[13.5px]">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#e0a35a]" strokeWidth={1.7} aria-hidden />
              Los datos del vehículo cambiaron desde que se generó este contenido. Pulsa Regenerar para actualizarlo.
            </p>
          )}

          {/* Pestañas = lista de entregables con ✓ */}
          <div key={revealKey} role="tablist" aria-label="Contenido generado" onKeyDown={onTabKey} className="no-scrollbar -mx-5 mt-8 flex gap-1 overflow-x-auto border-b border-line px-5 md:mx-0 md:px-0">
            {TABS.map((t, i) => {
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  className={`rise relative flex min-h-12 shrink-0 items-center gap-1.5 px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.07em] transition-colors ${on ? "text-ink" : "text-ink/60 hover:text-ink"}`}
                  style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
                >
                  <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.2} aria-hidden />
                  {t.label}
                  <span aria-hidden className={`absolute inset-x-3 bottom-[-1px] h-[2px] bg-accent transition-transform duration-300 ease-[var(--ease-editorial)] ${on ? "scale-x-100" : "scale-x-0"}`} />
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-8" tabIndex={0}>
            <ActivePanel {...panelProps} />
          </div>

          <p className="mt-10 border-t border-line pt-5 text-[12px] leading-relaxed text-muted">
            Contenido de demostración generado con plantillas a partir de los datos confirmados del vehículo. Revísalo antes de usarlo. Nada se publica ni se envía desde aquí.
          </p>
        </section>
      )}

      {confirm?.kind === "regen" && (
        <Modal title="Reemplazar tus ediciones" eyebrow="Regenerar" onClose={() => setConfirm(null)}>
          <p className="text-[15px] leading-relaxed text-ink/85">Editaste el contenido a mano. Si regeneras, se reemplazará por una nueva versión.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              className="btn-primary w-full sm:w-auto"
              onClick={() => {
                const c = confirm;
                setConfirm(null);
                void run(c.tone, c.variant);
              }}
            >
              Regenerar
            </button>
            <button type="button" data-autofocus className="btn-ghost w-full sm:w-auto" onClick={() => setConfirm(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
      {confirm?.kind === "delete" && (
        <Modal title="Eliminar borrador" eyebrow="Confirmación" onClose={() => setConfirm(null)}>
          <p className="text-[15px] leading-relaxed text-ink/85">Se eliminará el borrador guardado de {title}. Podrás generar contenido nuevo cuando quieras.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              className="btn-primary w-full sm:w-auto"
              onClick={() => {
                setConfirm(null);
                removeDraft();
              }}
            >
              Eliminar
            </button>
            <button type="button" data-autofocus className="btn-ghost w-full sm:w-auto" onClick={() => setConfirm(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}


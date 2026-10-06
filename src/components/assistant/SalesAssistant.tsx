"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, RotateCcw, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { DEMO_MODE } from "@/lib/demo-mode";
import { buildLeadSummary } from "@/services/assistant/summary";
import { emptyConversation, getSalesAssistant, vfull, type ConversationState } from "@/services/assistant";
import { createAssistantLead } from "@/services/crm/state";
import { ChatComparison, ChatVehicleCard, openFullComparison } from "./AssistantParts";
import { usePreferences } from "../providers/Preferences";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  vehicles?: string[];
  comparison?: string[];
  handoff?: boolean;
  /** Oferta "¿Quieres que un asesor te contacte?": abierta o ya respondida. */
  offer?: "open" | "yes" | "no";
  /** Formulario de prospecto demo: abierto o ya enviado. */
  form?: "open" | "done";
  leadId?: string;
  chips?: string[];
};

const SESSION_KEY = "ec-assistant-session";
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
let seq = 0;
const uid = () => `m${Date.now().toString(36)}${seq++}`;

function LeadForm({ vehicles, defaultSlug, onSubmit, onCancel }: { vehicles: Vehicle[]; defaultSlug: string; onSubmit: (v: { name: string; phone: string; slug: string }) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState(defaultSlug);
  const [err, setErr] = useState<{ name?: boolean; phone?: boolean }>({});
  const field = "mt-1.5 block min-h-11 w-full border border-line-strong/50 bg-bg px-3 text-[15px] text-ink outline-none transition-colors focus:border-accent aria-[invalid=true]:border-[#e0735a]";
  const label = "block text-[10.5px] uppercase tracking-[0.2em] text-muted";
  return (
    <form
      data-lead-form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const next = { name: !name.trim(), phone: phone.replace(/\D/g, "").length < 8 };
        setErr(next);
        if (next.name || next.phone) return;
        onSubmit({ name, phone, slug });
      }}
      className="space-y-3 border border-line bg-surface p-3.5"
    >
      <p className="flex items-start gap-2 border-l border-accent pl-3 text-[12.5px] leading-snug text-ink/85">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} aria-hidden />
        Demostración: estos datos se guardarán únicamente en este navegador y no serán enviados a Eurocars.
      </p>
      <div>
        <label htmlFor="al-name" className={label}>Nombre</label>
        <input id="al-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={err.name || undefined} className={field} />
      </div>
      <div>
        <label htmlFor="al-phone" className={label}>Teléfono (puede ser ficticio)</label>
        <input id="al-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" aria-invalid={err.phone || undefined} className={field} />
        {(err.name || err.phone) && <p role="alert" className="mt-1.5 text-[12px] text-[#e0735a]">Completa tu nombre y un teléfono de al menos 8 dígitos.</p>}
      </div>
      <div>
        <label htmlFor="al-veh" className={label}>Vehículo de interés</label>
        <select id="al-veh" value={slug} onChange={(e) => setSlug(e.target.value)} className={field}>
          {vehicles.map((v) => (
            <option key={v.slug} value={v.slug}>
              {vfull(v)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <button type="submit" className="btn-primary w-full !min-h-11 !px-5">
          Crear prospecto demo
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost w-full !min-h-11 !px-5">
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** Eurocars AI Sales Assistant (DEMO): panel flotante con motor de reglas sobre el inventario real. */
export function SalesAssistant({ vehicles }: { vehicles: Vehicle[] }) {
  const { locale } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const provider = useMemo(() => getSalesAssistant(), []);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conv, setConv] = useState<ConversationState>(emptyConversation);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [contextSlug, setContextSlug] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const bySlug = useCallback((slug: string) => vehicles.find((v) => v.slug === slug), [vehicles]);
  const currentSlug = useMemo(() => {
    const m = pathname.match(/^\/es\/inventario\/([^/]+)/);
    return m && vehicles.some((v) => v.slug === m[1]) ? m[1] : null;
  }, [pathname, vehicles]);
  const ctx = useMemo(() => ({ vehicles, currentSlug }), [vehicles, currentSlug]);

  // Sesión: la conversación sobrevive a la navegación y a recargas (sessionStorage).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { messages: Msg[]; conv: ConversationState; contextSlug: string | null; open?: boolean };
        setMessages(s.messages);
        setConv(s.conv);
        setContextSlug(s.contextSlug);
        setOpen(Boolean(s.open));
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ messages, conv, contextSlug, open }));
    } catch {}
  }, [loaded, messages, conv, contextSlug, open]);

  const push = useCallback((m: Omit<Msg, "id">) => setMessages((ms) => [...ms, { ...m, id: uid() }]), []);
  const patch = (id: string, p: Partial<Msg>) => setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...p } : m)));

  const greet = useCallback(() => {
    const g = provider.greet(ctx);
    setMessages(g.contextText ? [{ id: uid(), role: "assistant", text: g.text }, { id: uid(), role: "assistant", text: g.contextText, chips: g.chips }] : [{ id: uid(), role: "assistant", text: g.text, chips: g.chips }]);
    setConv(emptyConversation);
    setContextSlug(currentSlug);
  }, [provider, ctx, currentSlug]);

  const openPanel = () => {
    setOpen(true);
    if (messages.length === 0) greet();
  };
  const closePanel = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  }, []);

  // Cambio de ficha con el chat abierto: el asistente se entera del nuevo vehículo.
  useEffect(() => {
    if (!loaded || !open || messages.length === 0) return;
    if (!currentSlug) {
      if (contextSlug) setContextSlug(null);
      return;
    }
    if (currentSlug !== contextSlug) {
      const note = provider.onVehicleChange(ctx);
      setContextSlug(currentSlug);
      if (note) push({ role: "assistant", text: note.text, chips: note.chips });
    }
  }, [loaded, open, currentSlug, contextSlug, messages.length, provider, ctx, push]);

  // Escape, foco y bloqueo de scroll en móvil
  useEffect(() => {
    if (!open) return;
    const mobile = window.innerWidth < 768;
    if (mobile) document.documentElement.style.overflow = "hidden";
    inputRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, closePanel]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    push({ role: "user", text: t });
    setInput("");
    setBusy(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [reply] = await Promise.all([provider.respond(t, conv, ctx), wait(reduce ? 0 : 600)]);
    setConv(reply.state);
    push({ role: "assistant", text: reply.text, vehicles: reply.vehicles, comparison: reply.comparison, handoff: reply.handoff, offer: reply.offerLead ? "open" : undefined, form: reply.startLead ? "open" : undefined, chips: reply.chips });
    setBusy(false);
  };

  const askLead = () => push({ role: "assistant", text: "Perfecto. Déjame estos datos y un asesor de Eurocars podrá contactarte.", form: "open" });

  const defaultSlug = currentSlug ?? conv.focus[0] ?? conv.shown[conv.shown.length - 1] ?? vehicles[0]?.slug ?? "";

  const submitLead = (msgId: string, v: { name: string; phone: string; slug: string }) => {
    const res = createAssistantLead({ name: v.name, phone: v.phone, vehicleSlug: v.slug, summary: buildLeadSummary(conv, bySlug(v.slug), bySlug) });
    if (!res.ok) {
      push({ role: "assistant", text: "No pude guardar el prospecto demo: el navegador rechazó la escritura." });
      return;
    }
    patch(msgId, { form: "done" });
    push({ role: "assistant", text: "Prospecto creado en la demostración.\nEn producción, un asesor podría recibir esta solicitud automáticamente.", leadId: res.id });
  };

  const reset = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    setMessages([]);
    setConv(emptyConversation);
    setContextSlug(null);
    window.setTimeout(greet, 0);
  };

  if (!DEMO_MODE || locale !== "es" || !loaded) return null;

  const lastChips = !busy ? [...messages].reverse().find((m) => m.role === "assistant")?.chips : undefined;

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={openPanel}
          data-assistant-launcher
          aria-label="Pregúntale a Eurocars AI"
          style={{ bottom: "calc(92px + env(safe-area-inset-bottom))" }}
          className="group rise fixed right-4 z-40 flex min-h-12 items-center gap-2.5 border border-accent/60 bg-ink px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-bg shadow-[0_14px_34px_-14px_rgb(0_0_0/0.7)] transition-transform duration-300 ease-[var(--ease-editorial)] hover:-translate-y-0.5 md:right-6 md:text-[12.5px]"
        >
          <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.8} aria-hidden />
          Pregúntale a Eurocars AI
        </button>
      )}

      {open && (
        <>
          <div aria-hidden onClick={closePanel} className="fixed inset-0 z-[79] bg-[#080909]/60 backdrop-blur-[2px] md:hidden" />
          <div
            role="dialog"
            aria-label="Eurocars AI — asistente de ventas (demostración)"
            data-assistant-panel
            className="rise fixed inset-x-0 bottom-0 z-[80] flex h-[90svh] flex-col border border-line-strong/50 bg-bg text-ink shadow-[0_30px_80px_-30px_rgb(0_0_0/0.85)] md:inset-x-auto md:bottom-[100px] md:right-6 md:h-[min(700px,calc(100svh-124px))] md:w-[420px]"
          >
            <header className="relative flex items-start justify-between gap-3 border-b border-line px-5 pb-3 pt-4">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]" />
              <div>
                <p className="eyebrow flex items-center gap-2.5 text-accent">
                  <Sparkles className="h-4 w-4" strokeWidth={1.7} aria-hidden /> Eurocars AI
                </p>
                <p className="mt-1.5 text-[11.5px] text-muted">Demostración con IA simulada</p>
              </div>
              <div className="-mr-2 flex items-center">
                <button type="button" onClick={reset} aria-label="Reiniciar conversación" title="Reiniciar conversación" className="grid h-11 w-11 place-items-center text-ink/60 hover:text-ink">
                  <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={closePanel} aria-label="Cerrar asistente" data-assistant-close className="grid h-11 w-11 place-items-center text-ink/70 hover:text-ink">
                  <X className="h-5 w-5" strokeWidth={1.4} />
                </button>
              </div>
            </header>

            <div ref={scroller} role="log" aria-live="polite" aria-label="Conversación" className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {messages.map((m) =>
                m.role === "user" ? (
                  <p key={m.id} data-msg="user" className="rise ml-auto w-fit max-w-[86%] border border-accent/40 bg-accent/10 px-4 py-2.5 text-[14.5px] leading-snug">
                    {m.text}
                  </p>
                ) : (
                  <div key={m.id} data-msg="assistant" className="rise max-w-[96%] space-y-3">
                    <p className="whitespace-pre-wrap break-words text-[14.5px] leading-relaxed text-ink/95">{m.text}</p>
                    {m.vehicles?.map((slug) => {
                      const v = bySlug(slug);
                      return v ? <ChatVehicleCard key={slug} vehicle={v} locale="es" /> : null;
                    })}
                    {m.comparison && (
                      <ChatComparison
                        vehicles={m.comparison.map(bySlug).filter((v): v is Vehicle => Boolean(v))}
                        locale="es"
                        onOpen={() => openFullComparison(m.comparison!, "es", (href) => { router.push(href); if (window.innerWidth < 768) closePanel(); })}
                      />
                    )}
                    {m.handoff && !m.form && (
                      <button type="button" data-request-advisor onClick={askLead} className="btn-ghost group w-full !min-h-11 !px-4 sm:w-auto">
                        <UserRound className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Solicitar asesor
                      </button>
                    )}
                    {m.offer === "open" && (
                      <div data-lead-offer className="border-l border-accent pl-3.5">
                        <p className="text-[14px] font-medium">¿Quieres que un asesor de Eurocars te contacte?</p>
                        <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                          <button type="button" data-offer-yes onClick={() => { patch(m.id, { offer: "yes" }); askLead(); }} className="btn-primary w-full !min-h-11 !px-4 sm:w-auto">
                            Sí, quiero información
                          </button>
                          <button type="button" data-offer-no onClick={() => { patch(m.id, { offer: "no" }); push({ role: "assistant", text: "Claro, seguimos explorando. ¿Qué más te gustaría ver?" }); }} className="btn-ghost w-full !min-h-11 !px-4 sm:w-auto">
                            Seguir explorando
                          </button>
                        </div>
                      </div>
                    )}
                    {m.form === "open" && <LeadForm vehicles={vehicles} defaultSlug={defaultSlug} onSubmit={(v) => submitLead(m.id, v)} onCancel={() => patch(m.id, { form: "done" })} />}
                    {m.leadId && (
                      <Link href={`/admin-demo/panel/prospectos/${m.leadId}`} data-view-lead className="inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-accent underline-offset-4 hover:underline">
                        Ver el prospecto en el panel (demo)
                      </Link>
                    )}
                  </div>
                ),
              )}
              {busy && (
                <div role="status" aria-label="Eurocars AI está escribiendo" className="flex gap-1.5 px-1 py-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" style={{ animationDelay: `${i * 160}ms` }} />
                  ))}
                </div>
              )}
            </div>

            {lastChips && lastChips.length > 0 && (
              <div data-chips className="no-scrollbar flex gap-2 overflow-x-auto border-t border-line px-4 py-3 md:flex-wrap md:overflow-visible">
                {lastChips.map((c) => (
                  <button key={c} type="button" onClick={() => send(c)} className="min-h-11 shrink-0 border border-line-strong/50 px-3.5 text-left text-[13px] leading-tight transition-colors hover:border-accent hover:text-accent md:min-h-9">
                    {c}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2 border-t border-line px-3 py-3"
              style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
            >
              <label htmlFor="assistant-input" className="sr-only">
                Escribe tu pregunta
              </label>
              <input id="assistant-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta…" autoComplete="off" className="min-h-12 flex-1 border border-line-strong/50 bg-transparent px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent" />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar" className="grid h-12 w-12 shrink-0 place-items-center bg-accent text-accent-ink transition-opacity disabled:opacity-40">
                <ArrowUp className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </form>
            <p className="px-4 pb-3 text-[11px] leading-snug text-muted">Respuestas calculadas con reglas a partir del inventario. Nada se envía a Eurocars.</p>
          </div>
        </>
      )}
    </>
  );
}

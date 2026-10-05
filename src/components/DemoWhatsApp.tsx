"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "./admin/Modal";
import { usePreferences } from "./providers/Preferences";
import { DEMO_MODE, DEMO_WA_PREFIX } from "@/lib/demo-mode";

const bubbleOut = "ml-auto max-w-[90%] whitespace-pre-wrap break-words rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2 text-[13.5px] leading-[1.45] text-white light:bg-[#d9fdd3] light:text-[#111b21]";
const bubbleIn = "mr-auto max-w-[90%] whitespace-pre-wrap break-words rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2 text-[13.5px] leading-[1.45] text-[#e9edef] light:bg-white light:text-[#111b21]";

/**
 * Modo demostración: intercepta los enlaces de WhatsApp (ancla #demo-whatsapp=…) y muestra un modal.
 * NUNCA contacta a un número real. En producción (DEMO_MODE desactivado) no renderiza ni escucha nada.
 */
export function DemoWhatsApp() {
  const { t } = usePreferences();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const close = useCallback(() => setMessage(null), []);

  useEffect(() => {
    if (!DEMO_MODE) return;
    const open = (raw: string) => {
      try {
        setMessage(decodeURIComponent(raw));
      } catch {
        setMessage("");
      }
      setSimulating(false);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!a || !href?.startsWith(DEMO_WA_PREFIX)) return;
      e.preventDefault();
      open(href.slice(DEMO_WA_PREFIX.length));
    };
    // Clic central / "abrir en pestaña nueva": la página carga con el ancla y se muestra el mismo modal.
    const fromHash = () => {
      if (window.location.hash.startsWith(DEMO_WA_PREFIX)) {
        open(window.location.hash.slice(DEMO_WA_PREFIX.length));
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
    fromHash();
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", fromHash);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  if (!DEMO_MODE || message === null) return null;

  const d = t.demo.whatsapp;
  const onVehicle = /\/(inventario|inventory)\/[^/]+/.test(pathname);

  return (
    <Modal title={d.title} eyebrow={d.eyebrow} closeLabel={d.close} onClose={close}>
      <div data-demo-whatsapp>
        <p className="text-[16px] leading-relaxed">{onVehicle ? d.bodyVehicle : d.bodyGeneric}</p>
        <p className="mt-3 text-[13px] leading-snug text-muted">{d.noContact}</p>

        {simulating ? (
          <div className="mt-6 space-y-3 border border-line bg-[#0b141a] p-3 light:bg-[#efeae2]">
            <p className={bubbleOut}>{message}</p>
            <p className="mx-auto w-fit rounded bg-[#182229] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] text-[#8696a0] light:bg-white/80 light:text-[#54656f]">{d.sample}</p>
            <p className={bubbleIn}>{d.sampleReply}</p>
            <p className="pt-1 text-center text-[11.5px] text-[#8696a0] light:text-[#54656f]">{d.simulated}</p>
          </div>
        ) : (
          message && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{d.message}</p>
              <p className="mt-2 border-l border-accent pl-4 text-[14px] leading-relaxed text-ink/85">{message}</p>
            </div>
          )
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
          {simulating ? (
            <button type="button" onClick={() => setSimulating(false)} className="btn-primary w-full sm:w-auto">
              {d.reset}
            </button>
          ) : (
            <button type="button" onClick={() => setSimulating(true)} className="btn-primary w-full sm:w-auto">
              {d.simulate}
            </button>
          )}
          <button type="button" data-autofocus onClick={close} className="btn-ghost w-full sm:w-auto">
            {d.close}
          </button>
        </div>
      </div>
    </Modal>
  );
}

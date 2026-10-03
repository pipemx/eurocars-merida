"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { whatsappHref } from "@/lib/whatsapp";
import { WhatsappIcon } from "./icons";
import { usePreferences } from "./providers/Preferences";

type Props = {
  /** Mensaje contextual ya traducido. Por defecto: mensaje de la home. */
  message?: string;
  source?: string;
  vehicleId?: string;
  /** Eleva el botón cuando la página tiene barra inferior fija (ficha móvil). */
  raised?: boolean;
  /** Ocultar en móvil (cuando la página ya tiene barra fija de WhatsApp). */
  desktopOnly?: boolean;
};

export function FloatingWhatsApp({ message, source = "home", vehicleId, raised = false, desktopOnly = false }: Props) {
  const { t } = usePreferences();
  // En móvil aparece tras bajar por la portada, para no tapar sus CTAs. En escritorio, siempre.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const check = () => setVisible(window.innerWidth >= 768 || window.scrollY > window.innerHeight * 0.55);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  if (!visible) return null;
  return (
    <a
      href={whatsappHref(message ?? t.whatsapp.home)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.aria}
      onClick={() => track("whatsapp_click", { source: `floating_${source}`, ...(vehicleId ? { vehicle_id: vehicleId } : {}) })}
      style={{ bottom: `calc(${raised ? "84px" : "20px"} + env(safe-area-inset-bottom))` }}
      className={`wa-enter group fixed right-4 z-40 md:right-6 ${desktopOnly ? "max-lg:hidden" : ""}`}
    >
      <span aria-hidden className="wa-pulse absolute left-0 top-0 h-14 w-14 rounded-full" />
      <span className="relative flex h-14 items-center overflow-hidden rounded-full bg-[#1fae55] text-white shadow-[0_10px_30px_-10px_rgb(0_0_0/0.55)] ring-1 ring-black/10 transition-[background-color] duration-300 group-hover:bg-[#1c9e4d]">
        <span className="grid h-14 w-14 shrink-0 place-items-center">
          <WhatsappIcon className="h-[26px] w-[26px]" />
        </span>
        <span className="max-w-0 whitespace-nowrap pr-0 text-[14px] font-medium opacity-0 transition-[max-width,opacity,padding] duration-400 ease-[var(--ease-editorial)] [@media(hover:hover)]:group-hover:max-w-[240px] [@media(hover:hover)]:group-hover:pr-5 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:max-w-[240px] group-focus-visible:pr-5 group-focus-visible:opacity-100">
          {t.whatsapp.float}
        </span>
      </span>
    </a>
  );
}

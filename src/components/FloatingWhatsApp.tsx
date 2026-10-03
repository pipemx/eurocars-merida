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

/**
 * WhatsApp flotante: gradiente verde con resplandor, ondas expansivas, destello que lo
 * recorre, ícono que "timbra" cada pocos segundos y burbuja de mensaje que aparece sola
 * unos segundos (y al pasar el cursor). Animaciones desactivadas con reduced-motion.
 */
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
      className={`wa-enter group fixed right-4 z-40 flex items-center md:right-6 ${desktopOnly ? "max-lg:hidden" : ""}`}
    >
      {/* Burbuja de mensaje */}
      <span
        aria-hidden
        className="wa-bubble pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-[13.5px] font-medium text-[#0b3d22] shadow-[0_10px_30px_-8px_rgb(0_0_0/0.45)] ring-1 ring-black/5 transition-opacity duration-300 [@media(hover:hover)]:group-hover:!visible [@media(hover:hover)]:group-hover:!animate-none [@media(hover:hover)]:group-hover:!opacity-100 [@media(hover:hover)]:group-hover:!transform-none"
      >
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#25d366] align-middle shadow-[0_0_0_3px_rgb(37_211_102/0.25)]" />
        {t.whatsapp.float}
        <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-white" />
      </span>

      <span className="wa-ripple relative grid h-[60px] w-[60px] place-items-center rounded-full">
        <span className="wa-shine relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#3ee283_0%,#1fae55_55%,#128c4a_100%)] text-white shadow-[0_12px_30px_-8px_rgb(31_174_85/0.75),inset_0_1px_0_rgb(255_255_255/0.35)] ring-1 ring-white/20 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-active:scale-95">
          <WhatsappIcon className="wa-icon relative h-[30px] w-[30px] drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)]" />
        </span>
      </span>
    </a>
  );
}

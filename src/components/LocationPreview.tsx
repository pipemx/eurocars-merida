"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { whatsappHref } from "@/lib/whatsapp";
import { WhatsappIcon } from "./icons";
import { usePreferences } from "./providers/Preferences";

/** Búsqueda del negocio para el mapa embebido (sin API key). El clic abre el enlace oficial. */
const MAP_QUERY = "Eurocars Mérida, Santa Gertrudis Copó, Mérida, Yucatán";
const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=15&hl=es&output=embed`;

export function LocationPreview() {
  const { t, locale } = usePreferences();
  const box = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  // El iframe solo se carga cuando el bloque se acerca a la pantalla.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="contacto" aria-labelledby="loc-title" className="scroll-mt-20 bg-bg py-16 md:py-24">
      <div className="container-ec grid gap-10 md:grid-cols-12 md:items-center md:gap-14">
        <div data-reveal className="reveal md:col-span-5">
          <p className="eyebrow flex items-center gap-4 text-muted">
            <span aria-hidden className="draw-line h-px w-10 bg-accent" />
            {t.location.eyebrow}
          </p>
          <h2 id="loc-title" className="serif-title mt-4 text-[clamp(2.3rem,4.4vw,3.5rem)] font-normal">
            {t.location.title}
          </h2>
          <p className="mt-3 font-serif text-[1.35rem] italic text-ink/80">{t.location.tagline}</p>

          <div className="mt-8 space-y-5 text-[15px]">
            <p className="flex items-start gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.4} aria-hidden />
              {site.location.label}
            </p>
            <div className="flex items-start gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.4} aria-hidden />
              <dl className="grid grid-cols-[auto_auto] gap-x-8 gap-y-1">
                {t.location.hours.map((h) => (
                  <div key={h.days} className="contents">
                    <dt className="text-muted">{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row md:flex-col xl:flex-row">
            <a
              href={site.maps}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("maps_click", { source: "location_button" })}
              className="btn-primary group"
            >
              {t.location.openMaps} <ArrowUpRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
            </a>
            <a
              href={whatsappHref(t.whatsapp.home)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { source: "location" })}
              className="btn-ghost"
            >
              <WhatsappIcon className="h-4 w-4 text-[#1fae55]" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Mapa: vista previa 16:9; todo el bloque es un enlace a Google Maps */}
        <div data-reveal className="reveal md:col-span-7" style={{ "--d": "120ms" } as React.CSSProperties}>
          <a
            href={site.maps}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("maps_click", { source: "map_preview" })}
            aria-label={`${t.location.directions}: ${site.location.label}`}
            className="group relative block overflow-hidden rounded-[2px] ring-1 ring-line shadow-[var(--shadow)]"
          >
            <div ref={box} className="relative aspect-[16/10] bg-surface-2 md:aspect-video">
              {/* Fondo cartográfico estilizado (visible mientras carga o si el mapa no puede cargarse) */}
              <svg aria-hidden className="absolute inset-0 h-full w-full text-ink/[0.12]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 450">
                <g fill="none" stroke="currentColor">
                  <path d="M-20 300 C 160 260, 300 330, 460 250 S 720 170, 840 210" strokeWidth="14" />
                  <path d="M120 -20 L 260 470" strokeWidth="6" />
                  <path d="M520 -20 C 500 120, 560 300, 610 470" strokeWidth="6" />
                  <path d="M-20 120 L 840 160" strokeWidth="4" />
                  <path d="M-20 400 L 840 360" strokeWidth="3" />
                  <path d="M330 -20 L 380 470" strokeWidth="3" />
                  <path d="M700 -20 L 660 470" strokeWidth="3" />
                </g>
              </svg>
              {load && (
                <iframe
                  title={locale === "es" ? "Mapa de Eurocars Mérida" : "Map of Eurocars Mérida"}
                  src={embedSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                  className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] border-0 transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.07] [filter:grayscale(0.35)_contrast(1.05)] dark:[filter:invert(0.92)_hue-rotate(180deg)_grayscale(0.55)_brightness(0.9)_contrast(1.05)]"
                />
              )}
              {/* Viñeta y velo para integrar el mapa con el tema */}
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,color-mix(in_srgb,var(--bg)_70%,transparent)_100%)]" />
              {/* Pin Eurocars */}
              <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                <span className="relative block">
                  <span className="absolute left-1/2 top-[38px] h-3 w-8 -translate-x-1/2 rounded-full bg-black/40 blur-[3px]" />
                  <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#080909] ring-2 ring-[#c6a66a] shadow-lg transition-transform duration-500 group-hover:-translate-y-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#c6a66a]" />
                  </span>
                </span>
              </span>
              {/* Rótulo */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-[linear-gradient(0deg,rgb(8_9_9/0.85),transparent)] p-5 text-[#f3f1ec] md:p-6">
                <div>
                  <p className="serif-title text-[1.5rem] font-normal">Eurocars Mérida</p>
                  <p className="text-[13px] opacity-80">{site.location.label}</p>
                </div>
                <span className="flex items-center gap-2 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.16em] text-[#c6a66a] md:translate-y-2 md:opacity-0 md:transition-all md:duration-500 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  {t.location.directions} <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

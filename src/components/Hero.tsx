"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { usePreferences } from "./providers/Preferences";

/** Fotos provisionales (recortes del mockup aprobado). Sustituir por fotografía real de Eurocars. */
const slides = [
  { src: "/eurocars/showroom/mockup-hero-showroom.webp", pos: "object-[58%_50%]", alt: { es: "Lamborghini negro frente al showroom de Eurocars Mérida de noche", en: "Black Lamborghini outside the Eurocars Mérida showroom at night" } },
  { src: "/eurocars/showroom/mockup-interior.webp", pos: "object-[38%_50%]", alt: { es: "Interior deportivo con volante de piel y costuras rojas", en: "Sports interior with leather steering wheel and red stitching" } },
  { src: "/eurocars/showroom/mockup-porsche-rear.webp", pos: "object-[45%_50%]", alt: { es: "Calavera trasera iluminada de un Porsche", en: "Illuminated rear light bar of a Porsche" } },
];

/**
 * Hero cinematográfico. Misma estructura en ambos temas: foto a sangre (~70%) con
 * oscurecimiento (Dark) o velo marfil (Light) solo donde vive el texto.
 */
export function Hero() {
  const { t, locale } = usePreferences();
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const go = useCallback((d: number) => setIndex((i) => (i + d + slides.length) % slides.length), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => go(1), 7500);
    return () => window.clearTimeout(id);
  }, [index, go]);

  const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <section aria-roledescription="carousel" aria-label={t.hero.carousel} className="relative isolate flex min-h-[82svh] flex-col overflow-hidden bg-bg md:h-[92vh] md:min-h-[680px] md:max-h-[1000px]">
      <div
        className="relative h-[52svh] min-h-[300px] w-full md:absolute md:inset-y-0 md:left-[24%] md:right-0 md:h-auto md:w-auto"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {slides.map((s, i) => (
            <div key={s.src} aria-hidden={i !== index} className={`absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-editorial)] ${i === index ? "opacity-100" : "opacity-0"}`}>
              <Image
                src={s.src}
                alt={s.alt[locale]}
                fill
                priority={i === 0}
                sizes="(min-width:768px) 76vw, 100vw"
                className={`object-cover ${s.pos} ${i === index ? "kenburns" : ""}`}
              />
            </div>
          ))}
          {/* Dark: oscurecimiento direccional */}
          <div
            aria-hidden
            className="absolute inset-0 light:hidden bg-[linear-gradient(180deg,rgb(8_9_9/0.7)_0%,transparent_28%,transparent_62%,#080909_100%)] md:bg-[linear-gradient(90deg,#080909_0%,rgb(8_9_9/0.72)_15%,rgb(8_9_9/0.1)_42%,transparent_60%),linear-gradient(180deg,rgb(8_9_9/0.55)_0%,transparent_20%,transparent_78%,rgb(8_9_9/0.7)_100%)]"
          />
          {/* Light: velo marfil direccional */}
          <div
            aria-hidden
            className="absolute inset-0 hidden light:block bg-[linear-gradient(180deg,rgb(244_242_237/0.9)_0%,rgb(244_242_237/0.5)_14%,transparent_32%,transparent_62%,#f4f2ed_100%)] md:bg-[linear-gradient(90deg,#f4f2ed_0%,rgb(244_242_237/0.8)_16%,rgb(244_242_237/0.15)_42%,transparent_60%),linear-gradient(180deg,rgb(244_242_237/0.92)_0%,rgb(244_242_237/0.55)_9%,transparent_24%,transparent_80%,rgb(244_242_237/0.85)_100%)]"
          />
        </div>
      </div>

      <div className="container-ec relative -mt-16 flex flex-1 flex-col justify-center pb-10 md:mt-0 md:pb-0 md:pt-24">
        <div className="md:max-w-[54%]">
          <p className="eyebrow rise flex items-center gap-4 text-ink/80" style={d(250)}>
            <span aria-hidden className="h-px w-10 bg-accent" />
            {t.hero.eyebrow}
          </p>
          <h1 className="mt-6 text-[clamp(2.8rem,11vw,5.4rem)] font-light uppercase leading-[1] tracking-[0.005em]">
            <span className="line-mask">
              <span style={d(350)}>{t.hero.titleA}</span>
            </span>
            <span className="line-mask">
              <span style={d(500)}>
                {t.hero.titleB} <span className="accent-text shimmer font-semibold">{t.hero.titleC}</span>
              </span>
            </span>
          </h1>
          <p className="rise mt-6 max-w-[30ch] text-[17px] font-light leading-snug text-ink/85 md:text-[19px]" style={d(750)}>
            {t.hero.sub}
          </p>
          <p className="rise mt-5 flex items-center gap-2 text-[15px] text-ink/80" style={d(820)}>
            <MapPin className="h-4 w-4 text-accent" strokeWidth={1.6} aria-hidden />
            {t.hero.location}
          </p>
          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-7" style={d(900)}>
            <Link href={`/${locale}#inventario`} className="btn-primary group">
              {t.hero.ctaPrimary} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
            </Link>
            <Link href={`/${locale}#vende-tu-auto`} className="group inline-flex min-h-12 items-center self-start text-[12px] font-semibold uppercase tracking-[0.14em] sm:self-auto">
              <span className="relative pb-1">
                {t.hero.ctaSecondary}
                <span aria-hidden className="absolute bottom-0 left-0 h-px w-full bg-current/40" />
                <span aria-hidden className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-[width] duration-500 ease-[var(--ease-editorial)] group-hover:w-full" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="container-ec relative z-10 flex items-center justify-between pb-8 md:absolute md:inset-x-0 md:bottom-0 md:pb-7">
        <div className="flex items-center gap-4 text-[13px] tabular-nums tracking-[0.12em]" aria-live="polite">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                onClick={() => setIndex(i)}
                className="relative h-[2px] w-10 overflow-hidden bg-current/20"
              >
                <span key={i === index ? `a${index}` : i} className={`absolute inset-y-0 left-0 bg-accent ${i === index ? "progress" : i < index ? "w-full" : "w-0"}`} />
              </button>
            ))}
          </span>
          <span className="opacity-60">{String(slides.length).padStart(2, "0")}</span>
        </div>
        <a href="#inventario" aria-hidden tabIndex={-1} className="hidden flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ink/60 lg:flex">
          Scroll
          <span className="relative h-10 w-px overflow-hidden bg-current/25">
            <span className="scroll-cue absolute left-0 top-0 h-3 w-px bg-accent" />
          </span>
        </a>
        <div className="flex">
          <button type="button" onClick={() => go(-1)} aria-label={t.hero.prev} className="grid h-11 w-11 place-items-center rounded-full opacity-80 transition hover:bg-ink/10 hover:opacity-100">
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.3} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label={t.hero.next} className="grid h-11 w-11 place-items-center rounded-full opacity-80 transition hover:bg-ink/10 hover:opacity-100">
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.3} />
          </button>
        </div>
      </div>
    </section>
  );
}

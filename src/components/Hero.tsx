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

export function Hero() {
  const { t, locale } = usePreferences();
  const [index, setIndex] = useState(0);
  const go = useCallback((d: number) => setIndex((i) => (i + d + slides.length) % slides.length), []);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => go(1), 7000);
    return () => window.clearTimeout(id);
  }, [index, go]);

  const counter = (
    <p className="flex items-center gap-3 text-[13px] tabular-nums tracking-[0.12em]" aria-live="polite">
      <span>{String(index + 1).padStart(2, "0")}</span>
      <span aria-hidden className="relative h-px w-14 bg-current/30">
        <span className="absolute inset-y-0 left-0 bg-current transition-[width] duration-500" style={{ width: `${((index + 1) / slides.length) * 100}%` }} />
      </span>
      <span className="opacity-60">{String(slides.length).padStart(2, "0")}</span>
    </p>
  );

  const arrows = (
    <div className="flex">
      <button type="button" onClick={() => go(-1)} aria-label={t.hero.prev} className="grid h-11 w-11 place-items-center opacity-80 transition-opacity hover:opacity-100">
        <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.3} />
      </button>
      <button type="button" onClick={() => go(1)} aria-label={t.hero.next} className="grid h-11 w-11 place-items-center opacity-80 transition-opacity hover:opacity-100">
        <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.3} />
      </button>
    </div>
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.hero.carousel}
      className="relative isolate flex min-h-[80svh] flex-col overflow-hidden bg-bg md:h-[90vh] md:min-h-[680px] md:max-h-[980px] light:md:h-[92vh]"
    >
      {/* Fotografía — Dark: a sangre (~70% derecho). Light: encuadre editorial con margen. */}
      <div className="relative h-[50svh] min-h-[300px] w-full light:mx-5 light:mt-[84px] light:h-[44svh] light:w-auto md:absolute light:md:h-auto md:inset-y-0 md:left-[26%] md:right-0 md:h-auto md:w-auto light:md:mx-0 light:md:mt-0 light:md:bottom-[88px] light:md:left-[46%] light:md:right-10 light:md:top-[124px] light:xl:right-[max(80px,calc((100vw_-_1440px)/2_+_80px))]">
        <div
          className="absolute inset-0 overflow-hidden"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          {slides.map((s, i) => (
            <Image
              key={s.src}
              src={s.src}
              alt={s.alt[locale]}
              fill
              priority={i === 0}
              sizes="(min-width:768px) 74vw, 100vw"
              aria-hidden={i !== index}
              className={`object-cover ${s.pos} transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-editorial)] ${i === index ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
            />
          ))}
          {/* Oscurecimiento direccional solo en Dark */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(8_9_9/0.7)_0%,transparent_28%,transparent_62%,#080909_100%)] light:hidden md:bg-[linear-gradient(90deg,#080909_0%,rgb(8_9_9/0.72)_15%,rgb(8_9_9/0.1)_42%,transparent_60%),linear-gradient(180deg,rgb(8_9_9/0.55)_0%,transparent_20%,transparent_78%,rgb(8_9_9/0.65)_100%)]"
          />
        </div>
        {/* Controles: Dark sobre la foto; Light como pie de foto editorial */}
        <div className="absolute inset-x-0 -bottom-[60px] hidden items-center justify-between text-ink light:md:flex">
          <div className="flex items-center gap-8">
            {counter}
            <span className="text-[12px] tracking-[0.08em] text-muted">Showroom · Mérida, Yucatán</span>
          </div>
          {arrows}
        </div>
      </div>

      <div className="container-ec pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden items-center justify-between pb-6 text-bone md:flex light:md:hidden">
        <div className="pointer-events-auto">{counter}</div>
        <div className="pointer-events-auto">{arrows}</div>
      </div>

      <div className="container-ec relative -mt-16 flex flex-1 flex-col justify-center pb-10 light:mt-8 md:mt-0 md:pb-0 md:pt-24 light:md:mt-0">
        <div className="md:max-w-[52%] light:md:max-w-[42%]">
          <p className="eyebrow rise text-ink/80" style={{ "--d": "80ms" } as React.CSSProperties}>
            {t.hero.eyebrow}
          </p>
          <h1
            className="rise mt-5 text-[clamp(2.7rem,11vw,4.9rem)] light:md:text-[clamp(2.7rem,4.6vw,4.4rem)] font-light uppercase leading-[1.02] tracking-[0.005em] light:font-normal"
            style={{ "--d": "160ms" } as React.CSSProperties}
          >
            {t.hero.titleA}
            <br />
            {t.hero.titleB} <span className="accent-text font-semibold light:bg-none light:text-ink">{t.hero.titleC}</span>
          </h1>
          <p className="rise mt-5 max-w-[30ch] text-[17px] font-light leading-snug text-ink/85 md:text-[19px]" style={{ "--d": "260ms" } as React.CSSProperties}>
            {t.hero.sub}
          </p>
          <p className="rise mt-5 flex items-center gap-2 text-[15px] text-ink/80" style={{ "--d": "300ms" } as React.CSSProperties}>
            <MapPin className="h-4 w-4 text-accent" strokeWidth={1.6} aria-hidden />
            {t.hero.location}
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6" style={{ "--d": "380ms" } as React.CSSProperties}>
            <Link href={`/${locale}#inventario`} className="btn-primary group">
              {t.hero.ctaPrimary} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
            </Link>
            <Link href={`/${locale}#vende-tu-auto`} className="group inline-flex min-h-12 items-center gap-3 self-start text-[12px] font-semibold uppercase tracking-[0.14em] sm:self-auto">
              <span className="border-b border-current/40 pb-1 transition-colors group-hover:border-current">{t.hero.ctaSecondary}</span>
            </Link>
          </div>
          {/* Controles móviles */}
          <div className="mt-8 md:hidden">{counter}</div>
        </div>
      </div>
    </section>
  );
}

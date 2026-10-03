"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { site } from "@/content/site";

/** Imágenes provisionales recortadas del mockup de referencia; sustituir por fotografía real. */
const slides = [
  { src: "/eurocars/showroom/mockup-hero-showroom.webp", alt: "Lamborghini negro frente al showroom de Eurocars Mérida de noche", pos: "object-[60%_50%]" },
  { src: "/eurocars/showroom/mockup-interior.webp", alt: "Interior deportivo con volante de piel y costuras rojas", pos: "object-[40%_50%]" },
  { src: "/eurocars/showroom/mockup-porsche-rear.webp", alt: "Calavera trasera iluminada de un Porsche gris", pos: "object-[50%_50%]" },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const go = useCallback((d: number) => setIndex((i) => (i + d + slides.length) % slides.length), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => go(1), 7000);
    return () => window.clearTimeout(t);
  }, [index, go]);

  return (
    <section aria-roledescription="carrusel" aria-label="Destacados" className="relative isolate flex flex-col overflow-hidden bg-carbon md:h-[78vh] md:min-h-[640px] md:max-h-[860px]">
      {/* Fotografía: móvil arriba a sangre; desktop ocupa ~63% derecho con fundido hacia la izquierda */}
      <div className="relative h-[54svh] min-h-[320px] w-full md:absolute md:inset-y-0 md:left-[30%] md:right-0 md:h-auto md:w-auto">
        {slides.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="(min-width:768px) 70vw, 100vw"
            aria-hidden={i !== index}
            className={`object-cover ${s.pos} transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_11_11/0.75)_0%,transparent_25%,transparent_65%,#0a0b0b_100%)] md:bg-[linear-gradient(90deg,#0a0b0b_0%,rgb(10_11_11/0.75)_14%,rgb(10_11_11/0.15)_38%,transparent_55%),linear-gradient(180deg,rgb(10_11_11/0.6)_0%,transparent_22%,transparent_80%,rgb(10_11_11/0.6)_100%)]" />
      </div>
      {/* Atmósfera del lado izquierdo en desktop */}
      <div aria-hidden className="absolute inset-y-0 left-0 hidden w-[42%] bg-[radial-gradient(120%_80%_at_0%_40%,#1a1b1c_0%,#0d0e0e_60%,#0a0b0b_100%)] md:block -z-10" />

      <div className="container-ec relative -mt-20 flex flex-1 flex-col justify-center pb-12 md:mt-0 md:pb-0 md:pt-24">
        <p className="eyebrow reveal text-bone/80" style={{ "--d": "100ms" } as React.CSSProperties}>
          Seminuevos · Premium · Exóticos
        </p>
        <h1
          className="reveal mt-4 text-[clamp(2.6rem,10.5vw,4.6rem)] font-light uppercase leading-[1.04] tracking-[0.01em] md:mt-5"
          style={{ "--d": "200ms" } as React.CSSProperties}
        >
          Vehículos
          <br />
          que <span className="gold-text font-semibold">destacan</span>
        </h1>
        <p className="reveal mt-4 max-w-[24ch] text-[1.15rem] font-light leading-snug text-bone/90 md:text-[1.25rem]" style={{ "--d": "300ms" } as React.CSSProperties}>
          Seleccionados para quienes buscan algo diferente.
        </p>
        <p className="reveal mt-7 flex items-center gap-2.5 text-[15px] text-bone/90" style={{ "--d": "350ms" } as React.CSSProperties}>
          <MapPin className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
          {site.location.city}, {site.location.region}.
        </p>
        <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4" style={{ "--d": "450ms" } as React.CSSProperties}>
          <Link href="/#inventario" className="btn-gold group">
            Explorar inventario <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
          </Link>
          <Link href="/#vende-tu-auto" className="btn-outline">
            Vender mi auto
          </Link>
        </div>
      </div>

      <div className="container-ec pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between pb-7 md:flex">
        <p className="tabular-nums pointer-events-auto flex items-center gap-4 text-[14px] text-bone/85" aria-live="polite">
          <span className="relative">
            {String(index + 1).padStart(2, "0")}
            <span aria-hidden className="absolute -top-2.5 left-0 h-px w-[220%] bg-bone/60" />
          </span>
          <span className="flex items-center gap-2">
            {String(slides.length).padStart(2, "0")}
            <span aria-hidden className="h-px w-8 bg-bone/40" />
          </span>
        </p>
        <div className="pointer-events-auto flex gap-6">
          <button type="button" onClick={() => go(-1)} aria-label="Imagen anterior" className="p-1 text-bone/85 transition-colors hover:text-champagne">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.4} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Imagen siguiente" className="p-1 text-bone/85 transition-colors hover:text-champagne">
            <ArrowRight className="h-5 w-5" strokeWidth={1.4} />
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { AdminLogo, DemoTag } from "./AdminBits";

/** Pantalla de acceso DEMO: sin contraseña ni autenticación; solo una entrada con transición breve. */
export function AccessScreen() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enter = () => {
    if (entering) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return router.push("/admin-demo/panel");
    setEntering(true);
    router.prefetch("/admin-demo/panel");
    timer.current = window.setTimeout(() => router.push("/admin-demo/panel"), 900);
  };

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden bg-bg text-ink">
      {/* Fotografía de marca existente (mockup del showroom), velada por el tema */}
      <Image src="/eurocars/showroom/mockup-hero-showroom.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[62%_50%] opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--bg)_8%,color-mix(in_srgb,var(--bg)_78%,transparent)_48%,color-mix(in_srgb,var(--bg)_20%,transparent)_100%)] max-md:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg)_55%,transparent)_0%,var(--bg)_72%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-[linear-gradient(0deg,var(--bg),transparent)]" />

      <header className="flex items-center justify-between px-5 pt-6 md:px-10 md:pt-8">
        <AdminLogo className="w-[88px] md:w-[112px]" />
        <ThemeSwitcher />
      </header>

      <main className="flex flex-1 items-end px-5 pb-10 pt-16 md:items-center md:px-10 md:pb-16 xl:px-20">
        <div className="max-w-[880px]">
          <p className="rise eyebrow flex items-center gap-4 text-muted">
            <span aria-hidden className="h-px w-10 bg-accent" />
            Demostración privada
          </p>
          <h1 className="rise serif-title mt-5 text-[clamp(3rem,10vw,7rem)] font-normal leading-[0.95]" style={{ "--d": "100ms" } as React.CSSProperties}>
            Eurocars AI
          </h1>
          <p className="rise mt-4 font-serif text-[clamp(1.5rem,3vw,2.2rem)] italic text-ink/90" style={{ "--d": "200ms" } as React.CSSProperties}>
            Centro de operaciones
          </p>
          <p className="rise mt-6 max-w-[46ch] text-[16px] leading-relaxed text-ink/75" style={{ "--d": "300ms" } as React.CSSProperties}>
            Un vistazo a cómo Eurocars podría operar su inventario, sus prospectos y su contenido desde un solo lugar.
          </p>
          <div className="rise mt-9 flex flex-col gap-4 sm:flex-row sm:items-center" style={{ "--d": "400ms" } as React.CSSProperties}>
            <button type="button" onClick={enter} disabled={entering} className="btn-primary group w-full sm:w-auto">
              Entrar al panel <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
            </button>
            <Link href="/es" className="inline-flex min-h-11 items-center justify-center text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/70 transition-colors hover:text-ink">
              Ver sitio público
            </Link>
          </div>
          <div className="rise mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted" style={{ "--d": "500ms" } as React.CSSProperties}>
            <DemoTag label="Entorno de demostración" />
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.5} aria-hidden />
              Sin cuentas reales. Datos ficticios, guardados solo en tu navegador.
            </span>
          </div>
        </div>
      </main>

      {entering && (
        <div aria-hidden className="fixed inset-0 z-50 grid place-items-center bg-bg">
          <span className="admin-sweep block h-px w-[min(420px,70vw)] bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]" />
        </div>
      )}
    </div>
  );
}

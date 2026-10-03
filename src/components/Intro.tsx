"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Cortina de entrada con el logo y un filete dorado (≈2.4 s), solo la primera visita de la
 * sesión y nunca con reduced-motion. La página ya está renderizada debajo (no bloquea el LCP).
 */
export function Intro() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ec-intro")) return;
      sessionStorage.setItem("ec-intro", "1");
    } catch {}
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    const id = window.setTimeout(() => setShow(false), 2700);
    return () => window.clearTimeout(id);
  }, []);
  if (!show) return null;
  return (
    <div aria-hidden className="intro fixed inset-0 z-[80] grid place-items-center bg-[#080909]">
      <div className="flex flex-col items-center">
        <Image src="/eurocars/brand/logo-extracted-light.webp" alt="" width={635} height={439} priority className="intro-logo h-auto w-[180px] md:w-[240px]" />
        <span className="intro-line mt-8 block h-px w-[220px] origin-center bg-[linear-gradient(90deg,transparent,#c6a66a,transparent)] md:w-[320px]" />
        <span className="intro-logo mt-5 text-[11px] uppercase tracking-[0.5em] text-[#c6a66a]/90" style={{ animationDelay: "600ms" }}>
          Mérida · Yucatán
        </span>
      </div>
    </div>
  );
}

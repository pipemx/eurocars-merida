"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Añade .is-in a los elementos [data-reveal] cuando entran en pantalla (una sola vez). */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    // Las imágenes .reveal-img nacen recortadas por clip-path (área visible = 0, el observer nunca las
    // vería): se observa su sección contenedora y se revela la imagen cuando ésta entra.
    const targets = new Map<Element, HTMLElement[]>();
    for (const el of els) {
      const t = el.classList.contains("reveal-img") ? (el.closest("section") ?? el) : el;
      targets.set(t, [...(targets.get(t) ?? []), el]);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            targets.get(e.target)?.forEach((el) => el.classList.add("is-in"));
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    targets.forEach((_, t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}

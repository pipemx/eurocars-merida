"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import type { VehicleImage } from "@/types/vehicle";
import { usePreferences } from "../providers/Preferences";

export function VehicleGallery({ images, title }: { images: VehicleImage[]; title: string }) {
  const { t } = usePreferences();
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const go = useCallback((d: number) => setI((x) => (x + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  const img = images[i];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.vehicle.openImage}
        className="group sheen relative block aspect-[1.45] w-full overflow-hidden bg-surface-2 ring-1 ring-line"
      >
        {images.map((im, n) => (
          <Image
            key={im.src}
            src={im.src}
            alt={im.alt}
            fill
            priority={n === 0}
            sizes="(min-width:1024px) 60vw, 100vw"
            className={`object-cover transition-[opacity,transform] duration-[1000ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03] ${n === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <span className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-night/50 text-bone opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Expand className="h-4 w-4" strokeWidth={1.5} />
        </span>
        {images.length > 1 && (
          <span className="absolute bottom-4 left-4 rounded-full bg-night/55 px-3 py-1 text-[12px] tabular-nums text-bone backdrop-blur">
            {i + 1} / {images.length}
          </span>
        )}
      </button>

      {images.length > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {images.map((im, n) => (
            <li key={im.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setI(n)}
                aria-label={`${t.vehicle.gallery} ${n + 1}`}
                aria-current={n === i}
                className={`relative block h-20 w-28 overflow-hidden ring-1 transition md:h-24 md:w-36 ${n === i ? "ring-accent" : "opacity-60 ring-line hover:opacity-100"}`}
              >
                <Image src={im.src} alt="" fill sizes="144px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[90] flex items-center justify-center bg-[#080909]/95 backdrop-blur-sm">
          <button type="button" onClick={() => setOpen(false)} aria-label={t.vehicle.close} className="absolute right-4 top-4 grid h-12 w-12 place-items-center text-bone">
            <X className="h-6 w-6" strokeWidth={1.3} />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="←" className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-bone md:left-6">
                <ArrowLeft className="h-6 w-6" strokeWidth={1.2} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="→" className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-bone md:right-6">
                <ArrowRight className="h-6 w-6" strokeWidth={1.2} />
              </button>
            </>
          )}
          <div className="relative h-[80svh] w-[92vw]">
            <Image src={img.src} alt={img.alt} fill sizes="92vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

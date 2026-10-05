"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Diálogo accesible: foco atrapado, Escape y clic fuera para cerrar, devuelve el foco al abrir.
 * En móvil se ancla abajo (hoja); en pantallas grandes se centra.
 */
export function Modal({ title, eyebrow, onClose, children, size = "md" }: { title: string; eyebrow?: string; onClose: () => void; children: React.ReactNode; size?: "md" | "lg" }) {
  const root = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    const first = root.current?.querySelector<HTMLElement>("[data-autofocus]") ?? root.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !root.current) return;
      const nodes = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;
      const a = nodes[0];
      const b = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#080909]/75 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={root} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`relative max-h-[92svh] w-full ${size === "lg" ? "max-w-[640px]" : "max-w-[480px]"} overflow-y-auto border border-line-strong/50 bg-bg p-6 text-ink shadow-[var(--shadow)] sm:p-8`}>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-2 top-2 grid h-11 w-11 place-items-center">
          <X className="h-5 w-5" strokeWidth={1.4} />
        </button>
        {eyebrow && (
          <p className="eyebrow flex items-center gap-3 text-muted">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {eyebrow}
          </p>
        )}
        <h2 id={titleId} className="serif-title mt-3 pr-8 text-[1.7rem] font-normal leading-tight">
          {title}
        </h2>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

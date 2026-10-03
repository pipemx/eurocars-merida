"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2, X } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { shareUrl } from "@/lib/vehicle-url";
import { vehicleName } from "@/lib/whatsapp";
import { FacebookIcon, WhatsappIcon } from "./icons";
import { usePreferences } from "./providers/Preferences";

/**
 * Compartir vehículo. Móvil/táctil: Web Share API nativa. Escritorio o sin soporte:
 * panel compacto con WhatsApp, Facebook y Copiar enlace.
 */
export function ShareVehicleButton({ vehicle, className = "", variant = "icon" }: { vehicle: Vehicle; className?: string; variant?: "icon" | "labeled" }) {
  const { t, locale } = usePreferences();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const name = vehicleName(vehicle, false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const url = () => shareUrl(locale, vehicle.slug);
  const text = t.share.text(name);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    track("vehicle_share", { vehicle_id: vehicle.id });
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `${name} · Eurocars Mérida`, text, url: url() });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    track("copy_vehicle_link", { vehicle_id: vehicle.id });
    window.setTimeout(() => setCopied(false), 1800);
  };

  const item = "flex min-h-11 w-full items-center gap-3 px-4 text-left text-[14px] transition-colors hover:bg-ink/[0.06]";

  return (
    <div ref={wrap} className={`relative z-10 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.share.label}: ${name}`}
        className={`group/sh flex h-11 items-center gap-2 transition-colors ${variant === "icon" ? "w-11 justify-center rounded-full bg-night/45 text-bone backdrop-blur-sm hover:bg-night/70" : "px-1 text-[12px] font-semibold uppercase tracking-[0.14em]"}`}
      >
        <Share2 className="h-4 w-4" strokeWidth={1.6} aria-hidden />
        {variant === "labeled" && t.share.label}
        {variant === "icon" && (
          <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-[2px] bg-night/80 px-2 py-1 text-[11px] text-bone opacity-0 transition-opacity [@media(hover:hover)]:group-hover/sh:opacity-100">
            {t.share.label}
          </span>
        )}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-[3px] border border-line bg-surface py-1.5 text-ink shadow-[var(--shadow)]">
          <a
            role="menuitem"
            className={item}
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("share_whatsapp", { vehicle_id: vehicle.id })}
          >
            <WhatsappIcon className="h-4 w-4 text-[#1fae55]" /> {t.share.whatsapp}
          </a>
          <a
            role="menuitem"
            className={item}
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("share_facebook", { vehicle_id: vehicle.id })}
          >
            <FacebookIcon className="h-4 w-4 text-[#1877f2]" /> {t.share.facebook}
          </a>
          <button role="menuitem" type="button" className={item} onClick={copy}>
            {copied ? <Check className="h-4 w-4 text-accent" strokeWidth={2} /> : <Link2 className="h-4 w-4" strokeWidth={1.6} />}
            <span aria-live="polite">{copied ? t.share.copied : t.share.copy}</span>
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label={t.share.close} className="absolute right-1 top-1 hidden">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

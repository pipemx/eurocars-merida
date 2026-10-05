"use client";

import { useEffect, useState } from "react";
import { Check, Columns2, Plus } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { vehicleName } from "@/lib/whatsapp";
import { compare } from "@/services/compare";
import { usePreferences } from "./providers/Preferences";

/** Agrega/quita el vehículo del comparador (máx. 3). `pill` sobre la foto, `labeled` en la ficha. */
export function CompareButton({ vehicle, variant = "pill", className = "" }: { vehicle: Vehicle; variant?: "pill" | "labeled"; className?: string }) {
  const { t } = usePreferences();
  const list = compare.useList();
  const on = list.includes(vehicle.slug);
  const [full, setFull] = useState(false);
  const name = vehicleName(vehicle);

  useEffect(() => {
    if (!full) return;
    const id = window.setTimeout(() => setFull(false), 2600);
    return () => window.clearTimeout(id);
  }, [full]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = compare.toggle(vehicle.slug);
    if (res === "full") {
      setFull(true);
      return;
    }
    track(res === "added" ? "compare_add" : "compare_remove", { vehicle_id: vehicle.id });
  };

  const label = on ? t.vehicle.compareRemove : t.vehicle.compareAdd;
  const Icon = on ? Check : variant === "pill" ? Plus : Columns2;

  return (
    <div className={`relative z-10 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        aria-label={`${label}: ${name}`}
        className={
          variant === "pill"
            ? `flex h-11 items-center gap-1.5 rounded-full px-4 text-[12px] font-medium uppercase tracking-[0.12em] backdrop-blur-sm transition-colors ${on ? "bg-accent text-accent-ink" : "bg-night/45 text-bone hover:bg-night/70"}`
            : `btn-ghost w-full !px-3 ${on ? "!border-accent !text-accent" : ""}`
        }
      >
        <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden />
        {variant === "pill" ? t.vehicle.compareAdd : label}
      </button>
      <span
        role="status"
        className={full ? `absolute left-0 z-20 w-56 rounded-[2px] border border-line bg-surface p-3 text-[12px] normal-case leading-snug tracking-normal text-ink shadow-[var(--shadow)] ${variant === "pill" ? "bottom-full mb-2" : "top-full mt-2"}` : "sr-only"}
      >
        {full ? t.compare.full : ""}
      </span>
    </div>
  );
}

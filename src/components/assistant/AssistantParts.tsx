"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Columns2, Plus } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { routePath, type Locale } from "@/i18n/config";
import { vehicleUrl } from "@/lib/vehicle-url";
import { vname } from "@/services/assistant";
import { compare, COMPARE_MAX } from "@/services/compare";
import { VehiclePhoto } from "../VehiclePhoto";

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const price = (v: Vehicle) => (v.price !== null ? `$${nf.format(v.price)} MXN` : "Precio a consultar");
const kms = (v: Vehicle) => (v.mileage !== null ? `${nf.format(v.mileage)} km` : "Km a consultar");

/** Tarjeta compacta de vehículo dentro del chat (foto real, datos del inventario, Ver vehículo / Comparar). */
export function ChatVehicleCard({ vehicle: v, locale }: { vehicle: Vehicle; locale: Locale }) {
  const list = compare.useList();
  const on = list.includes(v.slug);
  const [full, setFull] = useState(false);
  return (
    <div data-chat-card={v.slug} className="border border-line bg-surface">
      <div className="flex gap-3 p-3">
        <div className="relative aspect-[1.45] w-[104px] shrink-0 self-start overflow-hidden ring-1 ring-line">
          <VehiclePhoto vehicle={v} image={v.gallery[0]} sizes="104px" compact />
        </div>
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-muted">{v.brand}</p>
          <p className="break-words text-[15px] font-medium leading-snug">{[v.model, v.version].filter(Boolean).join(" ")}</p>
          <p className="mt-1 text-[12.5px] text-muted">{v.year}</p>
          <p className="text-[13.5px] font-medium tabular-nums text-accent">{price(v)}</p>
          <p className="text-[12.5px] tabular-nums text-ink/75">{kms(v)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 border-t border-line">
        <Link href={vehicleUrl(locale, v.slug)} className="flex min-h-11 items-center justify-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] hover:text-accent">
          Ver vehículo <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
        </Link>
        <button
          type="button"
          aria-pressed={on}
          onClick={() => {
            if (compare.toggle(v.slug) === "full") {
              setFull(true);
              window.setTimeout(() => setFull(false), 2400);
            }
          }}
          className={`flex min-h-11 items-center justify-center gap-1.5 border-l border-line text-[11.5px] font-semibold uppercase tracking-[0.12em] ${on ? "text-accent" : "hover:text-accent"}`}
        >
          {on ? <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> : <Plus className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />}
          {on ? "En comparador" : "Comparar"}
        </button>
      </div>
      {full && <p role="status" className="border-t border-line px-3 py-2 text-[12px] text-muted">Máximo {COMPARE_MAX} vehículos en el comparador.</p>}
    </div>
  );
}

/** Comparación compacta con SOLO campos existentes ("Por confirmar" si falta). */
export function ChatComparison({ vehicles, locale, onOpen }: { vehicles: Vehicle[]; locale: Locale; onOpen: () => void }) {
  const rows: [string, (v: Vehicle) => string][] = [
    ["Precio", (v) => (v.price !== null ? `$${nf.format(v.price)} MXN` : "Por confirmar")],
    ["Km", (v) => (v.mileage !== null ? `${nf.format(v.mileage)} km` : "Por confirmar")],
    ["Motor", (v) => v.engine ?? "Por confirmar"],
    ["Año", (v) => String(v.year)],
  ];
  void locale;
  return (
    <div data-chat-comparison className="border border-line bg-surface">
      <div role="table" className="grid text-[12.5px]" style={{ gridTemplateColumns: `64px repeat(${vehicles.length}, minmax(0, 1fr))` }}>
        <div role="row" className="contents">
          <div role="columnheader" className="border-b border-line p-2" />
          {vehicles.map((v) => (
            <div key={v.slug} role="columnheader" className="break-words border-b border-l border-line p-2 text-[12.5px] font-medium leading-snug">
              {vname(v)}
            </div>
          ))}
        </div>
        {rows.map(([label, get]) => (
          <div role="row" key={label} className="contents">
            <div role="rowheader" className="border-b border-line p-2 text-[10.5px] uppercase tracking-[0.12em] text-muted last:border-b-0">{label}</div>
            {vehicles.map((v) => {
              const val = get(v);
              return (
                <div key={v.slug} role="cell" className={`break-words border-b border-l border-line p-2 tabular-nums ${val === "Por confirmar" ? "text-muted" : ""}`}>
                  {val}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <button type="button" onClick={onOpen} data-open-compare className="flex min-h-11 w-full items-center justify-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] hover:text-accent">
        <Columns2 className="h-4 w-4" strokeWidth={1.6} aria-hidden /> Ver comparación completa
      </button>
    </div>
  );
}

export function openFullComparison(slugs: string[], locale: Locale, push: (href: string) => void) {
  compare.clear();
  for (const s of slugs.slice(0, COMPARE_MAX)) compare.add(s);
  push(routePath(locale, "compare"));
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { vehicleUrl } from "@/lib/vehicle-url";
import { vehicleName, whatsappHref } from "@/lib/whatsapp";
import { compare, COMPARE_MAX, COMPARE_MIN } from "@/services/compare";
import { drivetrainLabel } from "@/services/inventory/categories";
import { WhatsappIcon } from "../icons";
import { VehiclePhoto } from "../VehiclePhoto";
import { usePreferences } from "../providers/Preferences";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/**
 * /comparar: 2 a 3 vehículos desde localStorage. Solo muestra datos existentes: lo que es
 * null aparece como "Consultar"/"Por confirmar" y las filas técnicas sin ningún dato se omiten.
 */
export function CompareView({ vehicles }: { vehicles: Vehicle[] }) {
  const { t, locale } = usePreferences();
  const slugs = compare.useList();
  const picked = slugs.map((s) => vehicles.find((v) => v.slug === s)).filter((v): v is Vehicle => Boolean(v));
  const n = picked.length;
  const ready = n >= COMPARE_MIN;
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (ready) track("compare_open", { count: n });
  }, [ready, n]);

  useEffect(() => {
    if (!full) return;
    const id = window.setTimeout(() => setFull(false), 3000);
    return () => window.clearTimeout(id);
  }, [full]);

  type Row = { key: string; label: string; cell: (v: Vehicle) => string | null; fallback: string };
  const technical: Row[] = [
    { key: "engine", label: t.compare.rows.engine, cell: (v) => v.engine, fallback: t.compare.toConfirm },
    { key: "transmission", label: t.compare.rows.transmission, cell: (v) => v.transmission, fallback: t.compare.toConfirm },
    { key: "drivetrain", label: t.compare.rows.drivetrain, cell: (v) => drivetrainLabel(v, locale), fallback: t.compare.toConfirm },
    { key: "color", label: t.compare.rows.color, cell: (v) => v.exteriorColor, fallback: t.compare.toConfirm },
  ];
  const rows: Row[] = [
    { key: "year", label: t.compare.rows.year, cell: (v) => String(v.year), fallback: t.compare.toConfirm },
    { key: "category", label: t.compare.rows.category, cell: (v) => v.category.map((c) => t.inventory.categories[c]).join(", "), fallback: t.compare.toConfirm },
    { key: "price", label: t.compare.rows.price, cell: (v) => (v.price !== null ? `$${fmt.format(v.price)} MXN` : null), fallback: t.compare.toConsult },
    { key: "mileage", label: t.compare.rows.mileage, cell: (v) => (v.mileage !== null ? `${fmt.format(v.mileage)} km` : null), fallback: t.compare.toConsult },
    // Solo las filas técnicas en las que al menos un vehículo tiene un dato verificado.
    ...technical.filter((r) => picked.some((v) => r.cell(v))),
    { key: "availability", label: t.compare.rows.availability, cell: (v) => t.inventory.status[v.status], fallback: t.compare.toConfirm },
  ];

  const available = vehicles.filter((v) => !slugs.includes(v.slug));
  const names = picked.map((v) => vehicleName(v)).join(", ");

  return (
    <div className="container-ec">
      <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.08em] text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={`/${locale}`} className="hover:text-ink">{t.vehicle.breadcrumbHome}</Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">{t.compare.breadcrumb}</li>
        </ol>
      </nav>

      <header className="mt-8">
        <p className="eyebrow flex items-center gap-4 text-muted">
          <span aria-hidden className="h-px w-10 bg-accent" />
          {t.compare.eyebrow}
        </p>
        <h1 className="serif-title mt-4 text-[clamp(2.4rem,5vw,3.9rem)] font-normal">{t.compare.title}</h1>
        <p className="mt-3 max-w-[62ch] text-[15px] text-muted">{t.compare.intro}</p>
      </header>

      {ready ? (
        <section aria-label={t.compare.title} className="mt-10">
          <div role="table" style={{ "--n": n } as React.CSSProperties} className="grid grid-cols-[repeat(var(--n),minmax(0,1fr))] gap-x-3 md:grid-cols-[170px_repeat(var(--n),minmax(0,1fr))] md:gap-x-6">
            <div role="row" className="contents">
              <div role="columnheader" aria-hidden className="hidden md:block" />
              {picked.map((v) => (
                <div role="columnheader" key={v.id} className="flex min-w-0 flex-col pb-5">
                  <div className="relative aspect-[1.45] overflow-hidden ring-1 ring-line">
                    <VehiclePhoto vehicle={v} image={v.gallery[0]} sizes="(min-width:768px) 28vw, 33vw" compact />
                  </div>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{v.brand}</p>
                  <p className="serif-title mt-0.5 break-words text-[clamp(0.85rem,3vw,1.7rem)] leading-tight">{[v.model, v.version].filter(Boolean).join(" ")}</p>
                  <div className="mt-auto flex flex-col items-start pt-2">
                    <Link href={vehicleUrl(locale, v.slug)} className="inline-flex min-h-11 items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                      {t.compare.viewVehicle}
                    </Link>
                    <button type="button" onClick={() => compare.remove(v.slug)} aria-label={t.compare.remove(vehicleName(v))} className="inline-flex min-h-11 items-center text-[12px] text-muted underline underline-offset-4 hover:text-ink">
                      {t.compare.removeShort}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {rows.map((r) => (
              <div role="row" key={r.key} className="contents">
                <div role="rowheader" className="col-span-full border-t border-line pt-4 text-[11px] uppercase tracking-[0.22em] text-muted md:col-span-1 md:py-5">
                  {r.label}
                </div>
                {picked.map((v) => {
                  const val = r.cell(v);
                  return (
                    <div role="cell" key={v.id} className={`min-w-0 break-words pb-4 text-[14px] md:border-t md:border-line md:py-5 md:text-[16px] ${val ? "" : "text-muted"} ${r.key === "price" && val ? "text-accent" : ""}`}>
                      {val ?? r.fallback}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-[64ch] text-[12px] leading-snug text-muted">
            {t.compare.categoryNote} {t.vehicle.demoNote}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref(t.compare.askMessage(names))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { source: "compare" })}
              className="btn-primary w-full sm:w-auto"
            >
              <WhatsappIcon className="h-4 w-4" /> {t.compare.ask}
            </a>
            <button type="button" onClick={() => compare.clear()} className="btn-ghost w-full sm:w-auto">
              {t.compare.clear}
            </button>
          </div>
        </section>
      ) : (
        <p className="mt-10 border-l border-accent pl-6 font-serif text-[1.6rem] italic" role="status">
          {t.compare.needMore}
        </p>
      )}

      {available.length > 0 && (
        <section className="mt-16" aria-labelledby="pick-title">
          <h2 id="pick-title" className="eyebrow flex items-center gap-4 text-muted">
            <span aria-hidden className="h-px w-10 bg-accent" />
            {t.compare.pickTitle} <span className="tabular-nums">({n}/{COMPARE_MAX})</span>
          </h2>
          <p role="status" className={`mt-3 text-[13px] text-accent ${full ? "" : "sr-only"}`}>{full ? t.compare.full : ""}</p>
          <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 border-t border-line py-2">
                <span className="min-w-0 text-[15px]">
                  <span className="block truncate">{vehicleName(v)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const res = compare.add(v.slug);
                    if (res === "full") setFull(true);
                    else track("compare_add", { vehicle_id: v.id });
                  }}
                  aria-label={`${t.compare.add}: ${vehicleName(v)}`}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 px-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-accent"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.7} aria-hidden /> {t.compare.add}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

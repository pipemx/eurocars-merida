"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories } from "@/content/vehicles";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { whatsappHref } from "@/lib/whatsapp";
import { VehicleCard } from "./VehicleCard";
import { TrackedLink } from "./TrackedLink";

type CategoryId = (typeof categories)[number]["id"];

export function InventoryPreview({ vehicles }: { vehicles: Vehicle[] }) {
  const [active, setActive] = useState<CategoryId>("todos");
  const list = useMemo(
    () => (active === "todos" ? vehicles : vehicles.filter((v) => v.category.includes(active))),
    [active, vehicles],
  );

  return (
    <section id="inventario" aria-labelledby="inv-title" className="bg-carbon pb-24 pt-16 md:pb-32 md:pt-32">
      <div className="mx-auto max-w-[1760px] px-6 md:px-10 xl:px-14">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow flex items-center gap-4 text-ash">
              <span className="data text-champagne">01</span>
              <span aria-hidden className="h-px w-10 bg-line" />
              Inventario destacado
            </p>
            <h2 id="inv-title" className="display mt-6 text-[clamp(3rem,9vw,7rem)]">
              Experiencia
              <br />
              al volante
            </h2>
          </div>
          <p className="max-w-sm font-serif text-[1.35rem] italic leading-snug text-bone/70 md:col-span-5 md:justify-self-end">
            Cada unidad, elegida por cómo se ve, cómo se siente y cómo llega.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="no-scrollbar -mx-6 mt-14 flex gap-7 overflow-x-auto border-b border-line px-6 md:mx-0 md:mt-20 md:px-0"
        >
          {categories.map((c) => {
            const isActive = c.id === active;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActive(c.id);
                  track("inventory_filter", { category: c.id, location: "home" });
                }}
                className={`-mb-px shrink-0 border-b py-4 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors ${
                  isActive ? "border-champagne text-bone" : "border-transparent text-ash hover:text-bone"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <p className="sr-only" aria-live="polite">
          {list.length} vehículos en esta categoría
        </p>

        {list.length > 0 ? (
          <ul className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 md:mx-0 md:mt-14 md:grid md:snap-none md:grid-cols-2 md:gap-x-8 md:gap-y-16 md:overflow-visible md:px-0 lg:grid-cols-3 2xl:grid-cols-4">
            {list.map((v) => (
              <li key={v.id} className="w-[84%] shrink-0 snap-start sm:w-[60%] md:w-auto">
                <VehicleCard
                  vehicle={v}
                  sizes="(min-width:1536px) 25vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 84vw"
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-14 max-w-xl border-l border-champagne/60 py-2 pl-6">
            <p className="font-serif text-[1.5rem] italic leading-snug">Por ahora no hay unidades en esta categoría.</p>
            <TrackedLink
              href={whatsappHref()}
              event="whatsapp_click"
              eventParams={{ location: "inventory_empty", category: active }}
              className="group mt-4 inline-block text-[12px] font-medium uppercase tracking-[0.2em] text-champagne"
            >
              Cuéntanos qué buscas <span className="arrow">→</span>
            </TrackedLink>
          </div>
        )}

        <div className="mt-16 flex justify-start md:mt-24 md:justify-center">
          <Link
            href="/inventario"
            className="group inline-flex items-center gap-4 border-b border-bone/30 pb-2 text-[12px] font-medium uppercase tracking-[0.22em] transition-colors hover:border-champagne hover:text-champagne"
          >
            Ver inventario completo <span className="arrow" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

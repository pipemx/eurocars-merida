"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { categories, type CategoryId } from "@/services/inventory/categories";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { whatsappHref } from "@/lib/whatsapp";
import { InventoryFilters } from "./InventoryFilters";
import { VehicleCard } from "./VehicleCard";
import { usePreferences } from "./providers/Preferences";

export function InventorySection({ vehicles }: { vehicles: Vehicle[] }) {
  const { t } = usePreferences();
  const [active, setActive] = useState<CategoryId>("todos");

  const counts = useMemo(
    () => Object.fromEntries(categories.map((c) => [c, c === "todos" ? vehicles.length : vehicles.filter((v) => v.category.includes(c)).length])) as Record<CategoryId, number>,
    [vehicles],
  );
  const list = useMemo(() => (active === "todos" ? vehicles : vehicles.filter((v) => v.category.includes(active))), [active, vehicles]);

  return (
    <section id="inventario" aria-labelledby="inv-title" className="scroll-mt-20 bg-bg pb-16 pt-16 md:pb-24 md:pt-24">
      <div data-reveal className="reveal container-ec flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-4 text-muted">
            <span aria-hidden className="draw-line h-px w-10 bg-accent" />
            {t.inventory.eyebrow}
          </p>
          <h2 id="inv-title" className="serif-title mt-4 text-[clamp(2.4rem,5vw,3.9rem)] font-normal">
            {t.inventory.titleA}
            <br />
            {t.inventory.titleB}
          </h2>
        </div>
        <div className="flex items-center justify-between gap-8">
          <InventoryFilters
            active={active}
            counts={counts}
            onChange={(c) => {
              setActive(c);
              track("inventory_filter", { category: c, source: "home" });
            }}
          />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{t.inventory.count(list.length)}</p>

      {list.length > 0 ? (
          <ul className="container-ec mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {list.map((v) => (
              <li key={v.id} className="min-w-0">
                <VehicleCard vehicle={v} />
              </li>
            ))}
          </ul>
      ) : (
        <div className="container-ec mt-12 border-l border-accent pl-6">
          <p className="font-serif text-[1.6rem] italic">{t.inventory.empty}</p>
          <a
            href={whatsappHref(t.whatsapp.home)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "inventory_empty", category: active })}
            className="group mt-3 inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent"
          >
            {t.inventory.emptyCta} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.6} />
          </a>
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  const rail = useRef<HTMLUListElement>(null);

  const counts = useMemo(
    () => Object.fromEntries(categories.map((c) => [c, c === "todos" ? vehicles.length : vehicles.filter((v) => v.category.includes(c)).length])) as Record<CategoryId, number>,
    [vehicles],
  );
  const list = useMemo(() => (active === "todos" ? vehicles : vehicles.filter((v) => v.category.includes(active))), [active, vehicles]);

  // Desktop ancho: la primera tarjeta asoma a la izquierda para invitar al desplazamiento.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const start = el.children[0] as HTMLElement | undefined;
    const target = el.children[active === "todos" && list.length > 4 && window.innerWidth >= 1280 ? 1 : 0] as HTMLElement | undefined;
    el.scrollTo({ left: start && target ? target.offsetLeft - start.offsetLeft : 0, behavior: "instant" });
  }, [active, list.length]);

  const scrollBy = (dir: number) => {
    const el = rail.current;
    const card = el?.children[0] as HTMLElement | undefined;
    if (el && card) el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
  };

  return (
    <section id="inventario" aria-labelledby="inv-title" className="scroll-mt-20 bg-bg pb-16 pt-16 md:pb-24 md:pt-24">
      <div data-reveal className="reveal container-ec flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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
          <div className="hidden shrink-0 gap-3 md:flex">
            <button type="button" onClick={() => scrollBy(-1)} aria-label={t.inventory.prev} className="grid h-12 w-12 place-items-center rounded-full border border-line-strong/60 opacity-70 transition-opacity hover:opacity-100">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.4} />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label={t.inventory.next} className="grid h-12 w-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-accent hover:text-accent">
              <ArrowRight className="h-4 w-4" strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{t.inventory.count(list.length)}</p>

      {list.length > 0 ? (
        <ul
          ref={rail}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [--pad:20px] [padding-inline:var(--pad)] [scroll-padding-inline:var(--pad)] md:[--pad:40px] xl:[--pad:max(80px,calc((100vw_-_1440px)/2_+_80px))]"
        >
          {list.map((v) => (
            <li key={v.id} className="w-[82vw] max-w-[360px] shrink-0 snap-start md:w-[330px]">
              <VehicleCard vehicle={v} />
            </li>
          ))}
          <li aria-hidden className="w-px shrink-0" />
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

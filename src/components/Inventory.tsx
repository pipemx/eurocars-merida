"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { categories } from "@/content/vehicles";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { whatsappHref } from "@/lib/whatsapp";
import { VehicleCard } from "./VehicleCard";
import { TrackedLink } from "./TrackedLink";

type CategoryId = (typeof categories)[number]["id"];

export function Inventory({ vehicles }: { vehicles: Vehicle[] }) {
  const [active, setActive] = useState<CategoryId>("todos");
  const track_ = useRef<HTMLUListElement>(null);
  const list = useMemo(
    () => (active === "todos" ? vehicles : vehicles.filter((v) => v.category.includes(active))),
    [active, vehicles],
  );

  // En "Todos", la primera tarjeta queda asomando a la izquierda (como en el diseño).
  useEffect(() => {
    const el = track_.current;
    if (!el) return;
    const start = el.children[0] as HTMLElement | undefined;
    const first = el.children[active === "todos" && list.length > 4 && window.innerWidth >= 1280 ? 1 : 0] as HTMLElement | undefined;
    el.scrollTo({ left: start && first ? first.offsetLeft - start.offsetLeft : 0, behavior: "instant" });
  }, [active, list.length]);

  const scrollBy = (dir: number) => {
    const el = track_.current;
    const card = el?.children[0] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 14), behavior: "smooth" });
  };

  return (
    <section id="inventario" aria-labelledby="inv-title" className="scroll-mt-16 bg-[#0d0e0f] pb-10 pt-14 md:pt-[72px]">
      <div className="container-ec flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-bone/85">Inventario destacado</p>
          <h2 id="inv-title" className="serif-title mt-4 text-[clamp(2.4rem,5vw,3.7rem)] font-normal">
            Experiencia
            <br />
            al volante
          </h2>
        </div>
        <div className="flex items-center justify-between gap-8 lg:pb-5">
          <div role="group" aria-label="Filtrar por categoría" className="no-scrollbar -mx-5 flex gap-8 overflow-x-auto px-5 md:mx-0 md:px-0 xl:gap-[52px]">
            {categories.map((c) => {
              const on = c.id === active;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setActive(c.id);
                    track("inventory_filter", { category: c.id, location: "home" });
                  }}
                  className={`relative shrink-0 py-2 text-[14px] transition-colors ${on ? "font-medium text-bone" : "text-bone/75 hover:text-bone"}`}
                >
                  {c.label}
                  <span aria-hidden className={`absolute -bottom-1.5 left-0 h-[1.5px] bg-champagne transition-[width] duration-300 ${on ? "w-full" : "w-0"}`} />
                </button>
              );
            })}
          </div>
          <div className="hidden shrink-0 gap-4 md:flex xl:ml-10">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Anterior" className="grid h-12 w-12 place-items-center rounded-full border border-bone/20 text-bone/60 transition-colors hover:border-bone/60 hover:text-bone">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.4} />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Siguiente" className="grid h-12 w-12 place-items-center rounded-full border border-bone/60 text-bone transition-colors hover:border-champagne hover:text-champagne">
              <ArrowRight className="h-4 w-4" strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{list.length} vehículos en esta categoría</p>

      {list.length > 0 ? (
        <ul
          ref={track_}
          className="no-scrollbar mt-9 flex snap-x snap-mandatory gap-[14px] overflow-x-auto pb-4 [--pad:20px] [padding-inline:var(--pad)] [scroll-padding-inline:var(--pad)] md:[--pad:40px] xl:[--pad:max(80px,calc((100vw_-_1440px)/2_+_80px))]"
        >
          {list.map((v) => (
            <li key={v.id} className="w-[80vw] max-w-[340px] shrink-0 snap-start md:w-[316px]">
              <VehicleCard vehicle={v} />
            </li>
          ))}
          <li aria-hidden className="w-px shrink-0" />
        </ul>
      ) : (
        <div className="container-ec mt-10">
          <p className="serif-title text-[1.6rem] normal-case">Por ahora no hay unidades en esta categoría.</p>
          <TrackedLink href={whatsappHref()} event="whatsapp_click" eventParams={{ location: "inventory_empty", category: active }} className="group mt-3 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.12em] text-champagne">
            Cuéntanos qué buscas <ArrowRight className="arrow h-4 w-4" strokeWidth={1.5} />
          </TrackedLink>
        </div>
      )}
    </section>
  );
}

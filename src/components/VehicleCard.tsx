"use client";

import { ArrowRight } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import Link from "next/link";
import { vehicleUrl } from "@/lib/vehicle-url";
import { CompareButton } from "./CompareButton";
import { FavoriteButton } from "./FavoriteButton";
import { ShareVehicleButton } from "./ShareVehicleButton";
import { VehiclePhoto } from "./VehiclePhoto";
import { VehicleStatus } from "./VehicleStatus";
import { usePreferences } from "./providers/Preferences";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/**
 * Tarjeta de vehículo. Misma estructura en ambos temas.
 * Toda la tarjeta es clicable (enlace estirado a la ficha); compartir queda por encima.
 */
export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const { t, locale } = usePreferences();
  const specs = [String(v.year), v.mileage !== null ? `${fmt.format(v.mileage)} km` : t.inventory.mileageOnRequest];
  const name = [v.model, v.version].filter(Boolean).join(" ");

  return (
    <article className="gold-edge group relative flex h-full flex-col overflow-hidden rounded-[2px] bg-surface ring-1 ring-line shadow-[var(--shadow)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-editorial)] hover:-translate-y-1">
      <div className="sheen relative aspect-[1.45] overflow-hidden bg-surface-2">
        <VehiclePhoto
          vehicle={v}
          image={v.gallery[0]}
          sizes="(min-width:1280px) 330px, (min-width:768px) 42vw, 82vw"
          imageClassName="object-cover transition-[transform,filter] duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04] group-hover:contrast-[1.05]"
        />
        {/* Wrappers absolutos: los botones llevan su propio `relative` y no pueden posicionarse solos */}
        <div className="absolute left-3 top-3 z-10">
          <FavoriteButton vehicle={v} />
        </div>
        <div className="absolute right-3 top-3 z-10">
          <ShareVehicleButton vehicle={v} />
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <CompareButton vehicle={v} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] leading-[1.4] tracking-[0.05em]">
            <Link href={vehicleUrl(locale, v.slug)} className="after:absolute after:inset-0 after:content-['']">
              <span className="block text-[12px] font-medium uppercase tracking-[0.2em] text-muted">{v.brand}</span>
              <span className="mt-1 block text-[19px] tracking-[0.02em]">{name}</span>
            </Link>
          </h3>
          <VehicleStatus status={v.status} label={t.inventory.status[v.status]} />
        </div>
        <p className="mt-2 text-[14px] text-muted">
          {specs.map((s, i) => (
            <span key={s}>
              {i > 0 && <span className="mx-2 opacity-50">·</span>}
              {s}
            </span>
          ))}
        </p>
        <div aria-hidden className="min-h-5 flex-1" />
        <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
          <p className="whitespace-nowrap text-[18px] font-medium tabular-nums tracking-[0.01em] text-accent">
            {v.price !== null ? `$${fmt.format(v.price)} MXN` : t.inventory.priceOnRequest}
          </p>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong/60 transition-colors group-hover:border-accent group-hover:text-accent">
            <ArrowRight className="arrow h-4 w-4" strokeWidth={1.4} aria-hidden />
            <span className="sr-only">{t.inventory.view}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

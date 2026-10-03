"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { whatsappHref, vehicleName } from "@/lib/whatsapp";
import { ShareVehicleButton } from "./ShareVehicleButton";
import { VehicleStatus } from "./VehicleStatus";
import { usePreferences } from "./providers/Preferences";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/**
 * Tarjeta de vehículo. Dark: panel sutil. Light: sin panel, foto + tipografía + filete.
 * Toda la tarjeta es clicable (enlace estirado); compartir queda por encima.
 * Hasta tener fichas individuales, el clic abre WhatsApp con el vehículo.
 */
export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const { t } = usePreferences();
  const specs = [String(v.year), v.mileage !== null ? `${fmt.format(v.mileage)} km` : null, t.inventory.automatic].filter(Boolean) as string[];
  const name = [v.model, v.version].filter(Boolean).join(" ");

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2px] bg-surface ring-1 ring-line light:bg-transparent light:ring-0">
      <div className="relative aspect-[1.45] overflow-hidden bg-surface-2">
        <Image
          src={v.coverImage.src}
          alt={v.coverImage.alt}
          fill
          sizes="(min-width:1280px) 330px, (min-width:768px) 42vw, 82vw"
          className="object-cover transition-[transform,filter] duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.025] group-hover:contrast-[1.04]"
        />
        <ShareVehicleButton vehicle={v} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 light:px-0 light:pb-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] leading-[1.4] tracking-[0.05em]">
            <a
              href={whatsappHref(t.whatsapp.vehicle(vehicleName(v)))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { source: "vehicle_card", vehicle_id: v.id })}
              className="after:absolute after:inset-0 after:content-['']"
            >
              <span className="block text-[12px] font-medium uppercase tracking-[0.2em] text-muted">{v.brand}</span>
              <span className="mt-1 block text-[19px] tracking-[0.02em]">{name}</span>
              <span className="sr-only">— {t.inventory.ask}</span>
            </a>
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
          <p className="text-[19px] font-medium tabular-nums tracking-[0.02em] text-accent">
            {v.price !== null ? `$${fmt.format(v.price)} MXN` : t.inventory.priceOnRequest}
          </p>
          <ArrowRight className="arrow mb-1 h-4 w-4 opacity-70" strokeWidth={1.4} aria-hidden />
        </div>
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/types/vehicle";
import { formatMileage, formatPrice } from "@/lib/format";
import { PreviewTag } from "./PreviewTag";

const statusLabel = { available: "Disponible", reserved: "Apartado", sold: "Vendido" } as const;

export function VehicleCard({ vehicle: v, sizes }: { vehicle: Vehicle; sizes: string }) {
  const specs = [String(v.year), formatMileage(v.mileage, v.isPlaceholder), v.transmission].filter(Boolean);
  return (
    <article className="group relative">
      <div className="relative aspect-[3/2] overflow-hidden bg-graphite-2">
        <Image
          src={v.coverImage.src}
          alt={v.coverImage.alt}
          fill
          sizes={sizes}
          className="object-cover brightness-[0.92] transition-[transform,filter] duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.025] group-hover:brightness-100 group-hover:contrast-[1.05]"
        />
        {v.isPlaceholder && <PreviewTag className="absolute left-3 top-3">Ejemplo · sin foto</PreviewTag>}
        {v.status !== "available" && (
          <span className="absolute right-3 top-3 bg-carbon/80 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-bone">
            {statusLabel[v.status]}
          </span>
        )}
      </div>

      <div className="pt-5">
        <p className="eyebrow text-ash">{v.brand}</p>
        <h3 className="mt-2 text-[1.45rem] font-medium leading-tight tracking-[-0.01em] [font-stretch:88%]">
          <Link href={`/inventario/${v.slug}`} className="after:absolute after:inset-0">
            {v.model} <span className="text-bone/60">{v.version}</span>
          </Link>
        </h3>
        <p className="data mt-3 text-[13px] text-ash">{specs.join("  ·  ")}</p>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
          <p className="data text-[1.05rem] font-medium tracking-[0.01em] text-champagne">
            {formatPrice(v.price, v.isPlaceholder)}
          </p>
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-bone/80 transition-colors group-hover:text-bone">
            Ver vehículo <span className="arrow" aria-hidden>→</span>
          </span>
        </div>
      </div>
    </article>
  );
}

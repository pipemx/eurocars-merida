import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { formatMileage, formatPrice } from "@/lib/format";

const statusLabel = { available: "Disponible", reserved: "Apartado", sold: "Vendido" } as const;

export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const specs = [String(v.year), formatMileage(v.mileage), v.transmission].filter(Boolean) as string[];
  const name = [v.model, v.version].filter(Boolean).join(" ");
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[3px] border border-bone/[0.06] bg-panel">
      <div className="relative aspect-[1.45] overflow-hidden">
        <Image
          src={v.coverImage.src}
          alt={v.coverImage.alt}
          fill
          sizes="(min-width:1280px) 316px, (min-width:768px) 40vw, 80vw"
          className="object-cover transition-[transform,filter] duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.03] group-hover:brightness-110"
        />
        {v.status !== "available" && (
          <span className="absolute left-3 top-3 bg-carbon/85 px-2 py-1 text-[10px] uppercase tracking-[0.2em]">{statusLabel[v.status]}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-[22px] pb-6 pt-5">
        <h3 className="text-[16px] leading-[1.45] tracking-[0.06em]">
          <Link href={`/inventario/${v.slug}`} className="after:absolute after:inset-0">
            <span className="block uppercase">{v.brand}</span>
            <span className="block">{name}</span>
          </Link>
        </h3>
        <p className="mt-2 text-[13.5px] text-bone/75">
          {specs.map((s, i) => (
            <span key={s}>
              {i > 0 && <span className="mx-2 text-bone/40">|</span>}
              {s}
            </span>
          ))}
        </p>
        <p className="mt-4 text-[20px] font-medium tracking-[0.04em] text-champagne-soft">{formatPrice(v.price)}</p>
        <div className="mt-auto flex items-center gap-3 pt-6">
          <span aria-hidden className="h-px flex-1 bg-bone/30 transition-colors group-hover:bg-champagne/70" />
          <ArrowRight className="arrow h-4 w-4 text-bone/85" strokeWidth={1.4} aria-hidden />
          <span className="sr-only">Ver vehículo</span>
        </div>
      </div>
    </article>
  );
}

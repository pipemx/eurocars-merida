"use client";

import Image from "next/image";
import type { Vehicle, VehicleImage } from "@/types/vehicle";
import { usePreferences } from "./providers/Preferences";

type Props = {
  vehicle: Pick<Vehicle, "brand" | "model" | "version" | "year">;
  /** Si no hay imagen real se muestra el placeholder (TEMPORAL: no es una fotografía). */
  image?: VehicleImage | null;
  sizes: string;
  priority?: boolean;
  /** Versión mínima para miniaturas: sin leyenda. */
  compact?: boolean;
  imageClassName?: string;
};

/**
 * Fotografía del vehículo con fallback. Llena a su contenedor (position: relative).
 * El placeholder es deliberadamente neutro (sin silueta de auto) para no sugerir una
 * carrocería ni hacerse pasar por una foto. Se sustituye al cargar `gallery` real.
 */
export function VehiclePhoto({ vehicle, image, sizes, priority, compact, imageClassName = "object-cover" }: Props) {
  const { t } = usePreferences();

  if (image) {
    return <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className={imageClassName} />;
  }

  return (
    <div
      role="img"
      aria-label={`${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.year} — ${t.inventory.photoPending}`}
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_90%_at_70%_0%,var(--surface),var(--surface-2))] [container-type:inline-size]"
    >
      <span aria-hidden className="absolute inset-[6%] border border-line" />
      <span aria-hidden className="absolute inset-x-[6%] top-1/2 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)] opacity-40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[10%] text-center">
        <span className="block text-[min(3.4cqw,12px)] font-medium uppercase tracking-[0.3em] text-muted">{vehicle.brand}</span>
        <span className="serif-title mt-[2cqw] block text-[clamp(18px,9cqw,56px)] leading-[1.05] text-ink/90">{vehicle.model}</span>
      </div>
      {!compact && (
        <span className="absolute bottom-[9%] left-[10%] right-[10%] flex items-center justify-center gap-2 text-[min(3.2cqw,11px)] uppercase tracking-[0.22em] text-muted">
          <span aria-hidden className="h-px w-5 bg-accent" />
          {t.inventory.photoPending}
        </span>
      )}
    </div>
  );
}

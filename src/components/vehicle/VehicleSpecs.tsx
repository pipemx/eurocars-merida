import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Vehicle } from "@/types/vehicle";
import { drivetrainLabel } from "@/services/inventory/categories";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Ficha técnica: solo muestra lo verificado; lo desconocido queda "Por confirmar". */
export function VehicleSpecs({ v, t, locale }: { v: Vehicle; t: Dictionary; locale: Locale }) {
  const rows: [string, string | null, string][] = [
    [t.vehicle.year, String(v.year), t.vehicle.toConfirm],
    [t.vehicle.mileage, v.mileage !== null ? `${fmt.format(v.mileage)} km` : null, t.inventory.mileageOnRequest],
    [t.vehicle.engine, v.engine, t.vehicle.toConfirm],
    [t.vehicle.transmission, v.transmission, t.vehicle.toConfirm],
    [t.vehicle.drivetrain, drivetrainLabel(v, locale), t.vehicle.toConfirm],
    [t.vehicle.color, v.exteriorColor, t.vehicle.toConfirm],
  ];
  return (
    <dl className="grid grid-cols-2 border-t border-line md:grid-cols-3">
      {rows.map(([k, val, fallback]) => (
        <div key={k} className="border-b border-line py-5 pr-4">
          <dt className="text-[11px] uppercase tracking-[0.22em] text-muted">{k}</dt>
          <dd className={`mt-2 text-[17px] ${val ? "" : "text-muted"}`}>{val ?? fallback}</dd>
        </div>
      ))}
    </dl>
  );
}

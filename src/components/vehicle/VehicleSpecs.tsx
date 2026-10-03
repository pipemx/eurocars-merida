import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Vehicle } from "@/types/vehicle";
import { drivetrainLabel } from "@/content/vehicles";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function VehicleSpecs({ v, t, locale }: { v: Vehicle; t: Dictionary; locale: Locale }) {
  const rows: [string, string | null][] = [
    [t.vehicle.year, String(v.year)],
    [t.vehicle.mileage, v.mileage !== null ? `${fmt.format(v.mileage)} km` : null],
    [t.vehicle.engine, v.engine],
    [t.vehicle.transmission, t.inventory.automatic],
    [t.vehicle.drivetrain, drivetrainLabel(v, locale)],
    [t.vehicle.color, v.exteriorColor],
  ];
  return (
    <dl className="grid grid-cols-2 border-t border-line md:grid-cols-3">
      {rows.map(([k, val]) => (
        <div key={k} className="border-b border-line py-5 pr-4">
          <dt className="text-[11px] uppercase tracking-[0.22em] text-muted">{k}</dt>
          <dd className={`mt-2 text-[17px] ${val ? "" : "text-muted"}`}>{val ?? t.vehicle.toConfirm}</dd>
        </div>
      ))}
    </dl>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { favorites } from "@/services/favorites";
import { VehicleCard } from "../VehicleCard";
import { usePreferences } from "../providers/Preferences";

/** /favoritos: vehículos guardados en localStorage. */
export function FavoritesView({ vehicles }: { vehicles: Vehicle[] }) {
  const { t, locale } = usePreferences();
  const slugs = favorites.useList();
  const saved = slugs.map((s) => vehicles.find((v) => v.slug === s)).filter((v): v is Vehicle => Boolean(v));

  return (
    <div className="container-ec">
      <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.08em] text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={`/${locale}`} className="hover:text-ink">{t.vehicle.breadcrumbHome}</Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">{t.favorites.breadcrumb}</li>
        </ol>
      </nav>

      <header className="mt-8">
        <p className="eyebrow flex items-center gap-4 text-muted">
          <span aria-hidden className="h-px w-10 bg-accent" />
          {t.favorites.eyebrow}
        </p>
        <h1 className="serif-title mt-4 text-[clamp(2.4rem,5vw,3.9rem)] font-normal">{t.favorites.title}</h1>
        <p className="mt-3 max-w-[56ch] text-[15px] text-muted">{t.favorites.intro}</p>
      </header>

      {saved.length > 0 ? (
        <>
          <p className="mt-8 text-[13px] text-muted" aria-live="polite">{t.favorites.count(saved.length)}</p>
          <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((v) => (
              <li key={v.id}>
                <VehicleCard vehicle={v} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-12 border-l border-accent pl-6">
          <Heart className="h-6 w-6 text-accent" strokeWidth={1.4} aria-hidden />
          <p className="mt-3 font-serif text-[1.8rem] italic">{t.favorites.empty}</p>
          <p className="mt-2 text-[15px] text-muted">{t.favorites.emptyBody}</p>
          <Link href={`/${locale}#inventario`} className="group mt-4 inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
            {t.favorites.browse} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.6} />
          </Link>
        </div>
      )}
    </div>
  );
}

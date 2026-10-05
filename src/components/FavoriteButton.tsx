"use client";

import { Heart } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { vehicleName } from "@/lib/whatsapp";
import { favorites } from "@/services/favorites";
import { usePreferences } from "./providers/Preferences";

/** Corazón de favoritos (localStorage). `icon` para tarjetas, `labeled` para la ficha. */
export function FavoriteButton({ vehicle, variant = "icon", className = "" }: { vehicle: Vehicle; variant?: "icon" | "labeled"; className?: string }) {
  const { t } = usePreferences();
  const list = favorites.useList();
  const on = list.includes(vehicle.slug);
  const name = vehicleName(vehicle);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = favorites.toggle(vehicle.slug);
    track(res === "added" ? "favorite_add" : "favorite_remove", { vehicle_id: vehicle.id });
  };

  const heart = <Heart className={`h-[18px] w-[18px] transition-transform duration-300 ${on ? "scale-110 fill-current text-accent" : ""}`} strokeWidth={1.6} aria-hidden />;

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        aria-label={on ? t.favorites.remove(name) : t.favorites.add(name)}
        className={`btn-ghost w-full !px-3 ${className}`}
      >
        {heart} {on ? t.vehicle.favoriteRemove : t.vehicle.favoriteAdd}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? t.favorites.remove(name) : t.favorites.add(name)}
      className={`relative z-10 grid h-11 w-11 place-items-center rounded-full bg-night/45 text-bone backdrop-blur-sm transition-colors hover:bg-night/70 ${className}`}
    >
      {heart}
    </button>
  );
}

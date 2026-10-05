"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { routePath } from "@/i18n/config";
import { favorites } from "@/services/favorites";
import { usePreferences } from "./providers/Preferences";

/** Acceso a favoritos en el header, con contador. */
export function FavoritesLink({ className = "" }: { className?: string }) {
  const { t, locale } = usePreferences();
  const count = favorites.useList().length;
  return (
    <Link href={routePath(locale, "favorites")} aria-label={count ? `${t.favorites.aria} (${count})` : t.favorites.aria} className={`relative grid h-11 w-11 place-items-center transition-opacity hover:opacity-100 ${count ? "opacity-100" : "opacity-85"} ${className}`}>
      <Heart className={`h-[19px] w-[19px] ${count ? "fill-current text-accent" : ""}`} strokeWidth={1.5} aria-hidden />
      {count > 0 && (
        <span aria-hidden className="absolute right-1 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none tabular-nums text-accent-ink">
          {count}
        </span>
      )}
    </Link>
  );
}

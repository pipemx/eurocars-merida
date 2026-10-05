import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hreflang, isLocale, routePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getVehicles } from "@/services/inventory";
import { FavoritesView } from "@/components/collection/FavoritesView";
import { PageShell } from "@/components/PageShell";

/** /en/favorites: contenido guardado en el navegador (localStorage); no se indexa. */
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary("en");
  return {
    title: t.favorites.title,
    description: t.favorites.intro,
    alternates: {
      canonical: routePath("en", "favorites"),
      languages: { [hreflang.es]: routePath("es", "favorites"), [hreflang.en]: routePath("en", "favorites"), "x-default": routePath("es", "favorites") },
    },
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale !== "en") notFound();
  return (
    <PageShell locale="en">
      <FavoritesView vehicles={await getVehicles()} />
    </PageShell>
  );
}

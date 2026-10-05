import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hreflang, isLocale, routePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getVehicles } from "@/services/inventory";
import { CompareView } from "@/components/collection/CompareView";
import { PageShell } from "@/components/PageShell";

/** /es/comparar: contenido guardado en el navegador (localStorage); no se indexa. */
export function generateStaticParams() {
  return [{ locale: "es" }];
}

export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary("es");
  return {
    title: t.compare.title,
    description: t.compare.intro,
    alternates: {
      canonical: routePath("es", "compare"),
      languages: { [hreflang.es]: routePath("es", "compare"), [hreflang.en]: routePath("en", "compare"), "x-default": routePath("es", "compare") },
    },
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale !== "es") notFound();
  return (
    <PageShell locale="es">
      <CompareView vehicles={await getVehicles()} />
    </PageShell>
  );
}

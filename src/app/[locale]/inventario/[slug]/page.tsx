import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getVehicle, vehicles } from "@/content/vehicles";
import { vehicleMetadata } from "@/lib/vehicle-metadata";
import { VehicleDetail } from "@/components/vehicle/VehicleDetail";

/** Ficha de vehículo — ruta /es/inventario/[slug] (solo existe para el idioma "es"). */
export function generateStaticParams() {
  return vehicles.map((v) => ({ locale: "es", slug: v.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale, slug } = await params;
  if (locale !== "es") return {};
  return vehicleMetadata("es", slug);
}

export default async function Page({ params }: Params) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale !== "es") notFound();
  const v = getVehicle(slug);
  if (!v) notFound();
  return <VehicleDetail v={v} locale="es" />;
}

import type { Metadata } from "next";
import { VehicleEditor } from "@/components/admin/VehicleEditor";
import { getVehicles } from "@/services/inventory";

export const metadata: Metadata = { title: "Editar vehículo" };

// Los 8 vehículos demo se pregeneran; los agregados desde el panel (solo en el navegador) se resuelven en cliente.
export async function generateStaticParams() {
  return (await getVehicles()).map((v) => ({ slug: v.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <VehicleEditor slug={slug} />;
}

import type { Metadata } from "next";
import { VehicleCreate } from "@/components/admin/VehicleEditor";

export const metadata: Metadata = { title: "Agregar vehículo" };

export default function Page() {
  return <VehicleCreate />;
}

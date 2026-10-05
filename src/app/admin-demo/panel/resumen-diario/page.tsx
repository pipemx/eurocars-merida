import type { Metadata } from "next";
import { ComingNext } from "@/components/admin/ComingNext";

export const metadata: Metadata = { title: "Resumen diario" };

export default function Page() {
  return (
    <ComingNext
      eyebrow="Resumen diario"
      title="Resumen diario"
      summary="Lo importante, cada mañana."
      bullets={[
    "Un resumen por correo con los prospectos que requieren atención, las pruebas de manejo del día y los recordatorios.",
    "Prospectos que requieren seguimiento",
    "Pruebas de manejo programadas",
    "Recordatorios del día",
  ]}
    />
  );
}

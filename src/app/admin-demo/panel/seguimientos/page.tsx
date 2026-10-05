import type { Metadata } from "next";
import { ComingNext } from "@/components/admin/ComingNext";

export const metadata: Metadata = { title: "Seguimientos" };

export default function Page() {
  return (
    <ComingNext
      eyebrow="Seguimientos"
      title="Seguimientos"
      summary="Quién necesita respuesta hoy."
      bullets={[
    "Una lista ordenada por urgencia, con lo vencido primero, para que ninguna persona se quede sin respuesta.",
    "Indicadores: Vencido, Hoy y Próximamente",
    "Acción sugerida para cada prospecto",
    "Conectado con el resumen diario",
  ]}
    />
  );
}

import type { Metadata } from "next";
import { ComingNext } from "@/components/admin/ComingNext";

export const metadata: Metadata = { title: "Prospectos" };

export default function Page() {
  return (
    <ComingNext
      eyebrow="Prospectos"
      title="Prospectos"
      summary="Todas las consultas, en un solo lugar."
      bullets={[
    "Cada persona que escribe por la web, WhatsApp, Instagram, Facebook o Google, con su vehículo de interés, su historial y su estado.",
    "Estados: Nuevo, Contactado, Seguimiento, Cita agendada, Negociación y Vendido",
    "Ficha de cada prospecto con línea de tiempo",
    "Origen de cada consulta",
  ]}
    />
  );
}

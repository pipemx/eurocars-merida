import type { Metadata } from "next";
import { ComingNext } from "@/components/admin/ComingNext";

export const metadata: Metadata = { title: "Contenido IA" };

export default function Page() {
  return (
    <ComingNext
      eyebrow="Contenido IA"
      title="Contenido IA"
      summary="Publicaciones y textos, listos para revisar."
      bullets={[
    "Descripciones, contenido SEO y publicaciones para redes generados a partir de los datos de cada vehículo.",
    "Descripción web y contenido SEO",
    "Instagram, Facebook, Marketplace y WhatsApp",
    "Siempre con tu revisión antes de usarse",
  ]}
    />
  );
}

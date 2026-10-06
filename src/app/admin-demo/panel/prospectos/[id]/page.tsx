import type { Metadata } from "next";
import { LeadDetail } from "@/components/admin/crm/LeadDetail";
import { getLeads } from "@/services/crm";

export const metadata: Metadata = { title: "Prospecto" };

// Los prospectos creados desde el asistente (solo en el navegador) se resuelven en cliente.
export async function generateStaticParams() {
  return (await getLeads()).map((l) => ({ id: l.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeadDetail id={id} />;
}

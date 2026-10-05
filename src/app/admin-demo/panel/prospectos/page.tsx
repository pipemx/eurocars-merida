import type { Metadata } from "next";
import { LeadsView } from "@/components/admin/crm/LeadsView";

export const metadata: Metadata = { title: "Prospectos" };

export default function Page() {
  return <LeadsView />;
}

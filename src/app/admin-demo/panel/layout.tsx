import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminShell } from "@/components/admin/AdminShell";
import { getLeads } from "@/services/crm";
import { getVehicles } from "@/services/inventory";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [vehicles, leads] = await Promise.all([getVehicles(), getLeads()]);
  return (
    <AdminProviders base={vehicles} baseLeads={leads}>
      <AdminShell>{children}</AdminShell>
    </AdminProviders>
  );
}

import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminShell } from "@/components/admin/AdminShell";
import { getLeads, summarizeLeads } from "@/services/crm";
import { getVehicles } from "@/services/inventory";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [vehicles, leads] = await Promise.all([getVehicles(), getLeads()]);
  return (
    <AdminProviders base={vehicles}>
      <AdminShell pending={summarizeLeads(leads).pendingFollowUps}>{children}</AdminShell>
    </AdminProviders>
  );
}

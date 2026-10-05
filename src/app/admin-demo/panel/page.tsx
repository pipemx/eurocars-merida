import type { Metadata } from "next";
import { DashboardView } from "@/components/admin/DashboardView";
import { getInsightProvider } from "@/services/ai";
import { getLeads, getRecentActivity, pendingFollowUps } from "@/services/crm";

export const metadata: Metadata = { title: "Resumen" };

export default async function Page() {
  const [leads, activity] = await Promise.all([getLeads(), getRecentActivity()]);
  const insight = await getInsightProvider().getInventoryInsight({
    leads: leads.map((l) => ({ id: l.id, slug: l.vehicleSlug, pending: pendingFollowUps(leads).some((p) => p.id === l.id) })),
    activityVehicleSlugs: activity.map((a) => a.vehicleSlug),
  });
  return <DashboardView leads={leads} activity={activity} insight={insight} />;
}

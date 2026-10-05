import type { Metadata } from "next";
import { DashboardView } from "@/components/admin/DashboardView";
import { getRecentActivity } from "@/services/crm";

export const metadata: Metadata = { title: "Resumen" };

export default async function Page() {
  return <DashboardView activity={await getRecentActivity()} />;
}

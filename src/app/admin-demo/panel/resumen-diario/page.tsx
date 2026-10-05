import type { Metadata } from "next";
import { DailySummaryView } from "@/components/admin/crm/DailySummaryView";

export const metadata: Metadata = { title: "Resumen diario" };

export default function Page() {
  return <DailySummaryView />;
}

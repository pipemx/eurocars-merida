import type { Metadata } from "next";
import { InventoryView } from "@/components/admin/InventoryView";

export const metadata: Metadata = { title: "Inventario" };

export default function Page() {
  return <InventoryView />;
}

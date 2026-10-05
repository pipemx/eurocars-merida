import type { Metadata } from "next";
import { FollowUpsView } from "@/components/admin/crm/FollowUpsView";

export const metadata: Metadata = { title: "Seguimientos" };

export default function Page() {
  return <FollowUpsView />;
}

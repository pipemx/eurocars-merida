import type { Metadata } from "next";
import { ContentLibrary } from "@/components/admin/studio/ContentLibrary";

export const metadata: Metadata = { title: "Contenido IA" };

export default function Page() {
  return <ContentLibrary />;
}

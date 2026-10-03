import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InventoryPreview } from "@/components/InventoryPreview";
import { vehicles } from "@/content/vehicles";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <InventoryPreview vehicles={vehicles.filter((v) => v.featured)} />
      </main>
    </>
  );
}

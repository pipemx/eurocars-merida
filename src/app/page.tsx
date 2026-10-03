import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesStrip } from "@/components/ServicesStrip";
import { Inventory } from "@/components/Inventory";
import { Financing } from "@/components/Financing";
import { SellCar } from "@/components/SellCar";
import { Trust } from "@/components/Trust";
import { LocationFooter } from "@/components/LocationFooter";
import { PreviewNotice } from "@/components/PreviewNotice";
import { vehicles } from "@/content/vehicles";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServicesStrip />
        <Inventory vehicles={vehicles.filter((v) => v.featured)} />
        <Financing />
        <SellCar />
        <Trust />
      </main>
      <LocationFooter />
      <PreviewNotice />
    </>
  );
}

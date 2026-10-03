import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { vehicles } from "@/content/vehicles";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServiceStrip } from "@/components/ServiceStrip";
import { InventorySection } from "@/components/InventorySection";
import { FinancingSection } from "@/components/FinancingSection";
import { SellYourCarSection } from "@/components/SellYourCarSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Footer } from "@/components/Footer";
import { LocationPreview } from "@/components/LocationPreview";
import { BrandMarquee } from "@/components/BrandMarquee";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <Header />
      <main id="contenido">
        <Hero />
        <ServiceStrip t={t} />
        <InventorySection vehicles={vehicles.filter((v) => v.featured)} />
        <FinancingSection t={t} />
        <SellYourCarSection t={t} />
        <BrandMarquee />
        <ReviewsSection t={t} locale={locale} />
        <LocationPreview />
      </main>
      <Footer t={t} locale={locale} />
      <FloatingWhatsApp source="home" />
    </>
  );
}

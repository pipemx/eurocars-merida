import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { hreflang, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PreferencesProvider, themeInitScript } from "@/components/providers/Preferences";
import { RevealObserver } from "@/components/RevealObserver";
import { Intro } from "@/components/Intro";
import { CompareBar } from "@/components/CompareBar";
import { DemoWhatsApp } from "@/components/DemoWhatsApp";
import { vehicleName } from "@/lib/whatsapp";
import { getVehicles } from "@/services/inventory";
import { cormorant, jost } from "@/lib/fonts";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: "%s · Eurocars Mérida" },
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { [hreflang.es]: "/es", [hreflang.en]: "/en", "x-default": "/es" },
    },
    openGraph: {
      type: "website",
      siteName: "Eurocars Mérida",
      locale: locale === "es" ? "es_MX" : "en_US",
      title: t.meta.title,
      description: t.meta.description,
      url: `/${locale}`,
      images: [{ url: "/eurocars/og/home.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    // Vista previa con contenido sin verificar: no indexar todavía.
    robots: site.isPreview ? { index: false, follow: false } : undefined,
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080909" },
    { media: "(prefers-color-scheme: light)", color: "#F4F2ED" },
  ],
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const compareItems = (await getVehicles()).map((v) => ({ slug: v.slug, name: vehicleName(v) }));
  return (
    <html lang={hreflang[locale]} data-theme="dark" className={`${jost.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="grain">
        <PreferencesProvider locale={locale}>
          <Intro />
          {children}
          <CompareBar items={compareItems} />
          <DemoWhatsApp />
          <RevealObserver />
        </PreferencesProvider>
      </body>
    </html>
  );
}

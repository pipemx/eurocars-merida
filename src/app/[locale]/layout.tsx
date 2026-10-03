import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { hreflang, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PreferencesProvider, themeInitScript } from "@/components/providers/Preferences";
import "../globals.css";

const jost = localFont({
  src: [
    { path: "../../fonts/jost-latin-300-normal.woff2", weight: "300" },
    { path: "../../fonts/jost-latin-400-normal.woff2", weight: "400" },
    { path: "../../fonts/jost-latin-500-normal.woff2", weight: "500" },
    { path: "../../fonts/jost-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-jost",
  display: "swap",
});

const cormorant = localFont({
  src: [
    { path: "../../fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400" },
    { path: "../../fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

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
      images: [{ url: "/eurocars/showroom/mockup-hero-showroom.webp", width: 2308, height: 1428 }],
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
  return (
    <html lang={hreflang[locale]} data-theme="dark" className={`${jost.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <PreferencesProvider locale={locale}>{children}</PreferencesProvider>
      </body>
    </html>
  );
}

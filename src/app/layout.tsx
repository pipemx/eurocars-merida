import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/content/site";
import "./globals.css";

const jost = localFont({
  src: [
    { path: "../fonts/jost-latin-300-normal.woff2", weight: "300" },
    { path: "../fonts/jost-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/jost-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/jost-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-jost",
  display: "swap",
});

const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Eurocars Mérida — Autos seminuevos premium en Mérida, Yucatán",
    template: "%s · Eurocars Mérida",
  },
  description:
    "Vehículos seminuevos seleccionados en Mérida, Yucatán. Compra, venta y consignación.",
  // Vista previa con datos de ejemplo: no indexar hasta publicar contenido real.
  robots: site.isPreview ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#0A0B0B",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${jost.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}

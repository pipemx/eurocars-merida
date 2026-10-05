import type { Metadata, Viewport } from "next";
import { PreferencesProvider, themeInitScript } from "@/components/providers/Preferences";
import { cormorant, jost } from "@/lib/fonts";
import "../globals.css";

// Admin demo: privado y nunca indexable (metadata + cabecera X-Robots-Tag en next.config.ts).
export const metadata: Metadata = {
  title: { default: "Eurocars AI — Centro de operaciones", template: "%s · Eurocars AI" },
  description: "Entorno de demostración privado.",
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080909" },
    { media: "(prefers-color-scheme: light)", color: "#F4F2ED" },
  ],
};

export default function AdminDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" data-theme="dark" className={`${jost.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <PreferencesProvider locale="es" persistLocale={false}>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}

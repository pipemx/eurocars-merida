import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { FloatingWhatsApp } from "./FloatingWhatsApp";
import { Footer } from "./Footer";
import { Header } from "./Header";

/** Marco común para páginas interiores (favoritos, comparador): header, contenido y pie. */
export function PageShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = getDictionary(locale);
  return (
    <>
      <Header />
      <main id="contenido" className="bg-bg pb-24 pt-[96px] md:pt-[124px]">
        {children}
      </main>
      <Footer t={t} locale={locale} />
      <FloatingWhatsApp source="collection" />
    </>
  );
}

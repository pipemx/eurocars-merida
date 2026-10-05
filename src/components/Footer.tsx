import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site } from "@/content/site";
import { DEMO_MODE } from "@/lib/demo-mode";
import { SocialLinks } from "./SocialLinks";

export function Footer({ t, locale }: { t: Dictionary; locale: Locale }) {
  const base = `/${locale}`;
  const links = [
    { label: t.nav.inventory, href: `${base}#inventario` },
    { label: t.nav.financing, href: `${base}#financiamiento` },
    { label: t.nav.sell, href: `${base}#vende-tu-auto` },
    { label: t.nav.contact, href: `${base}#contacto` },
  ];
  return (
    <footer className="relative border-t border-line bg-surface">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)] opacity-60" />
      <div className="container-ec flex flex-col gap-10 py-12 md:flex-row md:items-center md:justify-between">
        <Link href={base} aria-label="Eurocars Mérida" className="block w-[120px]">
          <Image src="/eurocars/brand/logo-extracted-light.webp" alt="Eurocars" width={635} height={439} className="h-auto w-full light:hidden" />
          <Image src="/eurocars/brand/logo-mono-dark.webp" alt="Eurocars" width={635} height={439} className="hidden h-auto w-full light:block" />
        </Link>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-[12px] font-medium uppercase tracking-[0.16em] opacity-75 transition-opacity hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <SocialLinks location="footer" />
      </div>
      <div className="border-t border-line">
        <div className="container-ec flex flex-col gap-1 py-5 text-[12px] text-muted md:flex-row md:justify-between" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
          <p>
            © {new Date().getFullYear()} Eurocars Mérida. {t.footer.rights}
          </p>
          <p>
            {DEMO_MODE ? t.footer.city : `${t.footer.city} · ${site.whatsapp.display}`}
          </p>
        </div>
      </div>
    </footer>
  );
}

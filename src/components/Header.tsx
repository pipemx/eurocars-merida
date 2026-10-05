"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { routePath } from "@/i18n/config";
import { AnimatedEurocarsLogo, eurocarsLogoProps } from "./AnimatedEurocarsLogo";
import { FavoritesLink } from "./FavoritesLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { SocialLinks } from "./SocialLinks";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePreferences } from "./providers/Preferences";

export function useNavItems() {
  const { locale, t } = usePreferences();
  const base = `/${locale}`;
  return [
    { label: t.nav.home, href: base, id: "home" },
    { label: t.nav.inventory, href: `${base}#inventario`, id: "inventory" },
    { label: t.nav.sell, href: `${base}#vende-tu-auto`, id: "sell" },
    { label: t.nav.financing, href: `${base}#financiamiento`, id: "financing" },
    { label: t.nav.about, href: `${base}#nosotros`, id: "about" },
    { label: t.nav.contact, href: `${base}#contacto`, id: "contact" },
  ];
}

export function Header() {
  const { locale, t } = usePreferences();
  const items = useNavItems();
  const pathname = usePathname();
  const activeId = pathname === `/${locale}` ? "home" : pathname.startsWith(routePath(locale, "inventory")) ? "inventory" : "";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-full focus-visible:bg-ink focus-visible:px-5 focus-visible:py-2.5 focus-visible:text-[13px] focus-visible:text-bg focus-visible:shadow-lg"
      >
        {t.nav.skip}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-ink transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid
            ? "border-b border-line bg-bg/85 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className={`container-ec flex items-center justify-between gap-6 transition-[height] duration-500 ${solid ? "h-[72px]" : "h-[84px] md:h-[112px]"}`}>
          <Link href={`/${locale}`} aria-label="Eurocars Mérida" className="shrink-0">
            <AnimatedEurocarsLogo
              {...eurocarsLogoProps}
              className={`transition-[width] duration-500 ${solid ? "w-[78px] md:w-[88px]" : "w-[92px] md:w-[124px]"}`}
            />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-7 xl:gap-10">
              {items.map((item) => {
                const active = item.id === activeId;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="group relative block py-3 text-[11.5px] font-medium uppercase tracking-[0.14em] opacity-85 transition-opacity hover:opacity-100 aria-[current=page]:opacity-100"
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={`absolute bottom-1 left-0 h-px bg-accent transition-[width] duration-300 ease-[var(--ease-editorial)] ${active ? "w-full" : "w-0 group-hover:w-full"}`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            <SocialLinks location="header" className="hidden xl:flex" />
            <span aria-hidden className="mx-2 hidden h-5 w-px bg-line-strong/50 xl:block" />
            <FavoritesLink />
            <LanguageSwitcher className="hidden md:flex" />
            <ThemeSwitcher className="ml-2 hidden md:flex" />
            <ThemeSwitcher compact className="md:hidden" />
            <button
              type="button"
              className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[6px] lg:hidden"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={open}
              aria-controls="menu-movil"
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
        <MobileMenu open={open} onClose={() => setOpen(false)} items={items} />
      </header>
    </>
  );
}

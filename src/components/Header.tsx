"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";
import { whatsappHref } from "@/lib/whatsapp";
import { Wordmark } from "./Logo";
import { TrackedLink } from "./TrackedLink";

const socials = [
  { label: "Instagram", short: "IG", href: site.social.instagram },
  { label: "Facebook", short: "FB", href: site.social.facebook },
  { label: "TikTok", short: "TT", href: site.social.tiktok },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,height,border-color] duration-500 ease-[var(--ease-editorial)] ${
        solid ? "border-b border-line bg-carbon/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1760px] items-center justify-between gap-6 px-6 transition-[height] duration-500 md:px-10 xl:px-14 ${
          solid ? "h-16" : "h-20 md:h-24"
        }`}
      >
        <Wordmark className={`shrink-0 transition-[width] duration-500 ${solid ? "w-[124px]" : "w-[136px] md:w-[164px]"}`} />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8 xl:gap-10">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={item.href === "/" ? "page" : undefined}
                  className="link-underline pb-1 text-[12px] font-medium uppercase tracking-[0.16em] text-bone/80 transition-colors hover:text-bone"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-5">
          <ul className="hidden items-center gap-4 xl:flex" aria-label="Redes sociales">
            {socials.map((s) => (
              <li key={s.short}>
                <TrackedLink
                  href={s.href}
                  event="social_click"
                  eventParams={{ network: s.label, location: "header" }}
                  aria-label={s.label}
                  className="text-[11px] font-medium tracking-[0.2em] text-ash transition-colors hover:text-bone"
                >
                  {s.short}
                </TrackedLink>
              </li>
            ))}
          </ul>
          <span aria-hidden className="hidden h-4 w-px bg-line xl:block" />
          <TrackedLink
            href={whatsappHref()}
            event="whatsapp_click"
            eventParams={{ location: "header" }}
            className="group inline-flex items-center gap-2 border border-bone/25 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-bone transition-colors hover:border-champagne hover:text-champagne md:px-4"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-champagne" />
            WhatsApp
          </TrackedLink>
          <button
            type="button"
            className="-mr-2 p-2 text-[11px] font-medium uppercase tracking-[0.2em] text-bone lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>

      <div
        id="menu-movil"
        hidden={!open}
        className="h-[calc(100svh-4rem)] overflow-y-auto bg-carbon px-6 pb-10 pt-8 lg:hidden"
      >
        <nav aria-label="Principal móvil">
          <ol className="border-t border-line">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-5 py-5"
                >
                  <span className="data text-[11px] tracking-[0.2em] text-ash">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-[2.4rem] leading-none">{item.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <ul className="mt-10 flex gap-6" aria-label="Redes sociales">
          {socials.map((s) => (
            <li key={s.short}>
              <TrackedLink
                href={s.href}
                event="social_click"
                eventParams={{ network: s.label, location: "menu" }}
                className="text-[12px] uppercase tracking-[0.2em] text-ash"
              >
                {s.label}
              </TrackedLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

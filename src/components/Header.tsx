"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { whatsappHref } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { Socials } from "./Socials";
import { TrackedLink } from "./TrackedLink";
import { WhatsappIcon } from "./icons";

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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? "border-b border-line bg-carbon/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className={`container-ec flex items-center justify-between gap-6 transition-[height] duration-500 ${solid ? "h-[68px]" : "h-[84px] md:h-[104px]"}`}>
        <Logo priority className={`shrink-0 transition-[width] duration-500 ${solid ? "w-[84px]" : "w-[96px] md:w-[124px]"}`} />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-11">
            {nav.map((item) => {
              const active = item.href === "/";
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors hover:text-bone ${
                      active ? "text-bone" : "text-bone/85"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute -bottom-2 left-0 h-px bg-champagne transition-[width] duration-300 ${active ? "w-full" : "w-0"}`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-5 xl:gap-9">
          <Socials location="header" className="hidden xl:flex" />
          <TrackedLink
            href={whatsappHref()}
            event="whatsapp_click"
            eventParams={{ location: "header" }}
            className="inline-flex items-center gap-2.5 rounded-[3px] border border-champagne/45 bg-carbon/30 px-4 py-2.5 text-[12px] font-medium text-bone transition-colors hover:border-champagne md:px-6 md:py-3"
          >
            <WhatsappIcon className="h-4 w-4" />
            WhatsApp
          </TrackedLink>
          <button
            type="button"
            className="-mr-2 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`h-px w-6 bg-bone transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-bone transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div id="menu-movil" hidden={!open} className="h-[calc(100svh-68px)] overflow-y-auto bg-carbon px-5 pb-10 pt-6 lg:hidden">
        <nav aria-label="Principal móvil">
          <ul className="border-t border-line">
            {nav.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link href={item.href} onClick={() => setOpen(false)} className="serif-title block py-5 text-[2rem]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Socials location="menu" className="mt-10" />
      </div>
    </header>
  );
}

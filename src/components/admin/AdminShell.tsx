"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BellRing, Car, ExternalLink, LayoutDashboard, LogOut, Mail, Menu, Sparkles, Users, X } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { AdminLogo, DemoTag } from "./AdminBits";

const BASE = "/admin-demo/panel";

type Item = { id: string; label: string; href: string; icon: typeof Car; soon?: boolean };

const items: Item[] = [
  { id: "resumen", label: "Resumen", href: BASE, icon: LayoutDashboard },
  { id: "inventario", label: "Inventario", href: `${BASE}/inventario`, icon: Car },
  { id: "prospectos", label: "Prospectos", href: `${BASE}/prospectos`, icon: Users, soon: true },
  { id: "seguimientos", label: "Seguimientos", href: `${BASE}/seguimientos`, icon: BellRing, soon: true },
  { id: "contenido", label: "Contenido IA", href: `${BASE}/contenido-ia`, icon: Sparkles },
  { id: "diario", label: "Resumen diario", href: `${BASE}/resumen-diario`, icon: Mail, soon: true },
];

function Nav({ pending, onNavigate }: { pending: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === BASE ? pathname === BASE : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav aria-label="Panel">
      <ul className="space-y-1">
        {items.map((it) => {
          const active = isActive(it.href);
          const Icon = it.icon;
          return (
            <li key={it.id}>
              <Link
                href={it.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group relative flex min-h-12 items-center gap-4 px-4 text-[12.5px] font-medium uppercase tracking-[0.12em] transition-colors ${active ? "bg-ink/[0.06] text-ink" : "text-ink/65 hover:bg-ink/[0.04] hover:text-ink"}`}
              >
                <span aria-hidden className={`absolute inset-y-2 left-0 w-[2px] bg-accent transition-transform duration-300 ease-[var(--ease-editorial)] ${active ? "scale-y-100" : "scale-y-0"}`} />
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-accent" : ""}`} strokeWidth={1.5} aria-hidden />
                <span className={`flex-1 ${it.soon ? "opacity-80" : ""}`}>{it.label}</span>
                {it.id === "seguimientos" && pending > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold leading-none tabular-nums text-accent-ink" aria-label={`${pending} pendientes`}>
                    {pending}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarBody({ pending, onNavigate }: { pending: number; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-8">
        <Link href={BASE} onClick={onNavigate} aria-label="Eurocars AI — Resumen" className="block">
          <AdminLogo className="w-[112px]" />
        </Link>
        <p className="eyebrow mt-4 text-muted">Centro de operaciones</p>
      </div>
      <div className="mt-8 flex-1 overflow-y-auto px-3">
        <Nav pending={pending} onNavigate={onNavigate} />
      </div>
      <div className="space-y-4 border-t border-line px-6 py-5">
        <div>
          <DemoTag label="Entorno de demostración" />
          <p className="mt-2 text-[12px] leading-snug text-muted">Todos los datos son ficticios y se guardan solo en este navegador.</p>
        </div>
        <div className="flex items-center justify-between">
          <ThemeSwitcher className="-ml-1" />
          <div className="flex items-center gap-1">
            <Link href="/es" onClick={onNavigate} title="Ver sitio público" aria-label="Ver sitio público" className="grid h-11 w-11 place-items-center text-ink/70 hover:text-ink">
              <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.4} />
            </Link>
            <Link href="/admin-demo" onClick={onNavigate} title="Salir del demo" aria-label="Salir del demo" className="grid h-11 w-11 place-items-center text-ink/70 hover:text-ink">
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.4} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Marco del panel: sidebar fija en escritorio, barra superior + menú lateral deslizable en móvil/tablet. */
export function AdminShell({ pending, children }: { pending: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-svh bg-bg text-ink">
      <a href="#panel-contenido" className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:bg-ink focus-visible:px-4 focus-visible:py-2 focus-visible:text-bg">
        Saltar al contenido
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-line bg-surface lg:block">
        <SidebarBody pending={pending} />
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur-md lg:hidden">
        <Link href={BASE} aria-label="Eurocars AI — Resumen" className="flex items-center gap-3">
          <AdminLogo className="w-[64px]" />
          <DemoTag label="Demo" />
        </Link>
        <div className="flex items-center">
          <ThemeSwitcher compact />
          <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open} aria-controls="menu-panel" className="grid h-11 w-11 place-items-center">
            <Menu className="h-5 w-5" strokeWidth={1.4} />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#080909]/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div id="menu-panel" role="dialog" aria-modal="true" aria-label="Menú del panel" className="rise absolute inset-y-0 left-0 w-[min(320px,86vw)] border-r border-line bg-surface">
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="absolute right-2 top-3 grid h-11 w-11 place-items-center">
              <X className="h-5 w-5" strokeWidth={1.4} />
            </button>
            <SidebarBody pending={pending} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main id="panel-contenido" className="px-5 pb-20 pt-[88px] md:px-8 lg:pl-[calc(264px+40px)] lg:pr-10 lg:pt-12 xl:pl-[calc(264px+64px)] xl:pr-16">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}

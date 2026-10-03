"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SocialLinks } from "./SocialLinks";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePreferences } from "./providers/Preferences";

type Item = { label: string; href: string; id: string };

export function MobileMenu({ open, onClose, items }: { open: boolean; onClose: () => void; items: Item[] }) {
  const { t } = usePreferences();

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      id="menu-movil"
      hidden={!open}
      className="h-[calc(100dvh-72px)] overflow-y-auto bg-bg px-5 pt-4 lg:hidden"
      style={{ paddingBottom: "calc(32px + env(safe-area-inset-bottom))" }}
    >
      <nav aria-label="Principal móvil">
        <ol className="border-t border-line">
          {items.map((item, i) => (
            <li key={item.id} className="border-b border-line">
              <Link href={item.href} onClick={onClose} className="flex items-baseline gap-5 py-[18px]">
                <span className="text-[12px] tabular-nums tracking-[0.2em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="serif-title text-[1.9rem]">{item.label}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-8 flex items-center justify-between">
        <LanguageSwitcher />
        <div className="flex items-center gap-3 text-[13px] text-muted">
          {t.theme.label}
          <ThemeSwitcher />
        </div>
      </div>
      <SocialLinks location="menu" showHandles className="mt-6" />
    </div>
  );
}

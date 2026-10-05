"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { vehicleName, whatsappHref } from "@/lib/whatsapp";
import { submitTestDriveRequest } from "@/services/inquiries";
import { WhatsappIcon } from "../icons";
import { usePreferences } from "../providers/Preferences";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Solicitud de prueba de manejo (DEMO): se guarda solo en el navegador, no se envía a nadie. */
export function TestDriveDialog({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const { t } = usePreferences();
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name: "", phone: "", date: "", slot: "morning" as "morning" | "afternoon", notes: "" });
  const [today] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const name = vehicleName(vehicle);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    root.current?.querySelector<HTMLElement>("input")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !root.current) return;
      const nodes = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = { name: !form.name.trim(), phone: form.phone.replace(/\D/g, "").length < 8, date: !form.date };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setBusy(true);
    await submitTestDriveRequest({ vehicleSlug: vehicle.slug, name: form.name.trim(), phone: form.phone.trim(), preferredDate: form.date, preferredSlot: form.slot, notes: form.notes.trim() });
    track("test_drive_demo_submit", { vehicle_id: vehicle.id });
    setBusy(false);
    setDone(true);
  };

  const field = "mt-2 block min-h-12 w-full border border-line-strong/60 bg-transparent px-4 text-[16px] text-ink outline-none transition-colors focus:border-accent";
  const label = "block text-[11px] uppercase tracking-[0.22em] text-muted";
  const err = (k: string) => (errors[k] ? <p className="mt-1.5 text-[12px] text-[#e0735a]">{t.testDrive.required}</p> : null);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#080909]/80 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={root} role="dialog" aria-modal="true" aria-labelledby="td-title" className="relative max-h-[94svh] w-full max-w-[520px] overflow-y-auto border border-line bg-bg p-6 text-ink shadow-[var(--shadow)] sm:p-8">
        <button type="button" onClick={onClose} aria-label={t.testDrive.close} className="absolute right-2 top-2 grid h-11 w-11 place-items-center">
          <X className="h-5 w-5" strokeWidth={1.4} />
        </button>
        <p className="eyebrow flex items-center gap-3 text-muted">
          <span aria-hidden className="h-px w-8 bg-accent" />
          {t.testDrive.demoTag}
        </p>
        <h2 id="td-title" className="serif-title mt-3 pr-8 text-[1.9rem] font-normal leading-tight">
          {t.testDrive.title}: {name}
        </h2>

        {done ? (
          <div className="mt-6">
            <p className="flex items-center gap-2 text-[17px] font-medium">
              <CheckCircle2 className="h-5 w-5 text-accent" strokeWidth={1.6} aria-hidden /> {t.testDrive.successTitle}
            </p>
            <p className="mt-3 text-[15px] text-ink/80">{t.testDrive.successBody}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappHref(t.testDrive.whatsappMessage(name))} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto">
                <WhatsappIcon className="h-4 w-4" /> {t.testDrive.whatsapp}
              </a>
              <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto">
                {t.testDrive.close}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5">
            <p className="border-l border-accent pl-4 text-[13px] leading-snug text-muted">{t.testDrive.demoBanner}</p>
            <div className="mt-6 space-y-5">
              <div>
                <label className={label} htmlFor="td-name">{t.testDrive.name}</label>
                <input id="td-name" className={field} value={form.name} onChange={set("name")} autoComplete="name" aria-invalid={errors.name || undefined} />
                {err("name")}
              </div>
              <div>
                <label className={label} htmlFor="td-phone">{t.testDrive.phone}</label>
                <input id="td-phone" className={field} value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" aria-invalid={errors.phone || undefined} />
                {err("phone")}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="td-date">{t.testDrive.date}</label>
                  <input id="td-date" className={field} value={form.date} onChange={set("date")} type="date" min={today} aria-invalid={errors.date || undefined} />
                  {err("date")}
                </div>
                <div>
                  <label className={label} htmlFor="td-slot">{t.testDrive.slot}</label>
                  <select id="td-slot" className={`${field} bg-bg`} value={form.slot} onChange={set("slot")}>
                    <option value="morning">{t.testDrive.morning}</option>
                    <option value="afternoon">{t.testDrive.afternoon}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={label} htmlFor="td-notes">{t.testDrive.notes}</label>
                <textarea id="td-notes" rows={3} className={`${field} py-3`} value={form.notes} onChange={set("notes")} />
              </div>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
              <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
                {t.testDrive.submit}
              </button>
              <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto">
                {t.testDrive.cancel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

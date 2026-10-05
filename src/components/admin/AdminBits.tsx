import Image from "next/image";
import { initials } from "@/lib/admin-format";
import type { FollowUpState } from "@/types/crm";
import type { VehicleStatus } from "@/types/vehicle";

/** Etiqueta discreta: la cifra o el texto es ficticio (demostración). */
export function DemoTag({ label = "Datos demo", className = "" }: { label?: string; className?: string }) {
  return (
    <span title="Dato ficticio de demostración" className={`inline-flex items-center rounded-full border border-line-strong/50 px-2 py-[3px] text-[9.5px] font-medium uppercase leading-none tracking-[0.16em] text-muted ${className}`}>
      {label}
    </span>
  );
}

/** Logo estático (mismo par de imágenes que el pie del sitio público). */
export function AdminLogo({ className = "w-[104px]" }: { className?: string }) {
  return (
    <span className={`block ${className}`}>
      <Image src="/eurocars/brand/logo-extracted-light.webp" alt="Eurocars" width={635} height={439} priority className="h-auto w-full light:hidden" />
      <Image src="/eurocars/brand/logo-mono-dark.webp" alt="Eurocars" width={635} height={439} priority className="hidden h-auto w-full light:block" />
    </span>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`eyebrow flex items-center gap-4 text-muted ${className}`}>
      <span aria-hidden className="h-px w-8 shrink-0 bg-accent" />
      {children}
    </p>
  );
}

/** `long` = títulos largos (nombre de vehículo): tipografía menor y acciones debajo del título. */
export function PageHeader({ eyebrow, title, children, long = false }: { eyebrow: string; title: string; children?: React.ReactNode; long?: boolean }) {
  return (
    <header className={`rise flex flex-col gap-6 ${long ? "" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className={`serif-title mt-4 break-words font-normal ${long ? "text-[clamp(1.7rem,3.2vw,2.6rem)]" : "text-[clamp(2.2rem,4.4vw,3.4rem)]"}`}>{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </header>
  );
}

const statusDot: Record<VehicleStatus, string> = { available: "bg-[#4caf7a]", reserved: "bg-accent", sold: "bg-muted" };
const statusText: Record<VehicleStatus, string> = { available: "Disponible", reserved: "Apartado", sold: "Vendido" };

export function StatusChip({ status }: { status: VehicleStatus }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink/85">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {statusText[status]}
    </span>
  );
}

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-strong/50 bg-surface-2 font-serif text-[15px] tracking-[0.04em] text-ink ${className}`}>
      {initials(name)}
    </span>
  );
}

const dueStyles: Record<FollowUpState, { label: string; cls: string }> = {
  overdue: { label: "Vencido", cls: "border-[#e0735a]/50 text-[#e0735a]" },
  today: { label: "Hoy", cls: "border-accent/60 text-accent" },
  upcoming: { label: "Próximamente", cls: "border-line-strong/50 text-muted" },
};

export function DueChip({ state }: { state: FollowUpState }) {
  const s = dueStyles[state];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10.5px] font-medium uppercase leading-none tracking-[0.14em] ${s.cls}`}>{s.label}</span>;
}

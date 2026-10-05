"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Pencil, Plus, RotateCcw, Share2, Sparkles } from "lucide-react";
import { formatDate, vehicleTitle } from "@/lib/admin-format";
import { restoreAll } from "@/services/inventory/admin";
import type { AdminVehicle } from "@/services/inventory/admin";
import { VehiclePhoto } from "../VehiclePhoto";
import { DemoTag, PageHeader, StatusChip } from "./AdminBits";
import { useAdmin } from "./AdminProviders";
import { ContentTeaser } from "./ContentTeaser";
import { Modal } from "./Modal";

const BASE = "/admin-demo/panel";

function RowBadges({ v }: { v: AdminVehicle }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      {v.origin === "added" && <DemoTag label="Agregado por ti" />}
      {v.edited && <DemoTag label="Editado" />}
    </span>
  );
}

const iconBtn = "grid h-11 w-11 shrink-0 place-items-center text-ink/70 transition-colors hover:bg-ink/[0.06] hover:text-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink/70";

export function InventoryView() {
  const { vehicles, hasLocalChanges, highlightSlug, toast } = useAdmin();
  const [teaser, setTeaser] = useState<AdminVehicle | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const share = async (v: AdminVehicle) => {
    if (v.origin === "added") return toast("Este vehículo aún no tiene ficha pública (solo existe en tu demo).", "error");
    const url = `${window.location.origin}/es/inventario/${v.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Enlace de la ficha copiado.");
    } catch {
      toast(`No se pudo copiar automáticamente: ${url}`, "error");
    }
  };

  const withoutPhoto = vehicles.filter((v) => v.gallery.length === 0).length;

  return (
    <div>
      <PageHeader eyebrow="Inventario" title="Vehículos">
        {hasLocalChanges && (
          <button type="button" onClick={() => setConfirmRestore(true)} className="btn-ghost group !px-5">
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Restaurar datos demo
          </button>
        )}
        <Link href={`${BASE}/inventario/nuevo`} className="btn-primary group !px-6">
          <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden /> Agregar vehículo
        </Link>
      </PageHeader>

      <p className="rise mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-muted" style={{ "--d": "80ms" } as React.CSSProperties}>
        <span>
          {vehicles.length} {vehicles.length === 1 ? "vehículo" : "vehículos"}
        </span>
        <span aria-hidden>·</span>
        <span>{withoutPhoto === 0 ? "todos con fotografía" : `${withoutPhoto} sin fotografía real`}</span>
        <DemoTag label="Inventario demo" />
      </p>

      <div className="rise mt-8" style={{ "--d": "140ms" } as React.CSSProperties}>
        <div role="row" className="hidden grid-cols-[minmax(0,1fr)_72px_130px_auto] items-center gap-6 border-b border-line-strong/50 pb-3 text-[11px] uppercase tracking-[0.22em] text-muted lg:grid xl:grid-cols-[minmax(0,1fr)_72px_130px_130px_auto]">
          <span>Vehículo</span>
          <span>Año</span>
          <span>Estado</span>
          <span className="hidden xl:block">Actualizado</span>
          <span className="w-[176px] text-right">Acciones</span>
        </div>

        <ul>
          {vehicles.map((v) => {
            const title = vehicleTitle(v);
            const isNew = highlightSlug === v.slug;
            const href = `${BASE}/inventario/${v.slug}`;
            return (
              <li key={v.slug} className={`border-b border-line transition-colors duration-700 ${isNew ? "bg-accent/10" : ""}`}>
                <div className="grid items-center gap-x-6 gap-y-4 py-5 lg:grid-cols-[minmax(0,1fr)_72px_130px_auto] xl:grid-cols-[minmax(0,1fr)_72px_130px_130px_auto]">
                  <div className="flex min-w-0 items-center gap-4">
                    <Link href={href} aria-label={`Editar ${title}`} className="relative block aspect-[1.45] w-24 shrink-0 overflow-hidden ring-1 ring-line sm:w-28">
                      <VehiclePhoto vehicle={v} image={v.gallery[0]} sizes="112px" compact />
                    </Link>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{v.brand}</p>
                      <Link href={href} className="mt-0.5 block break-words text-[17px] leading-snug hover:text-accent">
                        {[v.model, v.version].filter(Boolean).join(" ")}
                      </Link>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted lg:hidden">
                        <span>{v.year}</span>
                        <StatusChip status={v.status} />
                      </p>
                      <p className="mt-1 text-[12px] text-muted xl:hidden">Actualizado {formatDate(v.updatedAt)}</p>
                      <div className="mt-2 empty:hidden">
                        <RowBadges v={v} />
                      </div>
                    </div>
                  </div>
                  <span className="hidden text-[15px] tabular-nums lg:block">{v.year}</span>
                  <span className="hidden lg:block">
                    <StatusChip status={v.status} />
                  </span>
                  <span className="hidden text-[13px] text-muted xl:block">{formatDate(v.updatedAt)}</span>

                  <div className="grid grid-cols-4 gap-1 border-t border-line pt-3 lg:flex lg:w-[176px] lg:justify-end lg:border-0 lg:pt-0">
                    {v.origin === "demo" ? (
                      <a href={`/es/inventario/${v.slug}`} target="_blank" rel="noopener noreferrer" title="Ver ficha pública" aria-label={`Ver ficha pública de ${title}`} className={`${iconBtn} max-lg:w-full max-lg:flex-col max-lg:gap-1 max-lg:py-2`}>
                        <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                        <span className="text-[10.5px] uppercase tracking-[0.1em] lg:hidden">Ver ficha</span>
                      </a>
                    ) : (
                      <button type="button" disabled title="Sin ficha pública en esta demo" aria-label={`${title}: sin ficha pública en esta demo`} className={`${iconBtn} max-lg:w-full max-lg:flex-col max-lg:gap-1 max-lg:py-2`}>
                        <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                        <span className="text-[10.5px] uppercase tracking-[0.1em] lg:hidden">Ver ficha</span>
                      </button>
                    )}
                    <Link href={href} title="Editar" aria-label={`Editar ${title}`} className={`${iconBtn} max-lg:w-full max-lg:flex-col max-lg:gap-1 max-lg:py-2`}>
                      <Pencil className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                      <span className="text-[10.5px] uppercase tracking-[0.1em] lg:hidden">Editar</span>
                    </Link>
                    <button type="button" onClick={() => setTeaser(v)} title="Crear contenido" aria-label={`Crear contenido de ${title}`} className={`${iconBtn} max-lg:w-full max-lg:flex-col max-lg:gap-1 max-lg:py-2`}>
                      <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                      <span className="text-[10.5px] uppercase tracking-[0.1em] lg:hidden">Contenido</span>
                    </button>
                    <button type="button" onClick={() => share(v)} title="Compartir" aria-label={`Compartir ${title}`} className={`${iconBtn} max-lg:w-full max-lg:flex-col max-lg:gap-1 max-lg:py-2`}>
                      <Share2 className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                      <span className="text-[10.5px] uppercase tracking-[0.1em] lg:hidden">Compartir</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {teaser && <ContentTeaser vehicle={teaser} onClose={() => setTeaser(null)} />}

      {confirmRestore && (
        <Modal title="Restaurar datos demo" eyebrow="Confirmación" onClose={() => setConfirmRestore(false)}>
          <p className="text-[15px] leading-relaxed text-ink/85">Se descartarán tus ediciones y los vehículos que agregaste, y el inventario volverá a los 8 vehículos originales de la demo.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              className="btn-primary w-full sm:w-auto"
              onClick={() => {
                restoreAll();
                setConfirmRestore(false);
                toast("Datos demo restaurados.");
              }}
            >
              Restaurar
            </button>
            <button type="button" data-autofocus className="btn-ghost w-full sm:w-auto" onClick={() => setConfirmRestore(false)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { formatSaved, vehicleTitle } from "@/lib/admin-format";
import { useContentDrafts } from "@/services/ai/content-drafts";
import { VehiclePhoto } from "../../VehiclePhoto";
import { DemoTag, PageHeader } from "../AdminBits";
import { useAdmin } from "../AdminProviders";

const BASE = "/admin-demo/panel";

function StatusLine({ draft }: { draft: boolean }) {
  return (
    <span data-status className={`inline-flex items-center gap-2 text-[14px] ${draft ? "text-accent" : "text-ink/70"}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${draft ? "bg-accent" : "bg-line-strong"}`} />
      {draft ? "Borrador" : "Sin generar"}
    </span>
  );
}

/** Biblioteca de contenido: cada vehículo con su estado de generación; desde aquí se abre Content Studio. */
export function ContentLibrary() {
  const { vehicles } = useAdmin();
  const drafts = useContentDrafts();
  const withDraft = vehicles.filter((v) => drafts[v.slug]).length;

  return (
    <div>
      <PageHeader eyebrow="Eurocars AI" title="Contenido IA">
        <DemoTag label="Generado con plantillas (demo)" />
      </PageHeader>

      <p className="rise mt-6 max-w-[62ch] text-[15px] leading-relaxed text-ink/80" style={{ "--d": "80ms" } as React.CSSProperties}>
        Elige un vehículo y Eurocars AI prepara su descripción web, SEO, Instagram, Facebook, Marketplace, WhatsApp y versión en inglés.
      </p>
      <p className="rise mt-3 text-[14px] text-muted" style={{ "--d": "120ms" } as React.CSSProperties}>
        {withDraft} con borrador · {vehicles.length - withDraft} sin generar
      </p>

      <div className="rise mt-8" style={{ "--d": "160ms" } as React.CSSProperties}>
        <div role="row" className="hidden grid-cols-[minmax(0,1fr)_140px_170px_250px] items-center gap-6 border-b border-line-strong/50 pb-3 text-[11px] uppercase tracking-[0.22em] text-muted xl:grid">
          <span>Vehículo</span>
          <span>Estado</span>
          <span>Última generación</span>
          <span className="text-right">Acción</span>
        </div>
        <ul>
          {vehicles.map((v) => {
            const d = drafts[v.slug];
            const name = vehicleTitle(v);
            const href = `${BASE}/contenido-ia/${v.slug}`;
            return (
              <li key={v.slug} className="border-b border-line">
                <div className="grid items-center gap-x-6 gap-y-4 py-5 md:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_140px_170px_250px]">
                  <div className="flex min-w-0 items-center gap-4">
                    <Link href={href} aria-label={`Abrir Content Studio de ${name}`} className="relative block aspect-[1.45] w-24 shrink-0 overflow-hidden ring-1 ring-line sm:w-28">
                      <VehiclePhoto vehicle={v} image={v.gallery[0]} sizes="112px" compact />
                    </Link>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{v.brand}</p>
                      <p className="mt-0.5 break-words text-[17px] leading-snug">
                        {[v.model, v.version].filter(Boolean).join(" ")} <span className="text-muted">{v.year}</span>
                      </p>
                      <div className="mt-1.5 xl:hidden">
                        <StatusLine draft={Boolean(d)} />
                        <p className="mt-0.5 text-[12.5px] text-muted">Última generación: {d ? formatSaved(d.savedAt) : "—"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden xl:block">
                    <StatusLine draft={Boolean(d)} />
                  </div>
                  <p className="hidden text-[14px] text-ink/80 xl:block">{d ? formatSaved(d.savedAt) : "—"}</p>
                  <div className="md:flex md:justify-end">
                    <Link href={href} className={`group w-full whitespace-nowrap md:w-auto ${d ? "btn-ghost" : "btn-primary"} !min-h-11 !px-5`}>
                      <Sparkles className="h-4 w-4" strokeWidth={1.6} aria-hidden /> {d ? "Abrir Studio" : "Crear contenido"}
                      <ArrowRight className="arrow h-4 w-4" strokeWidth={1.6} aria-hidden />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

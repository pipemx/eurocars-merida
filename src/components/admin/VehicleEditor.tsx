"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, RotateCcw, Sparkles } from "lucide-react";
import { formatDate, vehicleTitle } from "@/lib/admin-format";
import { addVehicle, emptyFormValues, restoreVehicle, saveVehicle, vehicleToValues, type AdminVehicle } from "@/services/inventory/admin";
import { VehiclePhoto } from "../VehiclePhoto";
import { DemoTag, Eyebrow, PageHeader, StatusChip } from "./AdminBits";
import { useAdmin } from "./AdminProviders";
import { ContentTeaser } from "./ContentTeaser";
import { Modal } from "./Modal";
import { VehicleForm } from "./VehicleForm";

const BASE = "/admin-demo/panel";
const INV = `${BASE}/inventario`;

function BackLink() {
  return (
    <Link href={INV} className="group inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:text-ink">
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.6} aria-hidden /> Inventario
    </Link>
  );
}

/** Alta de vehículo: guarda en localStorage (isDemo) y vuelve al inventario con la fila resaltada. */
export function VehicleCreate() {
  const router = useRouter();
  const { toast, highlight } = useAdmin();
  return (
    <div>
      <BackLink />
      <div className="mt-4">
        <PageHeader eyebrow="Inventario" title="Agregar vehículo" />
      </div>
      <p className="rise mt-5 max-w-[62ch] text-[14px] leading-relaxed text-muted" style={{ "--d": "80ms" } as React.CSSProperties}>
        Solo marca, modelo y año son obligatorios. Lo demás puede quedar vacío y se mostrará como “a consultar”. El vehículo se guarda únicamente en este navegador y no tendrá ficha pública en esta demo.
      </p>
      <div className="rise mt-10 max-w-[820px]" style={{ "--d": "140ms" } as React.CSSProperties}>
        <VehicleForm
          initial={emptyFormValues}
          submitLabel="Agregar vehículo"
          cancelHref={INV}
          onError={(m) => toast(m, "error")}
          onSubmit={(values) => {
            const res = addVehicle(values);
            if (!res.ok) return false;
            highlight(res.slug);
            toast("Vehículo agregado (demo). Ya aparece en el inventario.");
            router.push(INV);
            return true;
          }}
        />
      </div>
    </div>
  );
}

const optionalFields: { key: string; label: string; done: (v: AdminVehicle) => boolean }[] = [
  { key: "price", label: "Precio", done: (v) => v.price !== null },
  { key: "mileage", label: "Kilometraje", done: (v) => v.mileage !== null },
  { key: "color", label: "Color", done: (v) => Boolean(v.exteriorColor) },
  { key: "engine", label: "Motor", done: (v) => Boolean(v.engine) },
  { key: "transmission", label: "Transmisión", done: (v) => Boolean(v.transmission) },
  { key: "features", label: "Características", done: (v) => v.features.es.length > 0 },
  { key: "photos", label: "Fotografías", done: (v) => v.gallery.length > 0 },
];

/** Vista + edición de un vehículo (demo o agregado). Las ediciones de los demo son overrides locales. */
export function VehicleEditor({ slug }: { slug: string }) {
  const { vehicles, toast } = useAdmin();
  const [hydrated, setHydrated] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  useEffect(() => setHydrated(true), []);

  const v = vehicles.find((x) => x.slug === slug);

  if (!v) {
    return (
      <div>
        <BackLink />
        {hydrated ? (
          <div className="mt-10 border-l border-accent pl-6">
            <p className="font-serif text-[1.8rem] italic">No encontramos este vehículo</p>
            <p className="mt-2 text-[15px] text-muted">Puede que lo hayas restaurado o que pertenezca a otro navegador.</p>
          </div>
        ) : (
          <div aria-hidden className="mt-10 h-40" />
        )}
      </div>
    );
  }

  const title = vehicleTitle(v);
  const missing = optionalFields.filter((f) => !f.done(v));
  const complete = optionalFields.length - missing.length;

  return (
    <div>
      <BackLink />
      <div className="mt-4">
        <PageHeader long eyebrow={`Inventario · ${v.year}`} title={title}>
          {v.origin === "demo" ? (
            <a href={`/es/inventario/${v.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost group !px-5">
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Ver ficha pública
            </a>
          ) : null}
          <button type="button" onClick={() => setTeaser(true)} className="btn-ghost group !px-5">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Crear contenido
          </button>
        </PageHeader>
      </div>

      <div className="mt-10 grid gap-12 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-16">
        <div className="rise order-2 min-w-0 xl:order-1" style={{ "--d": "120ms" } as React.CSSProperties}>
          <VehicleForm
            key={`${v.slug}-${v.updatedAt}-${v.edited}`}
            initial={vehicleToValues(v)}
            submitLabel="Guardar cambios"
            cancelHref={INV}
            onError={(m) => toast(m, "error")}
            onSubmit={(values) => {
              const ok = saveVehicle(v.slug, v.origin, values);
              if (ok) toast(v.origin === "demo" ? "Cambios guardados localmente. El dataset original no se modificó." : "Cambios guardados.");
              return ok;
            }}
            extra={
              v.edited ? (
                <button type="button" onClick={() => setConfirmRestore(true)} className="inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:text-ink">
                  <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Restaurar datos demo
                </button>
              ) : null
            }
          />
        </div>

        <aside className="rise order-1 min-w-0 xl:order-2" style={{ "--d": "180ms" } as React.CSSProperties}>
          <div className="max-w-[460px] space-y-6 xl:sticky xl:top-10 xl:max-w-none">
            <div className="relative aspect-[1.45] overflow-hidden ring-1 ring-line">
              <VehiclePhoto vehicle={v} image={v.gallery[0]} sizes="340px" />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-5 text-[14px]">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.22em] text-muted">Estado</dt>
                <dd className="mt-1.5">
                  <StatusChip status={v.status} />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.22em] text-muted">Actualizado</dt>
                <dd className="mt-1.5 text-ink/85">{formatDate(v.updatedAt)}</dd>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2">
                {v.origin === "added" && <DemoTag label="Agregado por ti" />}
                {v.edited && <DemoTag label="Editado localmente" />}
                {v.origin === "demo" && !v.edited && <DemoTag label="Datos demo originales" />}
              </div>
            </dl>
            <div className="border-t border-line pt-5">
              <Eyebrow>{missing.length ? "Ficha incompleta" : "Ficha completa"}</Eyebrow>
              <p className="mt-3 text-[15px]">
                {complete} de {optionalFields.length} datos opcionales completos
              </p>
              {missing.length > 0 ? (
                <p className="mt-2 text-[13px] leading-snug text-muted">Falta: {missing.map((m) => m.label.toLowerCase()).join(", ")}.</p>
              ) : (
                <p className="mt-2 text-[13px] text-muted">La ficha tiene todos los datos opcionales.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {teaser && <ContentTeaser vehicle={v} onClose={() => setTeaser(false)} />}
      {confirmRestore && (
        <Modal title="Restaurar datos demo" eyebrow="Confirmación" onClose={() => setConfirmRestore(false)}>
          <p className="text-[15px] leading-relaxed text-ink/85">Se descartarán tus cambios de {title} y volverá a los datos originales de la demo.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              className="btn-primary w-full sm:w-auto"
              onClick={() => {
                restoreVehicle(v.slug);
                setConfirmRestore(false);
                toast("Vehículo restaurado a los datos demo.");
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { VehicleCategory } from "@/types/vehicle";
import { categoryLabel } from "@/lib/admin-format";
import { CATEGORY_IDS, MAX_PHOTOS, fileToPhoto, validateVehicleValues, type FormErrors, type VehicleFormValues } from "@/services/inventory/admin";

const label = "block text-[11px] uppercase tracking-[0.22em] text-muted";
const field = "mt-2 block min-h-12 w-full border border-line-strong/50 bg-transparent px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent aria-[invalid=true]:border-[#e0735a]";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-7">
      <legend className="eyebrow flex items-center gap-4 pr-4 text-ink/80">
        <span aria-hidden className="h-px w-8 bg-accent" />
        {title}
      </legend>
      {hint && <p className="mt-3 max-w-[60ch] text-[12.5px] leading-snug text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </fieldset>
  );
}

function Field({ id, name, error, hint, children }: { id: string; name: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {name}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-[12.5px] text-[#e0735a]">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[12px] text-muted">{hint}</p>
      )}
    </div>
  );
}

type Props = {
  initial: VehicleFormValues;
  submitLabel: string;
  /** Devuelve true si se guardó (false = el navegador rechazó la escritura). */
  onSubmit: (values: VehicleFormValues) => boolean | Promise<boolean>;
  cancelHref: string;
  /** Acción extra a la izquierda de la barra inferior (p. ej. restaurar). */
  extra?: React.ReactNode;
  onError: (message: string) => void;
};

/** Formulario de vehículo (alta y edición). Todo dato opcional puede quedar vacío; no hay valores técnicos por defecto. */
export function VehicleForm({ initial, submitLabel, onSubmit, cancelHref, extra, onError }: Props) {
  const [v, setV] = useState<VehicleFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof VehicleFormValues>(k: K, val: VehicleFormValues[K]) => setV((cur) => ({ ...cur, [k]: val }));
  const text = (k: keyof VehicleFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k, e.target.value as never);

  const toggleCategory = (c: VehicleCategory) => set("categories", v.categories.includes(c) ? v.categories.filter((x) => x !== c) : [...v.categories, c]);

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PHOTOS - v.photos.length;
    if (room <= 0) return onError(`Máximo ${MAX_PHOTOS} fotografías.`);
    setPhotoBusy(true);
    try {
      const picked = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
      const photos = await Promise.all(picked.map(fileToPhoto));
      set("photos", [...v.photos, ...photos]);
      if (files.length > room) onError(`Solo se agregaron ${room}: el máximo es ${MAX_PHOTOS}.`);
    } catch {
      onError("No se pudo leer una de las imágenes.");
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateVehicleValues(v);
    setErrors(errs);
    const first = (Object.keys(errs) as (keyof FormErrors)[])[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setBusy(true);
    const ok = await onSubmit(v);
    setBusy(false);
    if (!ok) onError("No se pudo guardar: el navegador rechazó la escritura (¿fotografías muy pesadas?). Prueba con menos fotos.");
  };

  const err = (k: keyof FormErrors) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `f-${k}-err` : undefined });

  return (
    <form onSubmit={submit} noValidate className="space-y-9">
      <Section title="Identificación">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-brand" name="Marca" error={errors.brand}>
            <input id="f-brand" className={field} value={v.brand} onChange={text("brand")} autoComplete="off" {...err("brand")} />
          </Field>
          <Field id="f-model" name="Modelo" error={errors.model}>
            <input id="f-model" className={field} value={v.model} onChange={text("model")} autoComplete="off" {...err("model")} />
          </Field>
          <Field id="f-version" name="Versión">
            <input id="f-version" className={field} value={v.version} onChange={text("version")} placeholder="Opcional" autoComplete="off" />
          </Field>
          <Field id="f-year" name="Año" error={errors.year}>
            <input id="f-year" className={field} value={v.year} onChange={text("year")} inputMode="numeric" maxLength={4} autoComplete="off" {...err("year")} />
          </Field>
        </div>
      </Section>

      <Section title="Datos comerciales" hint="Si aún no está confirmado, déjalo vacío: el sitio mostrará “a consultar”.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-price" name="Precio (MXN)" error={errors.price}>
            <input id="f-price" className={field} value={v.price} onChange={text("price")} inputMode="numeric" placeholder="A consultar" autoComplete="off" {...err("price")} />
          </Field>
          <Field id="f-mileage" name="Kilometraje (km)" error={errors.mileage}>
            <input id="f-mileage" className={field} value={v.mileage} onChange={text("mileage")} inputMode="numeric" placeholder="A consultar" autoComplete="off" {...err("mileage")} />
          </Field>
        </div>
      </Section>

      <Section title="Especificaciones" hint="Solo datos verificados de esta unidad. No se rellenan por el modelo.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-color" name="Color">
            <input id="f-color" className={field} value={v.color} onChange={text("color")} placeholder="Por confirmar" autoComplete="off" />
          </Field>
          <Field id="f-engine" name="Motor">
            <input id="f-engine" className={field} value={v.engine} onChange={text("engine")} placeholder="Por confirmar" autoComplete="off" />
          </Field>
          <Field id="f-transmission" name="Transmisión">
            <select id="f-transmission" className={`${field} bg-bg`} value={v.transmission} onChange={text("transmission")}>
              <option value="">Por confirmar</option>
              <option value="Automática">Automática</option>
              <option value="Manual">Manual</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Categoría" hint="Clasificación editorial para filtrar el inventario; no es una especificación técnica oficial.">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Categoría">
          {CATEGORY_IDS.map((c) => {
            const on = v.categories.includes(c);
            return (
              <button key={c} type="button" aria-pressed={on} onClick={() => toggleCategory(c)} className={`min-h-11 border px-4 text-[13px] transition-colors ${on ? "border-accent bg-accent/10 text-accent" : "border-line-strong/50 text-ink/80 hover:border-ink/60"}`}>
                {categoryLabel[c]}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Características" hint="Una por línea. Escribe solo lo verificado; si no lo sabes, déjalo vacío.">
        <label htmlFor="f-features" className="sr-only">
          Características
        </label>
        <textarea id="f-features" rows={5} className={`${field} py-3`} value={v.features} onChange={text("features")} />
      </Section>

      <Section title="Fotografías" hint={`Hasta ${MAX_PHOTOS}. Se reducen y se guardan solo en este navegador (demo). Sin fotos, el sitio muestra “Fotografía pendiente”.`}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {v.photos.map((p, i) => (
            <li key={p.src.slice(-24) + i} className="relative aspect-[1.45] overflow-hidden ring-1 ring-line">
              <Image src={p.src} alt={p.alt} fill sizes="200px" unoptimized className="object-cover" />
              {i === 0 && <span className="absolute bottom-1.5 left-1.5 bg-night/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-bone">Portada</span>}
              <button type="button" onClick={() => set("photos", v.photos.filter((_, n) => n !== i))} aria-label={`Quitar fotografía ${i + 1}`} className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-bone drop-shadow-[0_1px_2px_rgb(0_0_0/0.8)]">
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </li>
          ))}
          {v.photos.length < MAX_PHOTOS && (
            <li>
              <label className="flex aspect-[1.45] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line-strong/60 text-[12px] uppercase tracking-[0.14em] text-muted transition-colors focus-within:border-accent hover:border-accent hover:text-accent">
                <ImagePlus className="h-5 w-5" strokeWidth={1.4} aria-hidden />
                {photoBusy ? "Procesando…" : "Agregar"}
                <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
              </label>
            </li>
          )}
        </ul>
      </Section>

      <Section title="Publicación">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-status" name="Estado">
            <select id="f-status" className={`${field} bg-bg`} value={v.status} onChange={text("status")}>
              <option value="available">Disponible</option>
              <option value="reserved">Apartado</option>
              <option value="sold">Vendido</option>
            </select>
          </Field>
          <div className="flex items-end">
            <label className="flex min-h-12 cursor-pointer items-center gap-3 text-[15px]">
              <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
              Destacado en el inicio
            </label>
          </div>
        </div>
      </Section>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
        <div>{extra}</div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Link href={cancelHref} className="btn-ghost w-full sm:w-auto">
            Cancelar
          </Link>
          <button type="submit" disabled={busy || photoBusy} className="btn-primary w-full sm:w-auto">
            {busy ? "Guardando…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

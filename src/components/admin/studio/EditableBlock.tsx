"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Pencil } from "lucide-react";
import { copyText } from "@/lib/clipboard";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  /** Contador de caracteres con límite recomendado (SEO). */
  max?: number;
  /** Texto que se copia (por defecto, el valor). */
  copyValue?: string;
  copyLabel?: string;
  /** Vista de lectura personalizada. */
  render?: (value: string) => React.ReactNode;
  singleLine?: boolean;
  id: string;
};

/** Bloque de contenido: lectura + Copiar + Editar (textarea). Los cambios se aplican al instante a las vistas previas. */
export function EditableBlock({ label, value, onChange, rows = 5, hint, max, copyValue, copyLabel = "Copiar", render, singleLine, id }: Props) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (editing) area.current?.focus();
  }, [editing]);

  const over = max !== undefined && value.length > max;

  return (
    <div className="border-t border-line pt-5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={editing ? id : undefined} className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          {label}
        </label>
        <div className="flex items-center">
          <button
            type="button"
            onClick={async () => setCopied(await copyText(copyValue ?? value))}
            data-copy={id}
            aria-label={`${copyLabel}: ${label}`}
            className="inline-flex min-h-11 items-center gap-1.5 px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink/75 transition-colors hover:text-accent"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2} aria-hidden /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />}
            <span aria-live="polite">{copied ? "Copiado" : copyLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            data-edit={id}
            aria-label={`${editing ? "Terminar edición" : "Editar"}: ${label}`}
            aria-pressed={editing}
            className={`inline-flex min-h-11 items-center gap-1.5 px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] transition-colors hover:text-accent ${editing ? "text-accent" : "text-ink/75"}`}
          >
            {editing ? <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> : <Pencil className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />}
            {editing ? "Listo" : "Editar"}
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          id={id}
          ref={area}
          rows={singleLine ? 2 : rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 block w-full resize-y border border-accent/60 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink outline-none"
        />
      ) : (
        <div data-value={id} className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink/90">
          {render ? render(value) : value}
        </div>
      )}

      {(hint || max !== undefined) && (
        <p className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-muted">
          <span>{hint}</span>
          {max !== undefined && (
            <span className={`tabular-nums ${over ? "text-[#e0a35a]" : ""}`}>
              {value.length} / {max} caracteres{over ? " · se recortará en Google" : ""}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

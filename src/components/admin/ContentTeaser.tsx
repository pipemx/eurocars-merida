"use client";

import { Sparkles } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { vehicleTitle } from "@/lib/admin-format";
import { Modal } from "./Modal";

const outputs = ["Descripción web", "Contenido SEO", "Instagram", "Facebook", "Marketplace", "WhatsApp", "Texto alternativo", "Versión en inglés"];

/** "Crear contenido": por ahora solo un adelanto. La generación real llega en la siguiente etapa del demo. */
export function ContentTeaser({ vehicle, onClose }: { vehicle: Pick<Vehicle, "brand" | "model" | "version" | "year">; onClose: () => void }) {
  return (
    <Modal title={`${vehicleTitle(vehicle)} ${vehicle.year}`} eyebrow="Crear contenido con IA" onClose={onClose}>
      <p className="flex items-start gap-3 text-[16px] leading-relaxed">
        <Sparkles className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} aria-hidden />
        Generación inteligente disponible en la siguiente etapa del demo.
      </p>
      <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-muted">Lo que podrás generar desde aquí</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {outputs.map((o) => (
          <li key={o} className="border border-line-strong/50 px-3 py-1.5 text-[13px] text-ink/85">
            {o}
          </li>
        ))}
      </ul>
      <button type="button" data-autofocus onClick={onClose} className="btn-ghost mt-7 w-full sm:w-auto">
        Entendido
      </button>
    </Modal>
  );
}

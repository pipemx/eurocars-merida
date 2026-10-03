import { BadgeDollarSign, Handshake, RefreshCw, UserRound } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

const icons = [BadgeDollarSign, Handshake, RefreshCw, UserRound];

/** Franja de servicios: en Dark rompe el ritmo con superficie clara; en Light, línea fina editorial. */
export function ServiceStrip({ t }: { t: Dictionary }) {
  return (
    <section aria-label="Servicios" className="bg-[#f4f2ed] text-[#151616] light:border-y light:border-line light:bg-surface">
      <ul className="container-ec grid grid-cols-2 gap-x-4 gap-y-6 py-8 md:py-10 lg:grid-cols-4 lg:gap-y-0">
        {t.services.map((s, i) => {
          const Icon = icons[i];
          return (
            <li key={s.a} className={`flex items-center gap-3 md:gap-4 lg:justify-center ${i > 0 ? "lg:border-l lg:border-black/10" : "lg:justify-start"}`}>
              <Icon className="h-6 w-6 shrink-0 opacity-75 md:h-9 md:w-9" strokeWidth={1.1} aria-hidden />
              <p className="text-[11.5px] uppercase leading-[1.5] tracking-[0.1em] md:text-[12.5px] md:tracking-[0.14em]">
                <span className="block font-medium">{s.a}</span>
                <span className="block opacity-65">{s.b}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

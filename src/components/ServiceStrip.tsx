import { BadgeDollarSign, Handshake, RefreshCw, UserRound } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { DEMO_MODE } from "@/lib/demo-mode";

const icons = [BadgeDollarSign, Handshake, RefreshCw, UserRound];
/** Financiamiento y consignación sin comisión no están verificados (docs/03): en demo se muestran como "por confirmar". */
const UNVERIFIED = new Set([0, 1]);

/** Franja de servicios: rompe el ritmo con la superficie opuesta al tema (clara en Dark, carbón en Light). */
export function ServiceStrip({ t }: { t: Dictionary }) {
  return (
    <section aria-label="Servicios" className="bg-[#f4f2ed] text-[#151616] light:bg-[#101112] light:text-[#f3f1ec]">
      <ul className="container-ec grid grid-cols-2 gap-x-4 gap-y-6 py-8 md:py-10 lg:grid-cols-4 lg:gap-y-0">
        {t.services.map((s, i) => {
          const Icon = icons[i];
          return (
            <li key={s.a} className={`flex items-center gap-3 md:gap-4 lg:justify-center ${i > 0 ? "lg:border-l lg:border-current/15" : "lg:justify-start"}`}>
              <Icon className="h-6 w-6 shrink-0 opacity-75 md:h-9 md:w-9" strokeWidth={1.1} aria-hidden />
              <p className="text-[11.5px] uppercase leading-[1.5] tracking-[0.1em] md:text-[12.5px] md:tracking-[0.14em]">
                <span className="block font-medium">{s.a}</span>
                <span className="block opacity-65">{DEMO_MODE && UNVERIFIED.has(i) ? t.demo.toConfirm : s.b}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

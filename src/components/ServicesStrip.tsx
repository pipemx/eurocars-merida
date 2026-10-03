import { BadgeDollarSign, Handshake, RefreshCw, UserRound } from "lucide-react";

const items = [
  { Icon: BadgeDollarSign, a: "Financiamiento", b: "Disponible" },
  { Icon: Handshake, a: "Consignación", b: "Sin comisión" },
  { Icon: RefreshCw, a: "Toma a cuenta", b: "Tu auto actual" },
  { Icon: UserRound, a: "Atención", b: "Personalizada" },
];

export function ServicesStrip() {
  return (
    <section aria-label="Servicios" className="bg-paper text-carbon">
      <ul className="container-ec grid grid-cols-2 gap-y-8 py-9 md:py-11 lg:grid-cols-4 lg:gap-y-0">
        {items.map(({ Icon, a, b }, i) => (
          <li
            key={a}
            className={`flex items-center gap-4 lg:justify-center lg:gap-6 ${i > 0 ? "lg:border-l lg:border-carbon/15" : ""} ${i === 0 ? "lg:justify-start" : ""}`}
          >
            <Icon className="h-8 w-8 shrink-0 text-carbon/80 md:h-10 md:w-10" strokeWidth={1.1} aria-hidden />
            <p className="text-[11px] uppercase leading-[1.55] tracking-[0.14em] md:text-[12.5px]">
              <span className="block font-medium">{a}</span>
              <span className="block text-carbon/70">{b}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

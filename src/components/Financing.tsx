import Image from "next/image";
import { ArrowRight, CircleCheck } from "lucide-react";
import { financingPoints } from "@/content/site";
import { whatsappHref } from "@/lib/whatsapp";
import { TrackedLink } from "./TrackedLink";

export function Financing() {
  return (
    <section id="financiamiento" aria-labelledby="fin-title" className="relative isolate scroll-mt-16 overflow-hidden bg-carbon">
      <div className="relative h-[300px] md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[62%]">
        <Image
          src="/eurocars/showroom/mockup-interior.webp"
          alt="Interior deportivo con volante de piel y costuras rojas"
          fill
          sizes="(min-width:768px) 62vw, 100vw"
          className="object-cover object-[30%_50%]"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,#0a0b0b_0%,transparent_45%)] md:bg-[linear-gradient(270deg,#0a0b0b_0%,rgb(10_11_11/0.85)_14%,transparent_45%)]" />
      </div>

      <div className="container-ec relative grid md:min-h-[420px] md:grid-cols-12 md:py-14">
        <div className="pb-14 pt-4 md:col-span-6 md:col-start-7 md:self-center md:py-0 md:pl-14 xl:pl-20">
          <p className="eyebrow text-bone/85">Financiamiento</p>
          <h2 id="fin-title" className="serif-title mt-3 text-[clamp(2.3rem,4.4vw,3.4rem)] font-normal">
            Tu próximo auto
            <br />
            más cerca
          </h2>
          <span aria-hidden className="mt-4 block h-px w-14 bg-champagne" />
          <ul className="mt-6 grid gap-x-10 gap-y-3 text-[15px] text-bone/90 sm:grid-cols-2">
            {financingPoints.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <CircleCheck className="h-[18px] w-[18px] shrink-0 text-champagne" strokeWidth={1.4} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <TrackedLink href={whatsappHref({ kind: "financing" })} event="finance_click" eventParams={{ location: "home_financing" }} className="btn-gold group mt-9">
            Conocer opciones <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

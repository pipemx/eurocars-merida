import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { DEMO_MODE } from "@/lib/demo-mode";
import { whatsappHref } from "@/lib/whatsapp";
import { DemoBadge } from "./DemoBadge";
import { TrackedLink } from "./TrackedLink";

export function FinancingSection({ t }: { t: Dictionary }) {
  return (
    <section id="financiamiento" aria-labelledby="fin-title" className="relative isolate scroll-mt-20 overflow-hidden bg-bg">
      <div data-reveal className="reveal-img relative h-[300px] overflow-hidden md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[58%]">
        <div className="absolute inset-0">
          <Image src="/eurocars/showroom/mockup-interior.webp" alt="" fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover object-[30%_50%]" />
        </div>
        <div aria-hidden className="absolute inset-0 !transform-none bg-[linear-gradient(0deg,var(--bg)_0%,transparent_45%)] md:bg-[linear-gradient(270deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_80%,transparent)_14%,transparent_45%)]" />
      </div>
      <div className="container-ec relative grid md:min-h-[500px] md:grid-cols-12 md:py-16">
        <div data-reveal className="reveal pb-14 pt-6 md:col-span-6 md:col-start-7 md:self-center md:py-0 md:pl-12 xl:pl-20">
          <p className="eyebrow flex items-center gap-4 text-muted">
            <span aria-hidden className="draw-line h-px w-10 bg-accent" />
            {t.financing.eyebrow}
          </p>
          <h2 id="fin-title" className="serif-title mt-4 text-[clamp(2.3rem,4.4vw,3.5rem)] font-normal">
            {t.financing.titleA}
            <br />
            {t.financing.titleB}
          </h2>
          {DEMO_MODE ? (
            <p className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
              {t.demo.financingPending}
              <DemoBadge label={t.demo.badge} />
            </p>
          ) : (
            <ul className="mt-7 grid gap-x-10 gap-y-3 text-[15px] sm:grid-cols-2">
              {t.financing.points.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.8} aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          )}
          <TrackedLink href={whatsappHref(t.whatsapp.financing)} event="finance_click" eventParams={{ source: "home_financing" }} className="btn-primary group mt-9">
            {t.financing.cta} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

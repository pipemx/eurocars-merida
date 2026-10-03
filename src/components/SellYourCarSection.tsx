import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { whatsappHref } from "@/lib/whatsapp";
import { TrackedLink } from "./TrackedLink";

export function SellYourCarSection({ t }: { t: Dictionary }) {
  return (
    <section id="vende-tu-auto" aria-labelledby="sell-title" className="relative isolate scroll-mt-20 overflow-hidden bg-surface light:bg-bg">
      <div className="relative h-[260px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[54%] light:md:inset-y-16 light:md:right-0">
        <Image src="/eurocars/showroom/mockup-porsche-rear.webp" alt="" fill sizes="(min-width:768px) 54vw, 100vw" className="object-cover object-left" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,var(--surface)_0%,transparent_45%)] light:hidden md:bg-[linear-gradient(90deg,var(--surface)_0%,transparent_30%)]" />
      </div>
      <div className="container-ec relative md:flex md:min-h-[440px] md:items-center light:md:min-h-[540px]">
        <div className="pb-14 pt-6 md:max-w-[44%] md:py-16">
          <p className="eyebrow flex items-center gap-4 text-muted">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {t.sell.eyebrow}
          </p>
          <h2 id="sell-title" className="serif-title mt-4 text-[clamp(2.3rem,4.4vw,3.5rem)] font-normal">
            {t.sell.titleA}
            <br />
            {t.sell.titleB}
          </h2>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink/80 md:text-[17px]">{t.sell.body}</p>
          <TrackedLink href={whatsappHref(t.whatsapp.sell)} event="sell_car_start" eventParams={{ source: "home_sell" }} className="btn-primary group mt-8">
            {t.sell.cta} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

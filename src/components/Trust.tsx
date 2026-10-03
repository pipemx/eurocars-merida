import { Star } from "lucide-react";
import { site, testimonials } from "@/content/site";
import { GoogleWordmark } from "./icons";
import { TrackedLink } from "./TrackedLink";

function Stars({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <span className="flex gap-1 text-[#e0a526]" role="img" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={className} fill="currentColor" strokeWidth={0} aria-hidden />
      ))}
    </span>
  );
}

export function Trust() {
  return (
    <section id="nosotros" aria-labelledby="trust-title" className="scroll-mt-16 bg-paper py-12 text-carbon md:py-14">
      <div className="container-ec">
        <p className="eyebrow text-carbon/55">La confianza nos mueve</p>
        <h2 id="trust-title" className="serif-title mt-2 text-[clamp(2rem,3.6vw,2.6rem)] font-normal">
          Nuestros clientes
        </h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:gap-0">
          <ul className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:pr-10">
            {testimonials.map((t) => (
              <li key={t.name} className="w-[82vw] shrink-0 snap-start md:w-auto">
                <figure className="flex h-full gap-5 rounded-[4px] border border-carbon/[0.07] bg-white/60 p-5 xl:p-6">
                  <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-carbon/[0.06] font-serif text-[18px] font-semibold">
                    {t.initials}
                  </span>
                  <div>
                    <Stars />
                    <blockquote className="mt-3 text-[13.5px] leading-[1.6] text-carbon/80">“{t.text}”</blockquote>
                    <figcaption className="mt-5 text-[13px] text-carbon/55">{t.name}</figcaption>
                  </div>
                </figure>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center justify-center border-carbon/15 text-center lg:min-w-[260px] lg:border-l lg:pl-10">
            <TrackedLink href={site.google.url} event="maps_click" eventParams={{ location: "trust_google" }} className="flex flex-col items-center">
              <GoogleWordmark className="text-[2.2rem] leading-none" />
              <span className="mt-2 font-serif text-[3.2rem] font-medium leading-none">{site.google.rating}/5</span>
              <span className="mt-3">
                <Stars className="h-6 w-6" />
              </span>
              <span className="mt-3 text-[14px] font-medium">+{site.google.reviewCount} reseñas reales</span>
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}

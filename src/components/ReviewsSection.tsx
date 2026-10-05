import { ArrowRight, Star } from "lucide-react";
import { site } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { DEMO_MODE } from "@/lib/demo-mode";
import { DemoBadge } from "./DemoBadge";
import { GoogleWordmark } from "./icons";
import { TrackedLink } from "./TrackedLink";

/**
 * Confianza. Solo calificación agregada de Google (dato a confirmar). Las reseñas
 * individuales se añadirán únicamente cuando sean reales y verificadas (máx. 3).
 */
export function ReviewsSection({ t, locale }: { t: Dictionary; locale: "es" | "en" }) {
  return (
    <section id="nosotros" aria-labelledby="trust-title" className="scroll-mt-20 bg-[#f4f2ed] py-16 text-[#151616] md:py-20 light:bg-[#101112] light:text-[#f3f1ec]">
      <div data-reveal className="reveal container-ec grid gap-10 md:grid-cols-12 md:items-center">
        <div className="md:col-span-6">
          <p className="eyebrow flex items-center gap-4 opacity-60">
            <span aria-hidden className="draw-line h-px w-10 bg-[#c6a66a]" />
            {t.trust.eyebrow}
          </p>
          <h2 id="trust-title" className="serif-title mt-4 text-[clamp(2.2rem,4vw,3.2rem)] font-normal">
            {t.trust.title}
          </h2>
        </div>
        <TrackedLink
          href={site.google.url}
          event="maps_click"
          eventParams={{ source: "reviews_google" }}
          className="group flex items-center gap-8 md:col-span-6 md:justify-end"
        >
          <div className="text-center">
            <GoogleWordmark className="text-[1.6rem] leading-none" />
            <p className="mt-1 font-serif text-[4.2rem] font-medium leading-none tabular-nums">{DEMO_MODE ? "—" : site.google.rating}</p>
          </div>
          <div>
            {DEMO_MODE ? (
              <>
                <DemoBadge label={t.demo.badge} />
                <p className="mt-2 max-w-[26ch] text-[15px] leading-snug">{t.demo.reviewsPending}</p>
              </>
            ) : (
              <>
                <span className="flex gap-1 text-[#e0a526]" role="img" aria-label={t.trust.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5" fill="currentColor" strokeWidth={0} aria-hidden />
                  ))}
                </span>
                <p className="mt-2 text-[15px]">{t.trust.reviews(site.google.reviewCount)}</p>
              </>
            )}
            <p className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] opacity-80 group-hover:opacity-100">
              {locale === "es" ? "Ver reseñas en Google" : "Read Google reviews"} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.6} />
            </p>
          </div>
        </TrackedLink>
      </div>
    </section>
  );
}

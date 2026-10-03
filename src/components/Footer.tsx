import { Clock, MapPin } from "lucide-react";
import { site } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries";
import { whatsappHref } from "@/lib/whatsapp";
import { SocialLinks } from "./SocialLinks";
import { TrackedLink } from "./TrackedLink";
import { WhatsappIcon } from "./icons";

export function Footer({ t }: { t: Dictionary }) {
  return (
    <footer id="contacto" className="scroll-mt-20 border-t border-line bg-bg">
      <div className="container-ec grid gap-10 py-14 md:grid-cols-12 md:items-start md:py-16">
        <div className="md:col-span-5">
          <p className="eyebrow flex items-center gap-4 text-muted">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {t.location.eyebrow}
          </p>
          <h2 className="serif-title mt-4 text-[clamp(2rem,3.6vw,2.8rem)] font-normal">{t.location.title}</h2>
          <p className="mt-3 text-[17px] text-ink/80">{t.location.tagline}</p>
        </div>

        <div className="space-y-5 text-[15px] md:col-span-4">
          <p className="flex items-start gap-4">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.4} aria-hidden />
            {site.location.label}
          </p>
          <div className="flex items-start gap-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.4} aria-hidden />
            <dl className="grid grid-cols-[auto_auto] gap-x-8 gap-y-1">
              {t.location.hours.map((h) => (
                <div key={h.days} className="contents">
                  <dt className="text-muted">{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <TrackedLink href={site.maps} event="maps_click" eventParams={{ source: "footer" }} className="group inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
            {t.location.directions} <span className="arrow">→</span>
          </TrackedLink>
        </div>

        <div className="flex flex-col items-start gap-4 md:col-span-3 md:items-end">
          <TrackedLink
            href={whatsappHref(t.whatsapp.home)}
            event="whatsapp_click"
            eventParams={{ source: "footer" }}
            className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#1fae55]/70 px-6 text-[15px] font-medium transition-colors hover:bg-[#1fae55]/10"
          >
            <WhatsappIcon className="h-5 w-5 text-[#1fae55]" />
            {site.whatsapp.display}
          </TrackedLink>
          <SocialLinks location="footer" />
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-ec flex flex-col gap-1 py-5 text-[12px] text-muted md:flex-row md:justify-between" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
          <p>
            © {new Date().getFullYear()} Eurocars Mérida. {t.footer.rights}
          </p>
          <p>{t.footer.city}</p>
        </div>
      </div>
    </footer>
  );
}

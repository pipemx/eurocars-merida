import Image from "next/image";
import { Clock, MapPin } from "lucide-react";
import { site } from "@/content/site";
import { whatsappHref } from "@/lib/whatsapp";
import { Socials } from "./Socials";
import { TrackedLink } from "./TrackedLink";
import { WhatsappIcon } from "./icons";

export function LocationFooter() {
  return (
    <footer id="contacto" className="relative isolate scroll-mt-16 overflow-hidden bg-[#060707]">
      <div aria-hidden className="absolute inset-y-0 left-[28%] -z-10 hidden w-[240px] opacity-70 md:block">
        <Image src="/eurocars/showroom/mockup-wheel.webp" alt="" fill sizes="240px" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#060707_0%,transparent_35%,transparent_65%,#060707_100%)]" />
      </div>

      <div className="container-ec grid gap-10 py-12 md:grid-cols-12 md:items-center md:py-10">
        <div className="md:col-span-5">
          <p className="eyebrow text-bone/45">Visítanos</p>
          <h2 className="serif-title mt-3 text-[clamp(2rem,3.6vw,2.6rem)] font-normal">Eurocars Mérida</h2>
          <p className="mt-2 text-[17px] text-bone/85">Ven por el auto que viste. Sal con el que querías.</p>
        </div>

        <div className="space-y-5 text-[15px] text-bone/85 md:col-span-4 md:col-start-7 md:border-r md:border-line md:pr-8">
          <TrackedLink href={site.maps} event="maps_click" eventParams={{ location: "footer" }} className="flex items-start gap-4 hover:text-bone">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.4} aria-hidden />
            {site.location.label}
          </TrackedLink>
          <div className="flex items-start gap-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.4} aria-hidden />
            <dl className="grid grid-cols-[auto_auto] gap-x-8 gap-y-1">
              {site.hours.map((h) => (
                <div key={h.days} className="contents">
                  <dt>{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 md:col-span-2 md:items-center">
          <TrackedLink
            href={whatsappHref()}
            event="whatsapp_click"
            eventParams={{ location: "footer" }}
            className="inline-flex items-center gap-3 rounded-[4px] border border-wa/70 px-7 py-3.5 text-[15px] font-medium text-bone transition-colors hover:bg-wa/10"
          >
            <WhatsappIcon className="h-5 w-5 text-wa" />
            WhatsApp
          </TrackedLink>
          <Socials location="footer" />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-ec flex flex-col gap-2 py-5 text-[12px] text-bone/45 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Eurocars Mérida. Todos los derechos reservados.</p>
          <a href="/aviso-de-privacidad" className="hover:text-bone/80">Aviso de privacidad</a>
        </div>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { PreviewTag } from "./PreviewTag";

const services = ["Financiamiento", "Consignación", "Toma a cuenta", "Atención personalizada"];

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex flex-col md:min-h-[92vh] md:justify-end"
    >
      {/* Móvil: la foto va limpia arriba (sin texto encima). Desktop: a sangre detrás del texto. */}
      <div className="relative h-[58svh] min-h-[340px] w-full md:absolute md:inset-0 md:-z-20 md:h-auto">
        <Image
          src="/eurocars/showroom/placeholder-hero.webp"
          alt="Fotografía pendiente: vehículo en el showroom de Eurocars Mérida"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_50%]"
        />
        {/* Oscurecimiento direccional, solo donde vive el texto. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_11_11/0.6)_0%,transparent_22%,transparent_70%,rgb(10_11_11/1)_100%)] md:bg-[linear-gradient(90deg,rgb(10_11_11/0.8)_0%,rgb(10_11_11/0.3)_42%,transparent_65%),linear-gradient(0deg,rgb(10_11_11/0.95)_0%,rgb(10_11_11/0.15)_40%,transparent_60%),linear-gradient(180deg,rgb(10_11_11/0.55)_0%,transparent_18%)]"
        />
        <PreviewTag className="absolute right-6 top-24 md:right-10 md:top-32 xl:right-14">
          Foto real pendiente · showroom
        </PreviewTag>
      </div>

      <div className="relative mx-auto -mt-16 flex w-full max-w-[1760px] flex-col px-6 pb-12 md:mt-0 md:px-10 md:pb-14 md:pt-40 xl:px-14">
        <p className="eyebrow reveal text-bone/70" style={{ "--d": "100ms" } as React.CSSProperties}>
          Seminuevos <span className="text-champagne">·</span> Premium <span className="text-champagne">·</span> Exóticos
        </p>

        <h1
          id="hero-title"
          className="display reveal mt-5 text-[clamp(3.25rem,14vw,8.75rem)] md:mt-8"
          style={{ "--d": "200ms" } as React.CSSProperties}
        >
          Vehículos
          <br />
          que destacan.
        </h1>

        <div
          className="reveal mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:items-end"
          style={{ "--d": "350ms" } as React.CSSProperties}
        >
          <div className="md:col-span-5 lg:col-span-4">
            <p className="font-serif text-[1.5rem] italic leading-[1.15] text-bone md:text-[1.75rem]">
              Vehículos seleccionados para quienes buscan algo diferente.
            </p>
            <p className="eyebrow mt-4 text-ash">
              {site.location.city}, {site.location.region}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8 md:col-span-7 md:justify-end lg:col-span-8">
            <Link
              href="/inventario"
              className="group inline-flex items-center justify-between gap-6 bg-champagne px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-carbon transition-colors hover:bg-bone sm:justify-start"
            >
              Explorar inventario <span className="arrow" aria-hidden>→</span>
            </Link>
            <Link
              href="/#vende-tu-auto"
              className="group link-underline self-start py-2 text-[12px] font-medium uppercase tracking-[0.2em] text-bone sm:self-auto"
            >
              Vender mi auto
            </Link>
          </div>
        </div>

        <ul
          className="reveal mt-12 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-5 text-[11px] uppercase tracking-[0.2em] text-ash md:mt-16 md:flex md:gap-0"
          style={{ "--d": "500ms" } as React.CSSProperties}
          aria-label="Servicios"
        >
          {services.map((s, i) => (
            <li key={s} className="flex items-baseline gap-3 md:flex-1">
              <span className="data hidden text-bone/35 md:inline">{String(i + 1).padStart(2, "0")}</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

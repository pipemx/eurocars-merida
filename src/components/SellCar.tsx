import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { whatsappHref } from "@/lib/whatsapp";
import { TrackedLink } from "./TrackedLink";

export function SellCar() {
  return (
    <section id="vende-tu-auto" aria-labelledby="sell-title" className="relative isolate scroll-mt-16 overflow-hidden bg-[#151617]">
      {/* Muro de concreto: textura sutil con CSS para no cargar otra imagen */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.018)_0px,rgb(255_255_255/0.018)_1px,transparent_1px,transparent_64px),linear-gradient(180deg,#1b1c1d_0%,#121313_100%)]" />
      <div className="relative h-[260px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[54%]">
        <Image
          src="/eurocars/showroom/mockup-porsche-rear.webp"
          alt="Calavera trasera iluminada de un Porsche gris"
          fill
          sizes="(min-width:768px) 54vw, 100vw"
          className="object-cover object-left"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,#151617_0%,transparent_45%)] md:bg-[linear-gradient(90deg,#151617_0%,rgb(21_22_23/0.4)_10%,transparent_30%)]" />
      </div>

      <div className="container-ec relative md:flex md:min-h-[400px] md:items-center">
        <div className="pb-14 pt-4 md:max-w-[46%] md:py-14">
          <p className="eyebrow text-champagne/90">Vende tu auto</p>
          <h2 id="sell-title" className="serif-title mt-3 text-[clamp(2.3rem,4.4vw,3.4rem)] font-normal">
            Tu auto también
            <br />
            puede estar aquí
          </h2>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-bone/85 md:text-[17px]">
            Recibimos tu auto a cuenta, te damos una propuesta de compra o lo dejamos en consignación (sin comisión).
          </p>
          <TrackedLink href={whatsappHref({ kind: "sell" })} event="sell_car_start" eventParams={{ location: "home_sell" }} className="btn-gold group mt-8">
            Valuar mi auto <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

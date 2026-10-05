import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Vehicle } from "@/types/vehicle";
import { vehicleName, whatsappHref } from "@/lib/whatsapp";
import { vehicleJsonLd } from "@/lib/vehicle-jsonld";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FloatingWhatsApp } from "../FloatingWhatsApp";
import { VehicleCard } from "../VehicleCard";
import { VehicleStatus } from "../VehicleStatus";
import { TrackedLink } from "../TrackedLink";
import { VehicleGallery } from "./VehicleGallery";
import { VehicleSpecs } from "./VehicleSpecs";
import { VehicleActions, VehicleStickyBar } from "./VehicleActions";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function VehicleDetail({ v, locale, related }: { v: Vehicle; locale: Locale; related: Vehicle[] }) {
  const t = getDictionary(locale);
  const name = [v.model, v.version].filter(Boolean).join(" ");

  // Solo declara datos verificados (ver vehicleJsonLd).
  const jsonLd = vehicleJsonLd(v, locale);

  return (
    <>
      <Header />
      <main id="contenido" className="bg-bg pb-28 pt-[96px] md:pt-[124px] lg:pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="container-ec">
          <nav aria-label="Breadcrumb" className="rise text-[12px] tracking-[0.08em] text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={`/${locale}`} className="hover:text-ink">{t.vehicle.breadcrumbHome}</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/${locale}#inventario`} className="hover:text-ink">{t.vehicle.breadcrumbInventory}</Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink">{vehicleName(v)}</li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="rise lg:col-span-7" style={{ "--d": "100ms" } as React.CSSProperties}>
              <VehicleGallery images={v.gallery} title={vehicleName(v)} vehicle={v} />
              <p className="mt-4 text-[13px] text-muted">{t.vehicle.moreFotos}</p>
            </div>

            <aside className="lg:col-span-5">
              <div className="rise lg:sticky lg:top-[100px]" style={{ "--d": "200ms" } as React.CSSProperties}>
                <div className="flex items-center justify-between gap-4">
                  <p className="eyebrow flex items-center gap-4 text-muted">
                    <span aria-hidden className="h-px w-10 bg-accent" />
                    {v.brand}
                  </p>
                  <VehicleStatus status={v.status} label={t.inventory.status[v.status]} />
                </div>
                <h1 className="serif-title mt-4 text-[clamp(2.6rem,5vw,4.2rem)] font-normal">{name}</h1>
                <p className="mt-3 text-[15px] text-muted">
                  {v.year}
                  {" · "}
                  {v.mileage !== null ? `${fmt.format(v.mileage)} km` : t.inventory.mileageOnRequest}
                </p>
                <p className="mt-7 border-t border-line pt-6 text-[clamp(1.9rem,3vw,2.4rem)] font-medium tabular-nums tracking-[0.01em] text-accent">
                  {v.price !== null ? `$${fmt.format(v.price)} MXN` : t.inventory.priceOnRequest}
                </p>
                <VehicleActions v={v} />
                {v.isPlaceholder && <p className="mt-5 text-[12px] text-muted">{t.vehicle.demoNote}</p>}
              </div>
            </aside>
          </div>

          <section data-reveal className="reveal mt-20 grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <h2 className="eyebrow flex items-center gap-4 text-muted">
                <span aria-hidden className="draw-line h-px w-10 bg-accent" />
                {t.vehicle.specs}
              </h2>
              <div className="mt-6">
                <VehicleSpecs v={v} t={t} locale={locale} />
              </div>
              <div className="mt-6">
                <h3 className="text-[11px] uppercase tracking-[0.22em] text-muted">{t.vehicle.categoryTitle}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {v.category.map((c) => (
                    <li key={c} className="border border-line-strong/50 px-3 py-1.5 text-[13px] tracking-[0.04em]">
                      {t.inventory.categories[c]}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 max-w-[56ch] text-[12px] leading-snug text-muted">{t.vehicle.categoryNote}</p>
              </div>
            </div>
            <div className="lg:col-span-5">
              <h2 className="eyebrow flex items-center gap-4 text-muted">
                <span aria-hidden className="draw-line h-px w-10 bg-accent" />
                {t.vehicle.description}
              </h2>
              <p className="mt-6 font-serif text-[1.6rem] italic leading-snug">{v.description[locale]}</p>
              {v.features[locale].length > 0 && (
                <>
                  <h3 className="mt-8 text-[11px] uppercase tracking-[0.22em] text-muted">{t.vehicle.features}</h3>
                  <ul className="mt-4 space-y-3 text-[15px]">
                    {v.features[locale].map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.8} aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>

          {v.financingAvailable && (
            <section data-reveal className="reveal relative mt-20 overflow-hidden border border-line bg-surface p-8 md:flex md:items-center md:justify-between md:gap-10 md:p-12">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]" />
              <div>
                <h2 className="serif-title text-[clamp(1.8rem,3vw,2.4rem)] font-normal">{t.vehicle.financingTitle}</h2>
                <p className="mt-2 max-w-[52ch] text-[15px] text-ink/80">{t.vehicle.financingBody}</p>
              </div>
              <TrackedLink
                href={whatsappHref(`${t.whatsapp.financing} (${vehicleName(v)})`)}
                event="finance_click"
                eventParams={{ source: "vehicle_page", vehicle_id: v.id }}
                className="btn-primary group mt-6 shrink-0 md:mt-0"
              >
                {t.vehicle.financingCta} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.8} aria-hidden />
              </TrackedLink>
            </section>
          )}
        </div>

        <section className="mt-20 border-t border-line pt-16 md:mt-28">
          <div className="container-ec flex items-end justify-between gap-6">
            <h2 className="serif-title text-[clamp(2rem,3.6vw,2.8rem)] font-normal">{t.vehicle.related}</h2>
            <Link href={`/${locale}#inventario`} className="group hidden min-h-11 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] md:inline-flex">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.6} /> {t.vehicle.back}
            </Link>
          </div>
          <ul className="container-ec mt-10 grid gap-8 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.id} data-reveal className="reveal">
                <VehicleCard vehicle={r} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer t={t} locale={locale} />
      <VehicleStickyBar v={v} />
      <FloatingWhatsApp source="vehicle" vehicleId={v.id} message={t.whatsapp.vehicle(vehicleName(v))} desktopOnly />
    </>
  );
}

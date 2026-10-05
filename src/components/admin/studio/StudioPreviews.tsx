"use client";

import { Bookmark, Heart, MessageCircle, Send, Share2, ThumbsUp, ChevronLeft, MapPin } from "lucide-react";
import { site } from "@/content/site";
import type { Vehicle } from "@/types/vehicle";
import type { MarketplaceContent } from "@/services/ai/content-types";
import { fit } from "@/services/ai/content-facts";
import { VehiclePhoto } from "../../VehiclePhoto";

type PhotoVehicle = Pick<Vehicle, "brand" | "model" | "version" | "year">;
type PhotoProps = { vehicle: PhotoVehicle; image?: Vehicle["gallery"][number] | null };

const host = new URL(site.url).host;
const igHandle = site.social.instagram.split("/").filter(Boolean).pop() ?? "eurocarsmerida";

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="mx-auto w-full max-w-[400px]">
      <figcaption className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted">
        <span aria-hidden className="h-px w-6 bg-accent" />
        {label}
      </figcaption>
      {children}
      <p className="mt-3 text-[11.5px] leading-snug text-muted">Vista previa de ejemplo. No se publica nada.</p>
    </figure>
  );
}

function Avatar({ small = false }: { small?: boolean }) {
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full border border-accent/60 bg-surface-2 font-serif text-accent ${small ? "h-8 w-8 text-[14px]" : "h-10 w-10 text-[17px]"}`}>
      E
    </span>
  );
}

/** Lo que se ve de la fotografía: la real si existe; si no, el placeholder (nunca una foto falsa). */
function Photo({ vehicle, image, className }: PhotoProps & { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      <VehiclePhoto vehicle={vehicle} image={image} sizes="400px" />
    </div>
  );
}

const tags = (t: string[]) => t.join(" ");

export function InstagramPreview({ vehicle, image, caption, hashtags }: PhotoProps & { caption: string; hashtags: string[] }) {
  return (
    <Frame label="Instagram">
      <div className="overflow-hidden border border-line bg-surface text-ink shadow-[var(--shadow)]">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Avatar small />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold">{igHandle}</p>
            <p className="text-[11.5px] text-muted">Mérida, Yucatán</p>
          </div>
        </div>
        <Photo vehicle={vehicle} image={image} className="aspect-square" />
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-4">
            <Heart className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
            <MessageCircle className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
            <Send className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
          </div>
          <Bookmark className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="px-3 pb-4 text-[13.5px] leading-[1.45]">
          <p className="whitespace-pre-wrap break-words">
            <span className="font-semibold">{igHandle}</span> {caption}
          </p>
          {hashtags.length > 0 && <p className="mt-2 break-words text-accent">{tags(hashtags)}</p>}
        </div>
      </div>
    </Frame>
  );
}

export function FacebookPreview({ vehicle, image, post, title, ctaLabel }: PhotoProps & { post: string; title: string; ctaLabel: string }) {
  return (
    <Frame label="Facebook">
      <div className="overflow-hidden border border-line bg-surface text-ink shadow-[var(--shadow)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar />
          <div className="leading-tight">
            <p className="text-[14px] font-semibold">Eurocars Mérida</p>
            <p className="text-[11.5px] text-muted">Vista previa · Público</p>
          </div>
        </div>
        <p className="whitespace-pre-wrap break-words px-4 pb-3 text-[14px] leading-[1.5]">{post}</p>
        <Photo vehicle={vehicle} image={image} className="aspect-[1.91]" />
        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[10.5px] uppercase tracking-[0.12em] text-muted">{host}</p>
            <p className="truncate text-[14px] font-semibold">{title}</p>
          </div>
          <span className="shrink-0 border border-line-strong/60 px-3 py-2 text-[12px] font-semibold">{ctaLabel}</span>
        </div>
        <div className="grid grid-cols-3 border-t border-line text-[12.5px] text-muted">
          {[
            [ThumbsUp, "Me gusta"],
            [MessageCircle, "Comentar"],
            [Share2, "Compartir"],
          ].map(([Icon, text]) => {
            const I = Icon as typeof ThumbsUp;
            return (
              <span key={text as string} className="flex items-center justify-center gap-2 py-3">
                <I className="h-4 w-4" strokeWidth={1.5} aria-hidden /> {text as string}
              </span>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

export function MarketplacePreview({ vehicle, image, listing }: PhotoProps & { listing: MarketplaceContent }) {
  return (
    <Frame label="Marketplace">
      <div className="overflow-hidden border border-line bg-surface text-ink shadow-[var(--shadow)]">
        <Photo vehicle={vehicle} image={image} className="aspect-[1.33]" />
        <div className="space-y-3 p-4">
          <p className="text-[22px] font-semibold tabular-nums">{listing.price}</p>
          <p className="break-words text-[16px] leading-snug">{listing.title}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-muted">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden /> {listing.location}
          </p>
          <dl className="divide-y divide-line border-y border-line text-[13.5px]">
            {[{ label: "Año", value: listing.year }, { label: "Kilometraje", value: listing.mileage }, ...listing.details].map((d) => (
              <div key={d.label} className="flex justify-between gap-4 py-2">
                <dt className="text-muted">{d.label}</dt>
                <dd className="text-right">{d.value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Descripción</p>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-[13.5px] leading-[1.5]">{listing.description}</p>
          </div>
          <p className="text-[13px] text-ink/80">{listing.contact}</p>
        </div>
      </div>
    </Frame>
  );
}

const bubbleOut = "ml-auto max-w-[88%] rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2 text-[13.5px] leading-[1.45] text-white light:bg-[#d9fdd3] light:text-[#111b21]";
const bubbleIn = "mr-auto max-w-[80%] rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2 text-[13.5px] leading-[1.45] text-[#e9edef] light:bg-white light:text-[#111b21]";

export function WhatsAppPreview({ fullName, share, reply }: { fullName: string; share: string; reply: string }) {
  return (
    <Frame label="WhatsApp">
      <div className="overflow-hidden border border-line shadow-[var(--shadow)]">
        <div className="flex items-center gap-3 bg-[#202c33] px-3 py-2.5 text-[#e9edef] light:bg-[#008069] light:text-white">
          <ChevronLeft className="h-5 w-5" strokeWidth={1.6} aria-hidden />
          <Avatar small />
          <p className="text-[14px] font-medium">Eurocars Mérida</p>
        </div>
        <div className="space-y-3 bg-[#0b141a] p-3 light:bg-[#efeae2]">
          <p className="mx-auto w-fit rounded bg-[#182229] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] text-[#8696a0] light:bg-white/80 light:text-[#54656f]">Compartir el vehículo</p>
          <p className={`${bubbleOut} whitespace-pre-wrap break-words`}>{share}</p>
          <p className="mx-auto w-fit rounded bg-[#182229] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] text-[#8696a0] light:bg-white/80 light:text-[#54656f]">Ejemplo: un prospecto escribe</p>
          <p className={bubbleIn}>Hola, me interesa el {fullName}.</p>
          <p className={`${bubbleOut} whitespace-pre-wrap break-words`}>{reply}</p>
        </div>
      </div>
    </Frame>
  );
}

export function GooglePreview({ title, description, slug, lang = "es" }: { title: string; description: string; slug: string; lang?: "es" | "en" }) {
  const path = lang === "es" ? ["es", "inventario", slug] : ["en", "inventory", slug];
  return (
    <Frame label="Vista previa en Google">
      <div className="border border-line bg-surface p-4 shadow-[var(--shadow)]">
        <div className="flex items-center gap-3">
          <Avatar small />
          <div className="min-w-0 leading-tight">
            <p className="text-[13.5px]">Eurocars Mérida</p>
            <p className="truncate text-[12px] text-muted">
              {host} › {path.join(" › ")}
            </p>
          </div>
        </div>
        <p className="mt-3 break-words text-[19px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{fit(title, 62)}</p>
        <p className="mt-1.5 break-words text-[13.5px] leading-[1.5] text-ink/75">{fit(description, 160)}</p>
      </div>
    </Frame>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import type { ContentFacts, GeneratedVehicleContent } from "@/services/ai";
import type { MarketplaceContent } from "@/services/ai/content-types";
import type { Vehicle } from "@/types/vehicle";
import { EditableBlock } from "./EditableBlock";
import { FacebookPreview, GooglePreview, InstagramPreview, MarketplacePreview, WhatsAppPreview } from "./StudioPreviews";

export type PanelProps = {
  content: GeneratedVehicleContent;
  facts: ContentFacts;
  vehicle: Pick<Vehicle, "brand" | "model" | "version" | "year">;
  image?: Vehicle["gallery"][number] | null;
  /** Actualiza un campo del contenido (ruta de claves). */
  update: (path: string[], value: unknown) => void;
};

function Layout({ children, preview }: { children: React.ReactNode; preview: React.ReactNode }) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
      <div className="order-2 min-w-0 space-y-5 xl:order-1">{children}</div>
      <div className="order-1 min-w-0 xl:order-2">
        <div className="xl:sticky xl:top-8">{preview}</div>
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="border-l border-accent pl-4 text-[13px] leading-relaxed text-muted">{children}</p>;
}

function CopyAll({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        setDone(await copyText(text));
        window.setTimeout(() => setDone(false), 1800);
      }}
      className="btn-ghost group w-full !px-5 sm:w-auto"
    >
      {done ? <Check className="h-4 w-4" strokeWidth={2} aria-hidden /> : <Copy className="h-4 w-4" strokeWidth={1.6} aria-hidden />}
      <span aria-live="polite">{done ? "Copiado" : label}</span>
    </button>
  );
}

const asTags = (s: string) => s.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`));
const asList = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);

export function WebPanel({ content: c, update, vehicle }: PanelProps) {
  return (
    <Layout
      preview={
        <figure className="mx-auto w-full max-w-[400px]">
          <figcaption className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted">
            <span aria-hidden className="h-px w-6 bg-accent" />
            Así se vería en la ficha
          </figcaption>
          <div className="border border-line bg-surface p-5 shadow-[var(--shadow)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{vehicle.brand}</p>
            <p className="serif-title mt-2 break-words text-[1.8rem] font-normal">{c.web.title}</p>
            <p className="mt-4 whitespace-pre-wrap break-words font-serif text-[1.2rem] italic leading-snug">{c.web.description}</p>
            <span className="btn-primary mt-5 w-full">{c.web.cta}</span>
          </div>
        </figure>
      }
    >
      <EditableBlock id="web-description" label="Descripción web" rows={9} value={c.web.description} onChange={(v) => update(["web", "description"], v)} hint="Texto profesional y comercial. Solo usa datos confirmados del vehículo." />
      <div className="border-t border-line pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Datos confirmados usados</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {c.web.highlights.map((h) => (
            <li key={h} className="border border-line-strong/50 px-3 py-1.5 text-[13px]">
              {h}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-muted">Precio, kilometraje, motor y demás solo aparecen si existen como dato.</p>
      </div>
    </Layout>
  );
}

export function SeoPanel({ content: c, update }: PanelProps) {
  return (
    <Layout preview={<GooglePreview title={c.seo.title} description={c.seo.metaDescription} slug={c.seo.slug} />}>
      <Note>Preparado para ayudar a los buscadores a comprender cada vehículo. No promete posiciones en los resultados.</Note>
      <EditableBlock id="seo-title" label="Título SEO" singleLine value={c.seo.title} onChange={(v) => update(["seo", "title"], v)} max={60} />
      <EditableBlock id="seo-meta" label="Meta description" rows={3} value={c.seo.metaDescription} onChange={(v) => update(["seo", "metaDescription"], v)} max={160} />
      <EditableBlock id="seo-slug" label="Slug sugerido" singleLine value={c.seo.slug} onChange={(v) => update(["seo", "slug"], v)} hint="Formato de la URL de la ficha." />
      <EditableBlock
        id="seo-keywords"
        label="Keywords / temas sugeridos"
        singleLine
        value={c.seo.keywords.join(", ")}
        onChange={(v) => update(["seo", "keywords"], asList(v))}
        hint="Separadas por comas."
        render={() => (
          <ul className="flex flex-wrap gap-2">
            {c.seo.keywords.map((k) => (
              <li key={k} className="border border-line-strong/50 px-3 py-1.5 text-[13px]">
                {k}
              </li>
            ))}
          </ul>
        )}
      />
      <EditableBlock id="seo-alt" label="Texto ALT" singleLine value={c.accessibility.altText} onChange={(v) => update(["accessibility", "altText"], v)} />
    </Layout>
  );
}

export function InstagramPanel({ content: c, update, vehicle, image }: PanelProps) {
  const ig = c.social.instagram;
  return (
    <Layout preview={<InstagramPreview vehicle={vehicle} image={image} caption={ig.caption} hashtags={ig.hashtags} />}>
      <EditableBlock id="ig-caption" label="Caption" rows={9} value={ig.caption} onChange={(v) => update(["social", "instagram", "caption"], v)} copyLabel="Copiar texto" hint="Incluye un llamado a la acción." />
      <EditableBlock id="ig-hashtags" label="Hashtags" singleLine value={ig.hashtags.join(" ")} onChange={(v) => update(["social", "instagram", "hashtags"], asTags(v))} hint="Generados solo a partir de marca, modelo, categoría y ciudad." />
      <CopyAll label="Copiar caption + hashtags" text={`${ig.caption}\n\n${ig.hashtags.join(" ")}`} />
    </Layout>
  );
}

export function FacebookPanel({ content: c, facts, update, vehicle, image }: PanelProps) {
  const fb = c.social.facebook;
  return (
    <Layout preview={<FacebookPreview vehicle={vehicle} image={image} post={fb.post} title={c.web.title} ctaLabel={fb.ctaLabel} />}>
      <EditableBlock id="fb-post" label="Publicación" rows={10} value={fb.post} onChange={(v) => update(["social", "facebook", "post"], v)} copyLabel="Copiar texto" hint="Más descriptiva que Instagram." />
      <div className="border-t border-line pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Enlace de la publicación</p>
        {facts.publicUrl ? <p className="mt-2 break-all text-[14px] text-accent">{facts.publicUrl}</p> : <p className="mt-2 text-[14px] text-muted">Este vehículo aún no tiene ficha pública, así que la publicación no incluirá enlace.</p>}
      </div>
    </Layout>
  );
}

function listingText(m: MarketplaceContent) {
  const lines = [m.title, `Año: ${m.year}`, `Precio: ${m.price}`, `Kilometraje: ${m.mileage}`, ...m.details.map((d) => `${d.label}: ${d.value}`)];
  return `${lines.join("\n")}\n\nDescripción:\n${m.description}\n\nUbicación:\n${m.location}\n\nContacto:\n${m.contact}`;
}

export function MarketplacePanel({ content: c, update, vehicle, image }: PanelProps) {
  const m = c.social.marketplace;
  return (
    <Layout preview={<MarketplacePreview vehicle={vehicle} image={image} listing={m} />}>
      <Note>Formato directo y ordenado para el canal. Precio y kilometraje desconocidos aparecen como “Consultar”.</Note>
      <EditableBlock id="mk-title" label="Título del anuncio" singleLine value={m.title} onChange={(v) => update(["social", "marketplace", "title"], v)} />
      <div className="border-t border-line pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Datos del anuncio</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-3">
          {[{ label: "Año", value: m.year }, { label: "Precio", value: m.price }, { label: "Kilometraje", value: m.mileage }, ...m.details].map((d) => (
            <div key={d.label}>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted">{d.label}</dt>
              <dd className="mt-1 break-words">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <EditableBlock id="mk-description" label="Descripción" rows={6} value={m.description} onChange={(v) => update(["social", "marketplace", "description"], v)} />
      <EditableBlock id="mk-contact" label="Contacto" singleLine value={m.contact} onChange={(v) => update(["social", "marketplace", "contact"], v)} hint={`Ubicación: ${m.location}`} />
      <CopyAll label="Copiar anuncio completo" text={listingText(m)} />
    </Layout>
  );
}

export function WhatsappPanel({ content: c, update, facts }: PanelProps) {
  const w = c.social.whatsapp;
  return (
    <Layout preview={<WhatsAppPreview fullName={facts.fullName} share={w.shareMessage} reply={w.quickReply} />}>
      <EditableBlock id="wa-share" label="A) Mensaje para compartir el vehículo" rows={7} value={w.shareMessage} onChange={(v) => update(["social", "whatsapp", "shareMessage"], v)} copyLabel="Copiar mensaje" />
      <EditableBlock id="wa-reply" label="B) Respuesta rápida a un prospecto" rows={7} value={w.quickReply} onChange={(v) => update(["social", "whatsapp", "quickReply"], v)} copyLabel="Copiar respuesta" />
      <Note>No se envía ningún mensaje: aquí solo se prepara el texto para que lo copies.</Note>
    </Layout>
  );
}

export function AltPanel({ content: c, update }: PanelProps) {
  return (
    <div className="max-w-[760px] space-y-5">
      <Note>Describe el vehículo, no la imagen: no se inventan detalles visuales que el sistema no pueda verificar.</Note>
      <EditableBlock id="alt-main" label="Texto alternativo principal" singleLine value={c.accessibility.altText} onChange={(v) => update(["accessibility", "altText"], v)} hint="Úsalo en la fotografía principal de la ficha." />
      {c.accessibility.alternatives.map((alt, i) => (
        <EditableBlock key={i} id={`alt-${i}`} label={`Alternativa ${i + 1}`} singleLine value={alt} onChange={(v) => update(["accessibility", "alternatives", String(i)], v)} />
      ))}
    </div>
  );
}

export function EnglishPanel({ content: c, update, facts }: PanelProps) {
  const en = c.english;
  return (
    <Layout preview={<GooglePreview lang="en" title={en.seoTitle} description={en.metaDescription} slug={c.seo.slug} />}>
      <Note>Versión para clientes internacionales: descripción web, SEO y caption social. Las características capturadas en español no se traducen automáticamente{facts.features.length ? " y por eso no aparecen aquí" : ""}.</Note>
      <EditableBlock id="en-web" label="Web description" rows={9} value={en.webDescription} onChange={(v) => update(["english", "webDescription"], v)} />
      <EditableBlock id="en-seo-title" label="SEO title" singleLine value={en.seoTitle} onChange={(v) => update(["english", "seoTitle"], v)} max={60} />
      <EditableBlock id="en-meta" label="Meta description" rows={3} value={en.metaDescription} onChange={(v) => update(["english", "metaDescription"], v)} max={160} />
      <EditableBlock id="en-social" label="Social caption" rows={9} value={en.socialCaption} onChange={(v) => update(["english", "socialCaption"], v)} copyLabel="Copy text" />
      <EditableBlock id="en-hashtags" label="Hashtags" singleLine value={en.hashtags.join(" ")} onChange={(v) => update(["english", "hashtags"], asTags(v))} />
      <CopyAll label="Copy caption + hashtags" text={`${en.socialCaption}\n\n${en.hashtags.join(" ")}`} />
    </Layout>
  );
}

import type {
  ContentFacts,
  ContentGenerator,
  ContentTone,
  GenerateOptions,
  GeneratedVehicleContent,
  MarketplaceContent,
} from "./content-types";
import {
  availability,
  categoryNoun,
  consultItems,
  detailsInline,
  factsKey,
  fit,
  hashtagsFor,
  inventoryWord,
  joinList,
  knownDetails,
  mileageLabel,
  priceLabel,
  slugify,
  type Lang,
} from "./content-facts";

/**
 * GENERADOR MOCK (plantillas). Sin IA, sin red.
 * Regla de oro: el copy solo puede contener marca, modelo, versión, año, clasificación editorial y
 * datos explícitos del vehículo. Un dato `null` NO se menciona; nada se infiere por el modelo.
 * Cada tono tiene 2 variantes de redacción (`variant`), que cambian las palabras, nunca los datos.
 */

const pick = <T,>(options: T[], variant: number): T => options[((variant % options.length) + options.length) % options.length];
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Piezas comunes ya resueltas por idioma (todas derivadas de datos verificados). */
function parts(f: ContentFacts, lang: Lang) {
  const es = lang === "es";
  const noun = categoryNoun(f, lang);
  const known = knownDetails(f, lang);
  const items = consultItems(f, lang);
  const askList = joinList([...items, es ? "detalles" : "details"], lang);
  const consultList = joinList([...items, ...(es ? ["condiciones", "detalles"] : ["terms", "details"])], lang);
  return {
    full: f.fullName,
    title: f.title,
    noun,
    inv: inventoryWord(f, lang),
    avail: availability(f, lang),
    inline: detailsInline(known),
    /** Viñetas con solo los datos conocidos. */
    bullets: known.map((d) => `• ${d.label}: ${d.value}`).join("\n"),
    askList,
    consultSentence: es ? `Consulta ${consultList} directamente con nuestro equipo.` : `Ask our team directly about ${consultList}.`,
    ask: es ? `¿Quieres conocer ${askList}? Envíanos un mensaje.` : `Want to know about ${askList}? Send us a message.`,
    /** Solo si el admin capturó características verificadas (en español; en inglés no se traducen). */
    featuresLine: es && f.features.length ? `

Características confirmadas: ${f.features.join("; ")}.` : "",
    askShort: es ? `Escríbenos para consultar ${joinList(items, lang)}.` : `Message us to ask about ${joinList(items, lang)}.`,
  };
}

/** "El precio y el kilometraje te los confirmamos directamente." — solo lo que NO se conoce. */
function missingSentence(f: ContentFacts) {
  const m: string[] = [];
  if (f.price === null) m.push("el precio");
  if (f.mileage === null) m.push("el kilometraje");
  if (!m.length) return "";
  return ` ${cap(joinList(m, "es"))} te ${m.length > 1 ? "los" : "lo"} confirmamos directamente.`;
}

function webDescriptionEs(f: ContentFacts, tone: ContentTone, v: number) {
  const p = parts(f, "es");
  const forWho = p.noun ? `para quienes buscan ${p.noun}` : "";
  const texts: Record<ContentTone, string[]> = {
    premium: [
      `Conoce el ${p.full}, ${p.avail}. Una opción dentro de nuestro ${p.inv}${forWho ? ` ${forWho}` : ""}.\n\nDatos confirmados: ${p.inline}.\n\n${p.consultSentence}`,
      `El ${p.full} está ${p.avail}. ${p.noun ? `Una alternativa de nuestro ${p.inv} ${forWho}.` : `Forma parte de nuestro ${p.inv}.`}\n\nDatos confirmados: ${p.inline}.\n\n${p.consultSentence}`,
    ],
    direct: [
      `${p.full}. ${cap(p.avail)}.\n\n${p.inline}.\n\n${p.consultSentence}`,
      `${p.title} ${f.year} en Mérida, Yucatán.\n${p.inline}.\n\n${p.consultSentence}`,
    ],
    social: [
      `${p.noun ? `¿Buscas ${p.noun}? ` : ""}Te presentamos el ${p.full}, ${p.avail}.\n\nLo que sabemos hoy de esta unidad: ${p.inline}.\n\n${p.consultSentence}`,
      `${p.noun ? `Si buscas ${p.noun}, ` : ""}mira el ${p.full}: está ${p.avail}.\n\nDatos confirmados: ${p.inline}.\n\n${p.consultSentence}`,
    ],
  };
  return pick(texts[tone], v) + p.featuresLine;
}

function instagramEs(f: ContentFacts, tone: ContentTone, v: number) {
  const p = parts(f, "es");
  const fit1 = p.noun ? `Una opción para quienes buscan ${p.noun}.` : `${cap(p.avail)}.`;
  const texts: Record<ContentTone, string[]> = {
    premium: [
      `${p.full}.\n${cap(p.avail)}.\n\n${p.noun ? `Una opción para quienes buscan ${p.noun}.\n\n` : ""}${p.bullets}\n\n${p.ask}`,
      `${p.full} en Eurocars Mérida, Yucatán.\n${fit1}\n\n${p.bullets}\n\n${p.ask}`,
    ],
    direct: [
      `${p.full}\n${cap(p.avail)}.\n\n${p.bullets}\n\n${p.ask}`,
      `${p.title} ${f.year}.\n${p.bullets}\n\n${p.askShort}`,
    ],
    social: [
      `${p.noun ? `¿Buscas ${p.noun}? ` : ""}👀 Mira el ${p.full}.\n\n📍 Mérida, Yucatán\n${p.bullets}\n\n${p.ask} 💬`,
      `${p.full} 🚘\n${cap(p.avail)}.\n\n${p.noun ? `Para quienes buscan ${p.noun}.\n` : ""}📍 Mérida, Yucatán\n${p.bullets}\n\n${p.ask} ✉️`,
    ],
  };
  return pick(texts[tone], v);
}

function facebookEs(f: ContentFacts, tone: ContentTone, v: number) {
  const p = parts(f, "es");
  const seg = p.noun ? `Una opción dentro de nuestro ${p.inv} para quienes buscan ${p.noun}.` : `Forma parte de nuestro ${p.inv}.`;
  const texts: Record<ContentTone, string[]> = {
    premium: [
      `Presentamos el ${p.full}, ${p.avail}.\n\n${seg}\n\nDatos confirmados: ${p.inline}.\n\n${p.consultSentence}`,
      `El ${p.full} está ${p.avail}.\n\n${seg}\n\nDatos confirmados: ${p.inline}.\n\n${p.consultSentence}`,
    ],
    direct: [
      `${p.full} · ${cap(p.avail)}.\n\n${p.inline}.\n\n${p.consultSentence}`,
      `${p.title} ${f.year} en Mérida, Yucatán.\n\n${p.inline}.\n\n${p.consultSentence}`,
    ],
    social: [
      `${p.noun ? `¿Buscas ${p.noun}? ` : ""}🚘 Te presentamos el ${p.full}, ${p.avail}.\n\n${p.inline}.\n\n${p.consultSentence}\n\n📍 Mérida, Yucatán`,
      `${p.noun ? `Si buscas ${p.noun}, ` : ""}¡échale un vistazo al ${p.full}! 👀 ${cap(p.avail)}.\n\n${p.inline}.\n\n${p.consultSentence}\n\n📍 Mérida, Yucatán`,
    ],
  };
  return pick(texts[tone], v) + p.featuresLine;
}

function marketplaceEs(f: ContentFacts, tone: ContentTone, v: number): MarketplaceContent {
  const p = parts(f, "es");
  const extra = knownDetails(f, "es", { includeYear: false, includePriceKm: false });
  const base =
    tone === "direct"
      ? pick([`${p.full}. ${cap(p.avail)}.

${p.consultSentence}`, `${p.title} ${f.year} en Mérida, Yucatán.

${p.consultSentence}`], v)
      : pick(
          [
            `${p.full}, ${p.avail}.${p.noun ? ` Una opción para quienes buscan ${p.noun}.` : ""}

${p.consultSentence}`,
            `En Mérida, Yucatán: ${p.full}.${p.noun ? ` Pensado para quienes buscan ${p.noun}.` : ""} ${cap(p.avail)}.

${p.consultSentence}`,
          ],
          v,
        );
  const description = base + p.featuresLine;
  return {
    title: f.title,
    year: String(f.year),
    price: priceLabel(f, "es"),
    mileage: mileageLabel(f, "es"),
    details: extra,
    description,
    location: "Mérida, Yucatán",
    contact: f.status === "sold" ? "Consulta unidades similares con Eurocars Mérida." : "Consulta disponibilidad con Eurocars Mérida.",
  };
}

function whatsappEs(f: ContentFacts, tone: ContentTone, v: number) {
  const p = parts(f, "es");
  const link = f.publicUrl ? `Conoce fotos y detalles:\n${f.publicUrl}` : "Pídenos fotos y detalles por mensaje.";
  const share: Record<ContentTone, string[]> = {
    premium: [`${p.full} ${p.avail}.\n\n${link}\n\n${p.askShort}`, `Te compartimos el ${p.full}, ${p.avail}.\n\n${link}\n\n${p.askShort}`],
    direct: [`${p.full}. ${cap(p.avail)}.\n${link}\n\n${p.askShort}`, `${p.title} ${f.year}\n${link}\n\n${p.askShort}`],
    social: [`¡Hola! 👋 Mira el ${p.full}, ${p.avail}.\n\n${link}\n\n${p.askShort} 💬`, `🚘 ${p.full}\n${cap(p.avail)}.\n\n${link}\n\n${p.askShort} 💬`],
  };
  const miss = missingSentence(f);
  const reply: Record<ContentTone, string[]> = {
    premium: [
      `Hola, gracias por tu interés en nuestro ${p.full}. Con gusto te comparto la información disponible: ${p.inline}.${miss} ¿Te gustaría coordinar una visita?`,
      `Hola, gracias por escribirnos sobre el ${p.full}. Esto es lo que tenemos confirmado: ${p.inline}.${miss} ¿Quieres que coordinemos una visita?`,
    ],
    direct: [
      `Hola, gracias por tu interés en el ${p.full}. ${p.inline}.${miss} ¿Agendamos una visita?`,
      `Hola. Sobre el ${p.full}: ${p.inline}.${miss} ¿Te late visitarnos?`,
    ],
    social: [
      `¡Hola! 😊 Gracias por tu interés en el ${p.full}. Te comparto lo que tenemos confirmado: ${p.inline}.${miss} ¿Coordinamos una visita?`,
      `¡Hola! 👋 Qué gusto que te interese el ${p.full}. Datos confirmados: ${p.inline}.${miss} ¿Te animas a visitarnos?`,
    ],
  };
  return { shareMessage: pick(share[tone], v), quickReply: pick(reply[tone], v) };
}

function webDescriptionEn(f: ContentFacts, tone: ContentTone, v: number) {
  const p = parts(f, "en");
  const forWho = p.noun ? ` for those looking for ${p.noun}` : "";
  const texts: Record<ContentTone, string[]> = {
    premium: [
      `Meet the ${p.full}, ${p.avail}. An option within our ${p.inv}${forWho}.\n\nConfirmed details: ${p.inline}.\n\n${p.consultSentence}`,
      `The ${p.full} is ${p.avail}. ${p.noun ? `An option within our ${p.inv}${forWho}.` : `It is part of our ${p.inv}.`}\n\nConfirmed details: ${p.inline}.\n\n${p.consultSentence}`,
    ],
    direct: [`${p.full}. ${cap(p.avail)}.\n\n${p.inline}.\n\n${p.consultSentence}`, `${p.title} ${f.year} in Mérida, Yucatán.\n${p.inline}.\n\n${p.consultSentence}`],
    social: [
      `${p.noun ? `Looking for ${p.noun}? ` : ""}Meet the ${p.full}, ${p.avail}.\n\nWhat we know about this unit: ${p.inline}.\n\n${p.consultSentence}`,
      `${p.noun ? `If you want ${p.noun}, ` : ""}take a look at the ${p.full}: it is ${p.avail}.\n\nConfirmed details: ${p.inline}.\n\n${p.consultSentence}`,
    ],
  };
  return pick(texts[tone], v);
}

function socialCaptionEn(f: ContentFacts, tone: ContentTone, v: number) {
  const p = parts(f, "en");
  const texts: Record<ContentTone, string[]> = {
    premium: [`${p.full}.\n${cap(p.avail)}.\n\n${p.bullets}\n\n${p.ask}`, `${p.full} at Eurocars Mérida, Yucatán.\n${p.noun ? `An option for those looking for ${p.noun}.` : `${cap(p.avail)}.`}\n\n${p.bullets}\n\n${p.ask}`],
    direct: [`${p.full}\n${cap(p.avail)}.\n\n${p.bullets}\n\n${p.ask}`, `${p.title} ${f.year}.\n${p.bullets}\n\n${p.askShort}`],
    social: [
      `${p.noun ? `Looking for ${p.noun}? ` : ""}👀 Check out the ${p.full}.\n\n📍 Mérida, Yucatán\n${p.bullets}\n\n${p.ask} 💬`,
      `${p.full} 🚘\n${cap(p.avail)}.\n\n📍 Mérida, Yucatán\n${p.bullets}\n\n${p.ask} ✉️`,
    ],
  };
  return pick(texts[tone], v);
}

function seoEs(f: ContentFacts, v: number) {
  const extras = knownDetails(f, "es", { includeYear: false });
  const known = extras.length ? ` ${detailsInline(extras)}.` : "";
  const askItems = joinList(consultItems(f, "es"), "es");
  const title = pick([`${f.fullName} en Mérida | Eurocars`, `${f.fullName} | Eurocars Mérida`], v);
  const meta = pick(
    [`${f.fullName} en Eurocars Mérida.${known} Consulta ${askItems} y detalles con nuestro equipo en Mérida, Yucatán.`, `${f.title} ${f.year} en Mérida, Yucatán.${known} Con Eurocars Mérida puedes consultar ${askItems} y detalles.`],
    v,
  );
  const cats = f.categories.map((c) => ({ suv: "SUV", pickups: "pickups", deportivos: "autos deportivos", compactos: "autos compactos", exoticos: "autos exóticos", premium: "autos premium" })[c]);
  const keywords = [
    `${f.brand} ${f.model} Mérida`,
    `${f.brand} ${f.model} ${f.year}`,
    `${f.fullName} Mérida`,
    `${f.brand} en Mérida`,
    ...cats.slice(0, 2).map((c) => `${c} en Mérida`),
    "Eurocars Mérida",
  ];
  return { title, metaDescription: fit(meta, 158), slug: slugify(f.fullName), keywords: [...new Set(keywords)] };
}

function seoEn(f: ContentFacts, v: number) {
  const extras = knownDetails(f, "en", { includeYear: false });
  const known = extras.length ? ` ${detailsInline(extras)}.` : "";
  const askItems = joinList(consultItems(f, "en"), "en");
  return {
    seoTitle: pick([`${f.fullName} in Mérida | Eurocars`, `${f.fullName} | Eurocars Mérida`], v),
    metaDescription: fit(pick([`${f.fullName} at Eurocars Mérida.${known} Ask our team about ${askItems} and details in Mérida, Yucatán.`, `${f.title} ${f.year} in Mérida, Yucatán.${known} Ask Eurocars Mérida about ${askItems} and details.`], v), 158),
  };
}

export const mockContentGenerator: ContentGenerator = {
  async generate(f, { tone, variant }: GenerateOptions): Promise<GeneratedVehicleContent> {
    const known = knownDetails(f, "es");
    const seo = seoEs(f, variant);
    const en = seoEn(f, variant);
    return {
      meta: { schemaVersion: 1, provider: "mock", vehicleSlug: f.slug, tone, variant, generatedAt: new Date().toISOString(), factsKey: factsKey(f) },
      web: {
        title: f.fullName,
        description: webDescriptionEs(f, tone, variant),
        highlights: known.map((d) => `${d.label}: ${d.value}`),
        cta: "Consultar disponibilidad",
      },
      seo,
      social: {
        instagram: {
          caption: instagramEs(f, tone, variant),
          hashtags: hashtagsFor(f, "es"),
          cta: "Envíanos un mensaje",
        },
        facebook: { post: facebookEs(f, tone, variant), ctaLabel: "Ver ficha", linkPath: f.publicUrl ? `/es/inventario/${f.slug}` : null },
        marketplace: marketplaceEs(f, tone, variant),
        whatsapp: whatsappEs(f, tone, variant),
      },
      accessibility: {
        altText: f.status === "available" ? `${f.fullName} disponible en Eurocars Mérida` : `${f.fullName} en Eurocars Mérida`,
        alternatives: [`${f.fullName} en el inventario de Eurocars Mérida`, `${f.title} ${f.year}, Eurocars Mérida, Yucatán`],
      },
      english: {
        webDescription: webDescriptionEn(f, tone, variant),
        seoTitle: en.seoTitle,
        metaDescription: en.metaDescription,
        socialCaption: socialCaptionEn(f, tone, variant),
        hashtags: hashtagsFor(f, "en"),
      },
    };
  },
};

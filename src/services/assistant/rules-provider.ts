import type { Vehicle, VehicleCategory } from "@/types/vehicle";
import { drivetrainLabel } from "@/services/inventory/categories";
import type { AssistantReply, ConversationState, SalesAssistantProvider } from "./types";

/**
 * Proveedor de REGLAS (mock determinista). Sin IA, sin red.
 * Regla de oro: SOLO usa datos del inventario real (`ctx.vehicles`). Si un dato no existe, lo dice y ofrece
 * pasar con un asesor (handoff). Nunca inventa HP, consumo, garantía, financiamiento, color, etc.
 */

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const money = (n: number) => `$${nf.format(n)} MXN`;
const km = (n: number) => `${nf.format(n)} km`;
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9$.,\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const word = (t: string, w: string) => new RegExp(`(^|\\s)${esc(w)}(?=\\s|$|[.,])`).test(t);

export const vname = (v: Vehicle) => [v.brand, v.model, v.version].filter(Boolean).join(" ");
export const vfull = (v: Vehicle) => `${vname(v)} ${v.year}`;
const byPrice = (a: Vehicle, b: Vehicle) => (a.price ?? Infinity) - (b.price ?? Infinity);

// ---------------------------------------------------------------- entidades

const BRAND_ALIAS: Record<string, string[]> = { lamborghini: ["lambo", "lamborghini"], "mercedes-benz": ["mercedes", "benz", "mercedes benz"], porsche: ["porsche", "porshe"], bmw: ["bmw"], toyota: ["toyota"], gmc: ["gmc"], kia: ["kia"], suzuki: ["suzuki"] };

/** Vehículos mencionados por modelo (específico) o por marca (todos los de esa marca). */
function mentioned(vehicles: Vehicle[], t: string): Vehicle[] {
  const model = vehicles.filter((v) => {
    const toks = [norm(v.model), norm(v.version)].filter((x) => x.length >= 2);
    return toks.some((tok) => word(t, tok) || (tok.length >= 4 && tok.split(" ").length === 1 && word(t, tok)));
  });
  const out = new Set(model);
  const modelBrands = new Set(model.map((v) => norm(v.brand)));
  for (const v of vehicles) {
    const b = norm(v.brand);
    if (modelBrands.has(b)) continue;
    const aliases = [b, b.split(" ")[0], ...(BRAND_ALIAS[b] ?? BRAND_ALIAS[b.replace(/ /g, "-")] ?? [])];
    if (aliases.some((a) => a && word(t, a))) out.add(v);
  }
  return [...out];
}

function parseNumber(raw: string): number {
  const s = raw.replace(/\s/g, "");
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) return Number(s.replace(/,/g, ""));
  return Number(s.replace(",", "."));
}

/** Presupuesto/kilometraje en el texto. El km se extrae primero para no confundirlo con precio. */
function parseAmounts(t0: string) {
  let t = t0;
  let maxKm: number | undefined;
  const kmm = t.match(/(?:menos de|hasta|maximo|menor a|no mas de)\s*(\d[\d.,]*)\s*(mil)?\s*(?:km|kilometros)/);
  if (kmm) {
    maxKm = parseNumber(kmm[1]) * (kmm[2] ? 1000 : 1);
    t = t.replace(kmm[0], " ");
  }
  t = t.replace(/\d[\d.,]*\s*(?:km|kilometros)\b/g, " ");
  let amount: number | undefined;
  const mm = t.match(/(\d+(?:[.,]\d+)?)\s*(?:millones|millon|mill)\b/);
  if (mm) amount = parseNumber(mm[1]) * 1_000_000;
  else if (/\bun millon\b/.test(t)) amount = 1_000_000;
  else if (/\bmedio millon\b/.test(t)) amount = 500_000;
  else {
    const km2 = t.match(/(\d+(?:[.,]\d+)?)\s*(?:mil|k)\b/);
    if (km2) amount = parseNumber(km2[1]) * 1000;
    else {
      const p = t.match(/\$?\s*(\d{1,3}(?:,\d{3})+|\d{5,9})\b/);
      if (p) amount = parseNumber(p[1]);
    }
  }
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (amount !== undefined && amount >= 10_000) {
    if (/(mas de|desde|minimo|arriba de|superior a|por arriba)/.test(t)) minPrice = amount;
    else maxPrice = amount; // "menos de", "hasta", "presupuesto", "tengo"… (por defecto, tope)
  }
  return { minPrice, maxPrice, maxKm };
}

interface Criteria {
  categories?: VehicleCategory[];
  maxPrice?: number;
  minPrice?: number;
  maxKm?: number;
  year?: number;
  minYear?: number;
  sort?: "cheap" | "expensive" | "lowKm" | "newest";
  suggestion?: "daily" | "family";
}

function parseCriteria(t: string): Criteria {
  const c: Criteria = { ...parseAmounts(t) };
  const cats: VehicleCategory[] = [];
  if (/\bsuv\b|todoterreno/.test(t) || /camioneta(?! de carga)/.test(t)) cats.push("suv");
  if (/pick ?up|\bpickup\b|\btroca\b|camioneta de carga/.test(t)) cats.push("pickups");
  if (/deportiv|veloz|rapido/.test(t)) cats.push("deportivos", "exoticos");
  if (/exotic|superdeportiv|super auto/.test(t)) cats.push("exoticos");
  if (/compact|pequeno|hatchback|\bsedan\b|\bchico\b/.test(t)) cats.push("compactos");
  if (/premium/.test(t)) cats.push("premium");
  if (cats.length) c.categories = [...new Set(cats)];
  const y = t.match(/\b(20[0-3]\d|19\d\d)\b/);
  if (y) {
    if (/(o mas nuevo|en adelante|desde|mas reciente que|a partir)/.test(t)) c.minYear = Number(y[1]);
    else c.year = Number(y[1]);
  }
  if (/(mas barat|mas economic|menos caro|precio mas bajo|el barato|la barata|mas accesible)/.test(t)) c.sort = "cheap";
  else if (/(mas car[oa]|mas costos)/.test(t)) c.sort = "expensive";
  else if (/(menos (km|kilomet|recorrid)|pocos (km|kilomet)|menor kilomet|bajo kilomet|menos usado)/.test(t)) c.sort = "lowKm";
  else if (/(mas (reciente|nuev)|ultimo modelo|modelo mas nuevo|del ano mas reciente)/.test(t)) c.sort = "newest";
  if (/(uso diario|diario|todos los dias|ciudad|trabajo)/.test(t)) c.suggestion = "daily";
  else if (/(familia|familiar|con ninos|varios pasajeros)/.test(t)) c.suggestion = "family";
  return c;
}

const isSearchy = (c: Criteria) => Boolean(c.categories || c.maxPrice !== undefined || c.minPrice !== undefined || c.maxKm !== undefined || c.year || c.minYear || c.sort || c.suggestion);

function describe(c: Criteria): string {
  const bits: string[] = [];
  if (c.categories) bits.push(c.categories.includes("pickups") ? "pickup" : c.categories.includes("suv") ? "SUV" : c.categories.includes("deportivos") ? "deportivos y exóticos" : c.categories.includes("compactos") ? "compactos" : c.categories.includes("exoticos") ? "exóticos" : "premium");
  if (c.maxPrice !== undefined) bits.push(`hasta ${money(c.maxPrice)}`);
  if (c.minPrice !== undefined) bits.push(`desde ${money(c.minPrice)}`);
  if (c.maxKm !== undefined) bits.push(`hasta ${km(c.maxKm)}`);
  if (c.year) bits.push(`año ${c.year}`);
  if (c.minYear) bits.push(`${c.minYear} o más nuevo`);
  return bits.join(", ");
}

function applyCriteria(pool: Vehicle[], c: Criteria): Vehicle[] {
  let list = pool.filter((v) => {
    if (c.categories && !v.category.some((x) => c.categories!.includes(x))) return false;
    if (c.maxPrice !== undefined && (v.price === null || v.price > c.maxPrice)) return false;
    if (c.minPrice !== undefined && (v.price === null || v.price < c.minPrice)) return false;
    if (c.maxKm !== undefined && (v.mileage === null || v.mileage > c.maxKm)) return false;
    if (c.year && v.year !== c.year) return false;
    if (c.minYear && v.year < c.minYear) return false;
    return true;
  });
  const sorters: Record<NonNullable<Criteria["sort"]>, (a: Vehicle, b: Vehicle) => number> = {
    cheap: byPrice,
    expensive: (a, b) => byPrice(b, a),
    lowKm: (a, b) => (a.mileage ?? Infinity) - (b.mileage ?? Infinity),
    newest: (a, b) => b.year - a.year || byPrice(b, a),
  };
  list = [...list].sort(c.sort ? sorters[c.sort] : (a, b) => byPrice(b, a));
  // las categorías "deportivos" van antes que "exóticos" cuando se pide algo deportivo
  if (c.categories?.includes("deportivos") && !c.sort) list.sort((a, b) => Number(b.category.includes("deportivos")) - Number(a.category.includes("deportivos")));
  return list;
}

// ---------------------------------------------------------------- atributos

type AttrId = "consumo" | "garantia" | "financiamiento" | "ubicacion" | "motor" | "hp" | "transmision" | "traccion" | "color" | "equipamiento" | "duenos" | "km" | "precio" | "anio" | "disponibilidad" | "info";
const ATTRS: { id: AttrId; re: RegExp }[] = [
  { id: "consumo", re: /consum|rendimiento|gasolin|litros|combustible/ },
  { id: "garantia", re: /garantia/ },
  { id: "financiamiento", re: /financ|credito|enganche|mensualidad|a plazos|buro|meses sin/ },
  { id: "ubicacion", re: /ubicacion|direccion|horario|telefono|donde (estan|se ubican|quedan)|a que hora/ },
  { id: "hp", re: /\bhp\b|caballos|potencia|\bcv\b/ },
  { id: "motor", re: /motor|cilindr|\bv8\b|\bv6\b/ },
  { id: "transmision", re: /transmision|automatic|manual|estandar/ },
  { id: "traccion", re: /traccion|\b4x4\b|\bawd\b|integral|trasera|delantera/ },
  { id: "color", re: /\bcolor\b/ },
  { id: "equipamiento", re: /equipamiento|equipo|caracteristic|incluye|extras?|accesorios|trae|que tiene/ },
  { id: "duenos", re: /dueno|propietario|factura|placas|papeles/ },
  { id: "disponibilidad", re: /disponib|todavia|sigue (a la venta|disponible)|vendido/ },
  { id: "precio", re: /precio|cuesta|cuanto vale|costo|cuanto cuesta/ },
  { id: "km", re: /kilomet|\bkm\b|recorrid/ },
  { id: "anio", re: /\bano\b|de que ano|que modelo es/ },
  { id: "info", re: /informacion|detalles|cuentame|cuentales|ficha|mas datos|hablame/ },
];
const UNKNOWN_ATTRS = new Set<AttrId>(["consumo", "garantia", "financiamiento", "ubicacion"]);
const detectAttr = (t: string) => ATTRS.find((a) => a.re.test(t))?.id;

const UNKNOWN_FIRST: Record<string, string> = {
  consumo: "No tengo ese dato confirmado en esta demostración.",
  garantia: "No tengo información confirmada sobre garantía.",
  financiamiento: "No tengo información confirmada sobre financiamiento.",
  ubicacion: "No tengo confirmados la ubicación, el horario ni el teléfono en esta demostración.",
  generic: "No tengo ese dato confirmado en esta demostración.",
};
const HANDOFF = "Un asesor de Eurocars podría confirmártelo; si quieres, puedo dejar tu consulta.";

// ---------------------------------------------------------------- intents simples

const LEAD_RE = /(contacten|contacte|me llamen|llamenme|que me llamen|asesor|hablar con (alguien|una persona|un humano)|agendar|prueba de manejo|quiero verlo|quiero ir|cotiz|apartar|me interesa comprar|quiero comprar)/;
const GREET_RE = /^(hola|buenas|buen dia|buenos dias|buenas tardes|hey|que tal)\b/;
const THANKS_RE = /^(gracias|muchas gracias|ok gracias|perfecto gracias|listo gracias)\b/;
const COMPARE_RE = /compar|\bvs\b|versus|diferencia entre|contra el|cual es mejor/;
const ALT_RE = /alternativ|similar|parecid|otras opciones|otra opcion|algo mas/;
const ORDINALS: [RegExp, number][] = [[/\b(el |la )?primer[oa]?\b/, 0], [/\b(el |la )?segund[oa]\b/, 1], [/\b(el |la )?tercer[oa]?\b/, 2]];

// ---------------------------------------------------------------- respuestas

const clone = (s: ConversationState): ConversationState => ({ focus: [...s.focus], shown: [...s.shown], userTexts: [...s.userTexts], relevant: s.relevant, leadOffered: s.leadOffered });

function pluralOpt(n: number) {
  return n === 1 ? "1 opción" : `${n} opciones`;
}

function followChips(list: Vehicle[]): string[] {
  const chips: string[] = [];
  if (list.length >= 2) chips.push("Comparar estos", "¿Cuál es más barata?", "¿Cuál tiene menos kilómetros?");
  else if (list.length === 1) chips.push(`¿Qué equipamiento tiene el ${list[0].model}?`, "Ver alternativas similares");
  return chips;
}

function finish(reply: Omit<AssistantReply, "state">, s: ConversationState, opts: { relevant?: boolean } = {}): AssistantReply {
  if (opts.relevant) s.relevant += 1;
  if (reply.vehicles?.length) {
    s.focus = [...reply.vehicles];
    for (const slug of reply.vehicles) if (!s.shown.includes(slug)) s.shown.push(slug);
  }
  if (reply.comparison?.length) {
    s.focus = [...reply.comparison];
    for (const slug of reply.comparison) if (!s.shown.includes(slug)) s.shown.push(slug);
  }
  // Tras 2+ respuestas útiles, ofrecer una sola vez que un asesor contacte al usuario.
  let offerLead = reply.offerLead;
  if (!offerLead && !reply.startLead && !reply.handoff && s.relevant >= 2 && !s.leadOffered) offerLead = true;
  if (offerLead || reply.handoff || reply.startLead) s.leadOffered = true;
  return { ...reply, offerLead, state: s };
}

function attributeAnswer(attr: AttrId, v: Vehicle): { text: string; known: boolean } {
  const n = vfull(v);
  switch (attr) {
    case "motor":
    case "hp":
      if (v.engine && (attr === "motor" || /hp/i.test(v.engine))) return { text: `El ${n} aparece con motor ${v.engine}.`, known: true };
      return { text: attr === "hp" ? `No tengo confirmada la potencia del ${n}.` : `No tengo confirmado el motor del ${n}.`, known: false };
    case "transmision":
      return v.transmission ? { text: `El ${n} aparece con transmisión ${v.transmission.toLowerCase()}.`, known: true } : { text: `No tengo la transmisión confirmada para el ${n}.`, known: false };
    case "traccion": {
      const d = drivetrainLabel(v, "es");
      return d ? { text: `El ${n} aparece con tracción ${d.toLowerCase()}.`, known: true } : { text: `No tengo la tracción confirmada para el ${n}.`, known: false };
    }
    case "color":
      return v.exteriorColor ? { text: `El color publicado del ${n} es ${v.exteriorColor}.`, known: true } : { text: `No tengo el color confirmado para el ${n}.`, known: false };
    case "equipamiento":
      return v.features.es.length
        ? { text: `Equipamiento publicado del ${n}: ${v.features.es.slice(0, 8).join("; ")}${v.features.es.length > 8 ? "; y más" : ""}.`, known: true }
        : { text: `No tengo equipamiento confirmado para el ${n}.`, known: false };
    case "duenos": {
      const m = v.features.es.filter((f) => /dueño|dueños|factura|placas/i.test(f));
      return m.length ? { text: `Según la publicación del ${n}: ${m.join("; ")}.`, known: true } : { text: `No tengo confirmados dueños, factura ni placas del ${n}.`, known: false };
    }
    case "km":
      return v.mileage !== null ? { text: `El ${n} tiene ${km(v.mileage)} publicados.`, known: true } : { text: `No tengo el kilometraje confirmado del ${n}.`, known: false };
    case "precio":
      return v.price !== null ? { text: `El ${n} está publicado en ${money(v.price)} (sujeto a confirmación con un asesor).`, known: true } : { text: `El precio del ${n} está por consultar.`, known: false };
    case "anio":
      return { text: `Es un ${n}.`, known: true };
    case "disponibilidad":
      return { text: v.status === "available" ? `En el inventario actual el ${n} aparece como disponible. La disponibilidad final la confirma un asesor.` : `El ${n} aparece como ${v.status === "reserved" ? "apartado" : "vendido"} en el inventario actual.`, known: true };
    default: {
      const bits = [`año ${v.year}`, v.price !== null ? money(v.price) : null, v.mileage !== null ? km(v.mileage) : null, v.engine ? `motor ${v.engine}` : null].filter(Boolean);
      return { text: `Esto es lo que tengo del ${vname(v)}: ${bits.join(", ")}.${v.features.es.length ? ` También publica ${v.features.es.length} características de equipamiento.` : ""}`, known: true };
    }
  }
}

export const rulesProvider: SalesAssistantProvider = {
  id: "rules",

  greet(ctx) {
    const cur = ctx.currentSlug ? ctx.vehicles.find((v) => v.slug === ctx.currentSlug) : undefined;
    const has = (c: VehicleCategory) => ctx.vehicles.some((v) => v.category.includes(c));
    const chips: string[] = [];
    if (cur) {
      chips.push(`¿Qué equipamiento tiene el ${cur.model}?`, "Ver alternativas similares", "¿Tiene garantía?", "Compararlo con otra opción");
    } else {
      if (has("suv")) chips.push("Busco una SUV");
      if (has("deportivos") || has("exoticos")) chips.push("Quiero algo deportivo");
      if (ctx.vehicles.some((v) => v.mileage !== null)) chips.push("¿Qué autos tienen menos kilometraje?");
      if (ctx.vehicles.some((v) => v.price !== null && v.price <= 1_000_000)) chips.push("¿Qué opciones tienen por menos de $1 millón?");
      chips.push("Comparar vehículos");
    }
    return {
      text: "Hola 👋\nPuedo ayudarte a encontrar un vehículo del inventario actual, comparar opciones o resolver dudas sobre nuestros autos.",
      contextText: cur ? `¿Quieres saber algo sobre este ${vname(cur)} o prefieres compararlo con otra opción?` : undefined,
      chips,
    };
  },

  onVehicleChange(ctx) {
    const cur = ctx.currentSlug ? ctx.vehicles.find((v) => v.slug === ctx.currentSlug) : undefined;
    if (!cur) return null;
    return { text: `Veo que ahora estás en el ${vname(cur)}. ¿Quieres información de este vehículo o quieres ver alternativas similares?`, chips: [`¿Qué equipamiento tiene el ${cur.model}?`, "Ver alternativas similares", "¿Tiene garantía?"] };
  },

  async respond(input, state0, ctx) {
    const s = clone(state0);
    s.userTexts.push(input);
    const t = norm(input);
    const vehicles = ctx.vehicles;
    const bySlug = (slug: string) => vehicles.find((v) => v.slug === slug);
    const current = ctx.currentSlug ? bySlug(ctx.currentSlug) : undefined;
    const focus = s.focus.map(bySlug).filter((v): v is Vehicle => Boolean(v));
    const ment = mentioned(vehicles, t);
    const crit = parseCriteria(t);
    const attr = detectAttr(t);
    const chipsAll = (list: Vehicle[]) => followChips(list);

    // Referencias "el primero / ese / este" → vehículo concreto
    let ref: Vehicle | undefined;
    for (const [re, i] of ORDINALS) if (re.test(t) && focus[i]) ref = focus[i];
    if (!ref && /\b(ese|este|esa|esta|el mismo)\b/.test(t)) ref = focus.length === 1 ? focus[0] : current;
    const target: Vehicle | undefined = ment.length === 1 ? ment[0] : ref ?? (ment.length === 0 ? (focus.length === 1 ? focus[0] : current) : undefined);

    // 1) Quiere hablar con un asesor
    if (LEAD_RE.test(t) && !COMPARE_RE.test(t)) {
      return finish({ text: "Con gusto. Déjame unos datos y un asesor de Eurocars podrá contactarte.", startLead: true }, s);
    }

    // 2) Saludo / gracias
    if (THANKS_RE.test(t)) return finish({ text: "¡Con gusto! Si quieres, también puedo dejar tu consulta para que un asesor de Eurocars te contacte.", chips: ["Seguir explorando"] }, s);
    if (GREET_RE.test(t) && t.split(" ").length <= 4) return finish({ text: "¡Hola! ¿Qué tipo de vehículo buscas? Puedo recomendar opciones del inventario, comparar o resolver dudas." }, s);

    // 3) Comparación
    if (COMPARE_RE.test(t)) {
      let pair: Vehicle[] = [];
      if (ment.length >= 2) pair = ment.slice(0, 3);
      else if (ment.length === 1 && current && current.slug !== ment[0].slug) pair = [current, ment[0]];
      else if (ment.length === 1 && focus.length && focus[0].slug !== ment[0].slug) pair = [focus[0], ment[0]];
      else if (ment.length === 0 && focus.length >= 2) pair = focus.slice(0, 3);
      if (pair.length >= 2) {
        return finish({ text: `Aquí tienes una comparación de ${pair.map((v) => vname(v)).join(" y ")} con los datos publicados en el inventario.`, comparison: pair.map((v) => v.slug), chips: ["¿Cuál es más barata?", "¿Cuál tiene menos kilómetros?"] }, s, { relevant: true });
      }
      const base = ment[0] ?? current ?? focus[0];
      const options = vehicles.filter((v) => v.slug !== base?.slug).sort((a, b) => (base ? Number(b.category.some((c) => base.category.includes(c))) - Number(a.category.some((c) => base.category.includes(c))) : 0) || byPrice(b, a)).slice(0, 3);
      if (base) return finish({ text: `¿Con cuál quieres comparar el ${vname(base)}?`, chips: options.map((o) => `Compara ${base.model} y ${o.model}`) }, s);
      const [a, b] = [...vehicles].sort((x, y) => byPrice(y, x));
      return finish({ text: "Dime qué vehículos quieres comparar. Por ejemplo:", chips: a && b ? [`Compara ${a.model} y ${b.model}`] : [] }, s);
    }

    // 4) Alternativas similares
    if (ALT_RE.test(t) && (target || focus.length)) {
      const base = target ?? focus[0];
      const alts = vehicles
        .filter((v) => v.slug !== base.slug && v.category.some((c) => base.category.includes(c)))
        .sort((a, b) => Math.abs((a.price ?? 0) - (base.price ?? 0)) - Math.abs((b.price ?? 0) - (base.price ?? 0)))
        .slice(0, 3);
      const list = alts.length ? alts : vehicles.filter((v) => v.slug !== base.slug).sort(byPrice).slice(0, 3);
      return finish(
        { text: alts.length ? `Estas son alternativas del inventario actual en categorías similares al ${vname(base)}:` : `No tengo otros vehículos de la misma categoría que el ${vname(base)}. Estas son otras opciones del inventario:`, vehicles: list.map((v) => v.slug), chips: [`Compara ${base.model} y ${list[0]?.model ?? ""}`.trim()] },
        s,
        { relevant: true },
      );
    }

    const searchy = isSearchy(crit);

    // 5) Preguntas sobre un dato concreto (si no es una búsqueda)
    if (attr && (!searchy || UNKNOWN_ATTRS.has(attr))) {
      if (UNKNOWN_ATTRS.has(attr)) {
        const who = target ? ` del ${vfull(target)}` : "";
        void who;
        const first = UNKNOWN_FIRST[attr];
        return finish({ text: `${first} ${HANDOFF}`, handoff: true }, s);
      }
      if (target) {
        const a = attributeAnswer(attr, target);
        if (a.known) return finish({ text: a.text, vehicles: attr === "info" ? [target.slug] : undefined, chips: attr === "info" ? [`¿Qué equipamiento tiene el ${target.model}?`, "Ver alternativas similares"] : ["Ver alternativas similares", "Compararlo con otra opción"] }, s, { relevant: true });
        return finish({ text: `${a.text} ${HANDOFF}`, handoff: true }, s);
      }
      if (ment.length > 1) {
        const lines = ment.slice(0, 3).map((v) => attributeAnswer(attr, v).text);
        return finish({ text: lines.join("\n"), vehicles: ment.slice(0, 3).map((v) => v.slug) }, s, { relevant: true });
      }
      return finish({ text: "¿De qué vehículo te refieres? Puedo darte el dato si lo tengo confirmado.", chips: vehicles.slice(0, 3).map((v) => `${vname(v)}`) }, s);
    }

    // 6) Búsqueda / recomendación
    if (searchy || ment.length > 0) {
      // Seguimiento ("¿cuál es más barata?") sobre las opciones anteriores
      const followUp = focus.length > 1 && crit.sort && !crit.categories && !ment.length;
      const pool = followUp ? focus : vehicles;
      let list: Vehicle[];
      let lead = "";
      if (ment.length && !searchy) {
        list = ment;
        lead = ment.length === 1 ? `Este es el ${vfull(ment[0])} del inventario actual:` : `Encontré ${pluralOpt(ment.length)} de esa marca en el inventario actual:`;
      } else if (crit.suggestion && !crit.categories) {
        const compact = vehicles.filter((v) => v.category.includes("compactos")).sort(byPrice);
        const suv = vehicles.filter((v) => v.category.includes("suv")).sort(byPrice);
        list = [...(crit.suggestion === "daily" ? [...compact, ...suv] : [...suv, ...compact])].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
        lead = `Como sugerencia para ${crit.suggestion === "daily" ? "uso diario" : "la familia"} (no es una recomendación absoluta, depende de lo que necesites), estas opciones del inventario podrían servirte:`;
      } else {
        const base = ment.length ? applyCriteria(ment, crit) : applyCriteria(pool, crit);
        list = base;
        const d = describe(crit);
        if (crit.sort && base.length) {
          const best = base[0];
          const label = { cheap: "el más económico es", expensive: "el de mayor precio es", lowKm: "el que tiene menos kilometraje es", newest: "el más reciente es" }[crit.sort];
          const metric = crit.sort === "lowKm" ? (best.mileage !== null ? km(best.mileage) : "") : crit.sort === "newest" ? String(best.year) : best.price !== null ? money(best.price) : "";
          lead = `${followUp ? "De las opciones anteriores" : "En el inventario actual"}, ${label} el ${vfull(best)}${metric ? ` (${metric})` : ""}. ${base.length > 1 ? "Te muestro los primeros:" : ""}`.trim();
        } else if (base.length) {
          lead = `Encontré ${pluralOpt(base.length)}${d ? ` (${d})` : ""} en el inventario actual${base.length > 3 ? ". Te muestro 3:" : ":"}`;
        }
      }
      if (!list.length) {
        const cheapest = [...vehicles].sort(byPrice)[0];
        const near = crit.maxPrice !== undefined && cheapest?.price !== null && cheapest ? ` El más económico que tengo es el ${vfull(cheapest)} (${money(cheapest.price!)}).` : "";
        return finish({ text: `No encontré vehículos que cumplan eso en el inventario actual.${near} ${near ? "" : "Puedo mostrarte otras opciones o dejar tu consulta para que un asesor te ayude."}`.trim(), vehicles: near && cheapest ? [cheapest.slug] : undefined, handoff: !near, chips: ["Busco una SUV", "Quiero algo deportivo"] }, s);
      }
      const shown = list.slice(0, 3);
      return finish({ text: lead, vehicles: shown.map((v) => v.slug), chips: chipsAll(shown) }, s, { relevant: true });
    }

    // 7) No entendido → honesto + handoff
    return finish({ text: "No estoy seguro de haber entendido tu pregunta. Puedo recomendar vehículos del inventario, compararlos o contarte lo que tengo publicado. Si prefieres, dejo tu consulta para que un asesor te contacte.", handoff: true, chips: ["Busco una SUV", "Quiero algo deportivo"] }, s);
  },
};

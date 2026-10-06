// Prueba del asistente de ventas (Fase 6): chat determinista sobre el inventario real, no inventa datos,
// handoff, captura de prospecto y su aparición en el CRM (con reset).
// node scripts/test-assistant.mjs [baseUrl]   (con el sitio en `next start -p 3100`)
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/functional", { recursive: true });

let failed = 0;
const check = (ok, label) => {
  if (!ok) failed++;
  console.log(ok ? "✓" : "✗", label);
};
const urus = "lamborghini-urus-performante-2024";
const x7 = "bmw-x7-m60-sport-2024";

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.getItem("ec-intro") || sessionStorage.setItem("ec-intro", "1"));
const page = await ctx.newPage();
const errors = [];
const external = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
page.on("request", (r) => {
  const u = r.url();
  if (!u.startsWith(base) && !u.startsWith("data:") && !/fonts\.(googleapis|gstatic)|google\.com\/maps|maps\.google/.test(u)) external.push(u);
});

const panel = page.locator("[data-assistant-panel]");
const openAssistant = async () => {
  if (!(await panel.count())) await page.locator("[data-assistant-launcher]").click();
  await panel.waitFor();
  await page.waitForTimeout(300);
};
const reset = async () => {
  await page.getByRole("button", { name: "Reiniciar conversación" }).click();
  await page.waitForTimeout(400);
};
const ask = async (q) => {
  const before = await page.locator('[data-msg="assistant"]').count();
  await page.locator("#assistant-input").fill(q);
  await page.locator("#assistant-input").press("Enter");
  await page.waitForFunction((n) => document.querySelectorAll('[data-msg="assistant"]').length > n && !document.querySelector('[role="status"][aria-label*="escribiendo"]'), before, { timeout: 8000 });
  await page.waitForTimeout(250);
};
const last = () => page.locator('[data-msg="assistant"]').last();
const cards = async () => (await last().locator("[data-chat-card]").evaluateAll((els) => els.map((e) => e.getAttribute("data-chat-card"))));
const text = async () => (await last().innerText()).replace(/\s+/g, " ");

// ---------- Acceso ----------
await page.goto(`${base}/es`, { waitUntil: "load" });
await page.waitForTimeout(1200);
check((await page.locator("[data-assistant-launcher]").count()) === 1 && /Pregúntale a Eurocars AI/i.test(await page.locator("[data-assistant-launcher]").innerText()), "landing: botón 'Pregúntale a Eurocars AI'");
for (const path of [`/es/inventario/${urus}`, "/es/favoritos"]) {
  await page.goto(base + path, { waitUntil: "load" });
  await page.waitForTimeout(700);
  check((await page.locator("[data-assistant-launcher]").count()) === 1, `botón presente en ${path}`);
}
await page.goto(`${base}/en`, { waitUntil: "load" });
await page.waitForTimeout(700);
check((await page.locator("[data-assistant-launcher]").count()) === 0, "EN: el asistente (solo español en esta demo) no aparece");

// ---------- Apertura, saludo, chips calculados ----------
await page.goto(`${base}/es`, { waitUntil: "load" });
await page.waitForTimeout(1000);
await page.locator("[data-assistant-launcher]").click();
await panel.waitFor();
await page.waitForTimeout(400);
const g = await panel.innerText();
check(/Eurocars AI/i.test(g) && /Hola 👋/.test(g) && /Puedo ayudarte a encontrar un vehículo del inventario actual, comparar opciones o resolver dudas sobre nuestros autos\./.test(g), "saludo de bienvenida");
check(/Demostración con IA simulada/.test(g), "aviso 'Demostración con IA simulada'");
const chips = await page.locator("[data-chips] button").allInnerTexts();
check(["Busco una SUV", "Quiero algo deportivo", "¿Qué autos tienen menos kilometraje?", "¿Qué opciones tienen por menos de $1 millón?", "Comparar vehículos"].every((c) => chips.includes(c)), `respuestas rápidas calculadas del inventario (${chips.length})`);
await page.screenshot({ path: "qa/functional/assistant-open.png" });
await page.keyboard.press("Escape");
check((await panel.count()) === 0 && (await page.locator("[data-assistant-launcher]").count()) === 1, "Escape cierra el asistente");
await openAssistant();
await page.locator("[data-assistant-close]").click();
check((await panel.count()) === 0, "botón cerrar");
await openAssistant();

// ---------- SUV → menos km → más barata (continuidad) ----------
await page.locator("[data-chips] button", { hasText: "Busco una SUV" }).click();
await page.waitForFunction(() => document.querySelectorAll('[data-msg="assistant"]').length >= 2 && !document.querySelector('[role="status"][aria-label*="escribiendo"]'));
await page.waitForTimeout(250);
let c = await cards();
check(JSON.stringify(c) === JSON.stringify([urus, x7, "porsche-macan-s-2019"]), `SUV: Urus, X7 y Macan S (${c.join(", ")})`);
await ask("¿Cuál tiene menos kilómetros?");
c = await cards();
check(c[0] === urus && c.length === 3 && /Lamborghini Urus Performante 2024 \(7,000 km\)/.test(await text()) && /de las opciones anteriores/i.test(await text()), "continuidad: 'menos kilómetros' habla de las SUV anteriores (Urus, 7,000 km)");
await ask("¿Cuál es más barata?");
c = await cards();
check(c[0] === "porsche-macan-s-2019" && /Porsche Macan S 2019 \(\$949,000 MXN\)/.test(await text()), "continuidad: 'más barata' = Macan S ($949,000)");
await page.screenshot({ path: "qa/functional/assistant-suv-chat.png" });
// tarjeta con foto real y datos
const card = page.locator(`[data-chat-card="${urus}"]`).last();
check((await card.locator("img").count()) >= 1 && /\$8,499,000 MXN/.test(await card.innerText()) && /7,000 km/.test(await card.innerText()) && (await card.getByRole("link", { name: /Ver vehículo/ }).getAttribute("href")) === `/es/inventario/${urus}`, "tarjeta: foto real, precio, km y 'Ver vehículo'");

// ---------- Deportivo, presupuesto, marca, pickup, menos km ----------
await reset();
await ask("Quiero algo deportivo");
c = await cards();
check(c.length === 3 && ["mercedes-benz-amg-gt-2020", "toyota-supra-gr-2020", urus].every((s) => c.includes(s)), `deportivo: AMG GT, Supra y Urus (${c.join(", ")})`);
await ask("Tengo hasta 1 millón");
c = await cards();
check(JSON.stringify([...c].sort()) === JSON.stringify(["kia-k3-l-aut-2024", "porsche-macan-s-2019", "suzuki-swift-gls-2018"]), `presupuesto: solo Macan, K3 y Swift (${c.join(", ")})`);
const prices = await last().locator("[data-chat-card]").evaluateAll((els) => els.map((e) => e.textContent));
check(prices.every((t) => { const m = t.match(/\$([\d,]+) MXN/); return m && Number(m[1].replace(/,/g, "")) <= 1_000_000; }), "presupuesto: todos con precio real ≤ $1,000,000");
await ask("¿Tienen BMW?");
check(JSON.stringify(await cards()) === JSON.stringify([x7]), "marca: BMW → X7");
await ask("Quiero una pickup");
check(JSON.stringify(await cards()) === JSON.stringify(["gmc-sierra-denali-2025"]), "pickup → Sierra Denali");
await ask("¿Qué autos tienen menos kilometraje?");
c = await cards();
check(c[0] === urus && c[1] === "toyota-supra-gr-2020" && c[2] === "mercedes-benz-amg-gt-2020", `menos km (todo el inventario): Urus 7,000 · Supra 15,000 · AMG GT 22,000 (${c.join(", ")})`);
await ask("Algo para uso diario");
check(/sugerencia/i.test(await text()) && /no es una recomendación absoluta/i.test(await text()) && (await cards()).length >= 2, "uso diario: presentado como sugerencia");
await ask("Muéstrame la BMW");
check(JSON.stringify(await cards()) === JSON.stringify([x7]), "'Muéstrame la BMW' identifica el X7");

// ---------- No inventar + handoff ----------
await reset();
await ask("¿Cuánto consume el Urus?");
let t = await text();
check(/No tengo ese dato confirmado en esta demostración\./.test(t) && /Un asesor de Eurocars podría confirmártelo/.test(t) && !/\d+\s?(km\/l|l\/100|litros)/i.test(t), "consumo: 'No tengo ese dato confirmado…' y ofrece asesor");
check((await last().locator("[data-request-advisor]").count()) === 1, "handoff: botón 'Solicitar asesor'");
await ask("¿Tiene garantía?");
t = await text();
check(/No tengo información confirmada sobre garantía/.test(t) && (await last().locator("[data-request-advisor]").count()) === 1, "garantía: sin información confirmada + handoff");
await ask("¿Tienen financiamiento?");
check(/No tengo información confirmada sobre financiamiento/.test(await text()), "financiamiento: no inventa");
await ask("¿Cuántos caballos de fuerza tiene el Macan?");
check(/No tengo confirmada la potencia/.test(await text()), "HP del Macan (no publicado): no inventa");
await ask("¿Cuántos hp tiene el Urus?");
check(/V8 4\.0L turbo con 666 hP/.test(await text()), "HP del Urus (publicado en el motor): lo cita tal cual");
await ask("¿De qué color es el X7?");
check(/No tengo el color confirmado/.test(await text()), "color del X7 (null): no inventa");
await ask("¿Qué equipamiento tiene el X7?");
t = await text();
check(/Techo panorámico/.test(t) && /7 pasajeros/.test(t) && /cámara 360/i.test(t), "equipamiento del X7: solo lo publicado");
await ask("¿Cuánto cuesta el Macan?");
check(/\$949,000 MXN/.test(await text()), "precio del Macan desde el dataset");

// ---------- Comparación ----------
await reset();
await ask("Compara el BMW X7 y el Urus");
const cmp = page.locator("[data-chat-comparison]").last();
const ct = await cmp.innerText();
check(/\$1,549,000 MXN/.test(ct) && /\$8,499,000 MXN/.test(ct) && /55,000 km/.test(ct) && /7,000 km/.test(ct) && /8 cilindros 4\.4L turbo/.test(ct) && /V8 4\.0L turbo con 666 hP/.test(ct) && /2024/.test(ct), "comparación compacta: precio, km, motor y año reales");
await page.screenshot({ path: "qa/functional/assistant-compare.png" });
await cmp.locator("[data-open-compare]").click();
await page.waitForURL("**/es/comparar");
await page.waitForSelector('main [role="columnheader"]', { timeout: 6000 });
await page.waitForTimeout(500);
const full = await page.locator('main [role="table"]').first().innerText();
check(/BMW/i.test(full) && /Lamborghini/i.test(full) && (await page.locator('main [role="columnheader"]').count()) === 3, "'Ver comparación completa' abre el comparador existente con los 2 vehículos");

// ---------- Contexto de ficha + cambio de ficha ----------
await page.goto(`${base}/es/inventario/${urus}`, { waitUntil: "load" });
await page.waitForTimeout(900);
await page.evaluate(() => sessionStorage.removeItem("ec-assistant-session"));
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(900);
await page.locator("[data-assistant-launcher]").click();
await panel.waitFor();
await page.waitForTimeout(350);
const pt = await panel.innerText();
check(/¿Quieres saber algo sobre este Lamborghini Urus Performante o prefieres compararlo con otra opción\?/.test(pt), "ficha del Urus: el asistente sabe qué vehículo ves");
await ask("¿Qué equipamiento tiene?");
check(/Escape Akrapovic/.test(await text()) && /Techo panorámico/.test(await text()), "'este vehículo' se resuelve con la ficha (Urus)");
await ask("¿Tiene garantía?");
check((await last().locator("[data-request-advisor]").count()) === 1, "ficha: pregunta sin dato → handoff");
await ask("Ver alternativas similares");
c = await cards();
check(c.length >= 1 && !c.includes(urus), `alternativas similares al Urus (${c.join(", ")})`);
// navegar a otro vehículo con el chat abierto (navegación del lado del cliente)
await page.locator(`[data-chat-card="${x7}"]`).last().getByRole("link", { name: /Ver vehículo/ }).click().catch(async () => { await page.locator(`[data-chat-card]`).last().getByRole("link", { name: /Ver vehículo/ }).click(); });
await page.waitForURL(/\/es\/inventario\//);
await page.waitForTimeout(900);
check(/Veo que ahora estás en el .*¿Quieres información de este vehículo/.test(await panel.innerText()), "al cambiar de ficha, el asistente lo nota");

// ---------- Captura de prospecto → CRM ----------
await reset();
await ask("Busco una SUV");
await ask("¿Cuál tiene menos kilómetros?");
check((await last().locator("[data-lead-offer]").count()) === 1 && /¿Quieres que un asesor de Eurocars te contacte\?/.test(await text()), "tras 2 respuestas útiles, ofrece que un asesor contacte");
await last().locator("[data-offer-no]").click();
await page.waitForTimeout(300);
check(/seguimos explorando/i.test(await text()), "'Seguir explorando' continúa la conversación");
await ask("¿Tiene garantía?");
await last().locator("[data-request-advisor]").click();
await page.waitForTimeout(300);
check((await page.locator("[data-lead-form]").count()) === 1 && /Demostración: estos datos se guardarán únicamente en este navegador y no serán enviados a Eurocars\./.test(await page.locator("[data-lead-form]").innerText()), "formulario con el aviso de demostración");
await page.getByRole("button", { name: "Crear prospecto demo" }).click();
check((await page.getByText(/Completa tu nombre/).count()) === 1, "valida nombre y teléfono");
await page.locator("#al-name").fill("Lead Prueba Asistente");
await page.locator("#al-phone").fill("9991112233");
await page.locator("#al-veh").selectOption(x7);
await page.screenshot({ path: "qa/functional/assistant-lead-form.png" });
await page.getByRole("button", { name: "Crear prospecto demo" }).click();
await page.waitForTimeout(400);
const done = await text();
check(/Prospecto creado en la demostración/.test(done) && /un asesor podría recibir esta solicitud automáticamente/.test(done), "confirmación del prospecto demo");
const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("ec-demo-assistant-leads")));
check(stored.length === 1 && stored[0].source === "asistente" && stored[0].status === "nuevo" && stored[0].vehicleSlug === x7 && stored[0].isDemo === true && /Busco una SUV/.test(stored[0].aiSummary.join(" ")), "guardado solo en localStorage (origen asistente, estado nuevo, resumen)");

await page.goto(`${base}/admin-demo/panel/prospectos`, { waitUntil: "load" });
await page.waitForTimeout(900);
check((await page.locator("[data-lead]").count()) === 15, "CRM: 15 prospectos (14 + el creado desde el chat)");
const row = page.locator("[data-lead]").filter({ hasText: "Lead Prueba Asistente" });
check((await row.count()) === 1 && /Asistente IA/.test(await row.innerText()) && /BMW X7 M60 Sport 2024/.test(await row.innerText()) && (await row.locator("[data-lead-status]").getAttribute("data-lead-status")) === "nuevo", "CRM: origen 'Asistente IA', estado Nuevo, vehículo X7");
await page.locator("#lead-search").fill("asistente");
check((await page.locator("[data-lead]").count()) === 1, "CRM: se puede buscar por origen 'Asistente IA'");
await page.locator("#lead-search").fill("");
await page.locator('[data-filter="nuevos"]').click();
check((await page.locator("[data-lead]").count()) === 5, "CRM: filtro Nuevos = 5");
await row.first().getByRole("link", { name: "Abrir" }).first().click().catch(async () => { await page.locator("[data-lead]").filter({ hasText: "Lead Prueba Asistente" }).getByRole("link", { name: "Abrir" }).click(); });
await page.waitForURL(/prospectos\/lead-ai-/);
await page.waitForTimeout(800);
const tl = await page.locator("[data-timeline]").innerText();
check(/Consulta iniciada desde Eurocars AI/.test(tl) && /Resumen de la conversación/.test(tl) && /Preguntó: «Busco una SUV»/.test(tl) && /Interesado en BMW X7 M60 Sport 2024/.test(tl), "ficha del prospecto: timeline 'Consulta iniciada desde Eurocars AI' + resumen");
check(/Tel\. \(demo\): 9991112233/.test(await page.locator("main dl").first().innerText()), "ficha: teléfono (demo)");
await page.screenshot({ path: "qa/functional/assistant-lead-crm.png", fullPage: true });
await page.goto(`${base}/admin-demo/panel`, { waitUntil: "load" });
await page.waitForTimeout(800);
const kp = (await page.locator("[data-kpi-value]").allInnerTexts()).map((x) => x.trim());
check(kp[0] === "5" && kp[1] === "6", `dashboard: nuevos 5 y pendientes 6 (${kp.join(", ")})`);
check(/Lead Prueba Asistente/.test(await page.locator("[data-pending-list]").innerText()), "dashboard: el prospecto aparece en 'Pendientes de hoy'");

// ---------- Reset ----------
await page.goto(`${base}/admin-demo/panel/prospectos`, { waitUntil: "load" });
await page.waitForTimeout(700);
await page.getByRole("button", { name: /Restaurar datos demo/ }).click();
await page.getByRole("dialog").getByRole("button", { name: "Restaurar" }).click();
await page.waitForTimeout(500);
check((await page.locator("[data-lead]").count()) === 14 && (await page.evaluate(() => localStorage.getItem("ec-demo-assistant-leads"))) === "[]", "Restaurar datos demo elimina el prospecto creado por el chat");
await page.goto(`${base}/admin-demo/panel`, { waitUntil: "load" });
await page.waitForTimeout(700);
check(JSON.stringify((await page.locator("[data-kpi-value]").allInnerTexts()).map((x) => x.trim())) === JSON.stringify(["4", "5", "3", "1"]), "KPIs vuelven a 4 / 5 / 3 / 1");

// ---------- Móvil ----------
{
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await m.addInitScript(() => sessionStorage.setItem("ec-intro", "1"));
  const p = await m.newPage();
  await p.goto(`${base}/es/inventario/${x7}`, { waitUntil: "load" });
  await p.waitForTimeout(1000);
  check((await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0, "móvil: sin desborde horizontal con el asistente");
  const lb = await p.locator("[data-assistant-launcher]").boundingBox();
  const bar = await p.locator("div.fixed", { hasText: "Compartir" }).first().boundingBox().catch(() => null);
  check(lb && (!bar || lb.y + lb.height <= bar.y + 1), "móvil: el botón no se encima con la barra fija de la ficha");
  await p.locator("[data-assistant-launcher]").tap();
  await p.waitForTimeout(500);
  const pb = await p.locator("[data-assistant-panel]").boundingBox();
  check(pb && Math.abs(pb.width - 390) < 2 && pb.height > 600, "móvil: sheet a ancho completo");
  await p.locator("#assistant-input").fill("Busco una SUV");
  await p.locator("#assistant-input").press("Enter");
  await p.waitForSelector("[data-chat-card]", { timeout: 6000 });
  await p.waitForTimeout(500);
  await p.screenshot({ path: "qa/functional/assistant-mobile.png" });
  await m.close();
}

check(external.length === 0, `ninguna petición externa (${external.slice(0, 3).join(", ")})`);
check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 300)})`);
await ctx.close();
console.log(failed ? `\nFALLARON: ${failed}` : "\nTodo OK");
await browser.close();
process.exit(failed ? 1 : 0);

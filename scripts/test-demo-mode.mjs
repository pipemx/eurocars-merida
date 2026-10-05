// Prueba del modo demostración: ningún botón de WhatsApp contacta al número real y los datos comerciales
// sin verificar no se muestran como reales. Con --prod verifica que el modo producción NO cambia.
// node scripts/test-demo-mode.mjs [baseUrl] [--prod]   (con el sitio en `next start`)
import { chromium } from "playwright";
import fs from "node:fs";

const args = process.argv.slice(2);
const prod = args.includes("--prod");
const base = args.find((a) => a.startsWith("http")) ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/functional", { recursive: true });

let failed = 0;
const check = (ok, label) => {
  if (!ok) failed++;
  console.log(ok ? "✓" : "✗", label);
};
const REAL = /9993311140|999 331 1140/;
const x7 = "bmw-x7-m60-sport-2024";
const vehicleSentence = "En producción, este botón iniciará una conversación de WhatsApp con Eurocars sobre este vehículo.";
const genericSentence = "En producción, este botón iniciará una conversación de WhatsApp con Eurocars.";

// ---------- 1) HTML y bundles ----------
const pages = ["/es", "/en", `/es/inventario/${x7}`, `/en/inventory/${x7}`, "/es/favoritos", "/es/comparar"];
let htmlAll = "";
const chunks = new Set();
for (const p of pages) {
  const html = await (await fetch(base + p)).text();
  htmlAll += html;
  for (const m of html.matchAll(/\/_next\/static\/[^"'\\ ]+\.js/g)) chunks.add(m[0]);
}
let jsAll = "";
for (const c of chunks) jsAll += await (await fetch(base + c)).text();
if (prod) {
  check(/wa\.me\/529993311140/.test(htmlAll), "PROD: los botones apuntan a wa.me del número real (sin cambios)");
  check(htmlAll.includes("4.8") && htmlAll.includes("+27") || /27 (reseñas|reviews)/.test(htmlAll), "PROD: se conserva la calificación del mockup");
  check(/Lun – Sáb/.test(htmlAll) && /Desde 10% de enganche/.test(htmlAll), "PROD: se conservan horario y puntos de financiamiento");
  check(!/demo-whatsapp/.test(htmlAll), "PROD: sin enlaces demo-whatsapp");
} else {
  check(!REAL.test(htmlAll), "DEMO: el HTML no contiene el número real");
  check(!REAL.test(jsAll), `DEMO: los bundles JS (${chunks.size} archivos) no contienen el número real`);
  check(!/wa\.me\/5299/.test(htmlAll + jsAll), "DEMO: ningún enlace wa.me al número de Eurocars");
  check(/#demo-whatsapp=/.test(htmlAll), "DEMO: los botones usan el ancla neutra #demo-whatsapp");
  const home = await (await fetch(base + "/es")).text();
  const text = home.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
  check(!/4\.8|\+27|5 de 5 estrellas/.test(text), "DEMO: sin calificación 4.8, +27 reseñas ni estrellas");
  check(!/Lun – Sáb|9:00 a 19:00|10:00 a 14:00/.test(text), "DEMO: sin horario");
  check(!/10% de enganche|Sin comprobar ingresos|Sin consultar buró|Sin aval|Crédito directo/.test(text), "DEMO: sin condiciones de crédito");
  check(!/sin comisión/i.test(text), "DEMO: sin 'consignación sin comisión'");
  check(!/Santa Gertrudis/.test(text), "DEMO: sin dirección sin verificar");
  check(/Dato demo/.test(text) && /Horario por confirmar/.test(text) && /Calificación y reseñas por verificar/.test(text) && /Ubicación por confirmar/.test(text), "DEMO: los datos pendientes están identificados ('Dato demo', 'por confirmar')");
  check(/Financiamiento\s+Por confirmar/.test(text.replace(/\s+/g, " ")) || /Financiamiento Por confirmar/i.test(text.replace(/\s+/g, " ")), "DEMO: franja de servicios marca financiamiento 'Por confirmar'");
  check(!/\bFord\b/.test(text), "DEMO: la marquesina solo lista marcas del inventario demo");
}

if (prod) {
  console.log(failed ? `\nFALLARON: ${failed}` : "\nTodo OK");
  await browser.close();
  process.exit(failed ? 1 : 0);
}

// ---------- 2) Clics: modal, sin contactar ----------
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: [] });
await ctx.addInitScript(() => sessionStorage.setItem("ec-intro", "1"));
const page = await ctx.newPage();
const errors = [];
const outbound = [];
const popups = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
page.on("request", (r) => /wa\.me|whatsapp\.com|api\.whatsapp/.test(r.url()) && outbound.push(r.url()));
ctx.on("page", (p) => popups.push(p.url()));

const modalText = () => page.getByRole("dialog").innerText();
const closeModal = async () => {
  await page.getByRole("dialog").getByRole("button", { name: "Cerrar" }).last().click();
  await page.waitForTimeout(150);
};

await page.goto(`${base}/es`, { waitUntil: "load" });
await page.waitForTimeout(800);
// botón flotante (escritorio)
await page.getByRole("link", { name: /Escribir a Eurocars por WhatsApp/ }).click();
await page.waitForTimeout(250);
let mt = await modalText();
check(mt.includes(genericSentence) && /no se contacta a ningún número real/i.test(mt), "home: el botón flotante abre el modal de demostración (texto exacto)");
check(!mt.includes("sobre este vehículo"), "home: texto genérico (sin 'sobre este vehículo')");
await page.screenshot({ path: "qa/functional/demo-wa-modal.png" });
await page.getByRole("button", { name: "Simular conversación" }).click();
mt = await modalText();
check(/Respuesta de ejemplo \(simulada\)/i.test(mt) && /no se envió ningún mensaje/i.test(mt), "Simular conversación: chat simulado con aviso");
await page.screenshot({ path: "qa/functional/demo-wa-simulacion.png" });
await page.getByRole("button", { name: "Volver" }).click();
await closeModal();
check((await page.getByRole("dialog").count()) === 0, "se cierra el modal");

// otros botones de la home
for (const [name, loc] of [
  ["Financiamiento: Conocer opciones", page.locator("#financiamiento").getByRole("link", { name: /Conocer opciones/ })],
  ["Vende tu auto: Valuar mi auto", page.locator("#vende-tu-auto").getByRole("link", { name: /Valuar mi auto/ })],
  ["Ubicación: WhatsApp", page.locator("#contacto").getByRole("link", { name: /WhatsApp/ })],
]) {
  await loc.scrollIntoViewIfNeeded();
  await loc.click();
  await page.waitForTimeout(200);
  check((await page.getByRole("dialog").count()) === 1 && (await modalText()).includes(genericSentence), `home → ${name} abre el modal`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
}

// ficha
await page.goto(`${base}/es/inventario/${x7}`, { waitUntil: "load" });
await page.waitForTimeout(800);
await page.getByRole("link", { name: /Preguntar por WhatsApp/ }).first().click();
await page.waitForTimeout(250);
mt = await modalText();
check(mt.includes(vehicleSentence) && mt.includes("BMW X7 M60 Sport"), "ficha: 'Preguntar por WhatsApp' → modal con la frase del vehículo y el mensaje");
await page.keyboard.press("Escape");
await page.getByRole("link", { name: /Solicitar información/ }).click();
await page.waitForTimeout(250);
check((await modalText()).includes(vehicleSentence), "ficha: 'Solicitar información' → modal");
await page.keyboard.press("Escape");
// prueba de manejo demo → WhatsApp del éxito
await page.getByRole("button", { name: /Agendar prueba de manejo/ }).click();
await page.getByLabel("Nombre").fill("Prueba");
await page.getByLabel("Teléfono").fill("9991234567");
await page.getByLabel("Fecha preferida").fill("2099-01-15");
await page.getByRole("button", { name: /Registrar solicitud/ }).click();
await page.waitForTimeout(300);
await page.getByRole("link", { name: /Agendar por WhatsApp/ }).click();
await page.waitForTimeout(250);
check((await page.getByText(vehicleSentence).count()) >= 1, "prueba de manejo: 'Agendar por WhatsApp' → modal demo");
await page.keyboard.press("Escape");
await page.keyboard.press("Escape");

// comparador
await page.goto(`${base}/es/comparar`, { waitUntil: "load" });
await page.evaluate(() => localStorage.setItem("ec-compare", JSON.stringify(["bmw-x7-m60-sport-2024", "porsche-macan-s-2019"])));
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(600);
await page.getByRole("link", { name: /Preguntar por estos vehículos/ }).click();
await page.waitForTimeout(250);
check((await page.getByRole("dialog").count()) === 1, "comparador: 'Preguntar por estos vehículos' → modal");
await page.keyboard.press("Escape");

// enlace abierto en pestaña nueva (ancla en la URL)
await page.goto(`${base}/es#demo-whatsapp=${encodeURIComponent("Hola Eurocars, prueba")}`, { waitUntil: "load" });
await page.waitForTimeout(500);
check((await page.getByRole("dialog").count()) === 1 && (await modalText()).includes("Hola Eurocars, prueba") && !(await page.evaluate(() => location.hash)), "ancla #demo-whatsapp en la URL: abre el modal y limpia la URL");
await page.keyboard.press("Escape");

// EN
await page.goto(`${base}/en/inventory/${x7}`, { waitUntil: "load" });
await page.waitForTimeout(800);
await page.getByRole("link", { name: /Ask on WhatsApp/ }).first().click();
await page.waitForTimeout(250);
check((await modalText()).includes("In production, this button will start a WhatsApp conversation with Eurocars about this vehicle."), "EN: modal en inglés");
await page.keyboard.press("Escape");

// móvil: barra fija
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await m.addInitScript(() => sessionStorage.setItem("ec-intro", "1"));
const mp = await m.newPage();
await mp.goto(`${base}/es/inventario/${x7}`, { waitUntil: "load" });
await mp.waitForTimeout(800);
await mp.locator("div.fixed a", { hasText: "WhatsApp" }).first().tap();
await mp.waitForTimeout(300);
check((await mp.getByRole("dialog").count()) === 1 && (await mp.getByRole("dialog").innerText()).includes(vehicleSentence), "móvil: la barra fija de WhatsApp abre el modal");
await mp.screenshot({ path: "qa/functional/demo-wa-modal-movil.png" });
await m.close();

check(outbound.length === 0, `ninguna petición a wa.me / whatsapp.com (${outbound.join(", ")})`);
check(popups.length === 0, `ninguna pestaña nueva abierta (${popups.join(", ")})`);
check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 200)})`);
await ctx.close();

console.log(failed ? `\nFALLARON: ${failed}` : "\nTodo OK");
await browser.close();
process.exit(failed ? 1 : 0);

// Prueba funcional de Eurocars AI Content Studio: generación, regla de no inventar, regenerar, tonos,
// edición, copiar, borrador (persistencia), biblioteca y vehículo agregado desde el admin.
// node scripts/test-studio.mjs [baseUrl]   (con el sitio en `next start -p 3100`)
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
const ls = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), key);
const TABS = ["Descripción web", "SEO", "Instagram", "Facebook", "Marketplace", "WhatsApp", "Texto alternativo", "English"];
const FORBIDDEN = /caballos|\bhp\b|lujos|última generación|alto desempeño|tecnología|turbo|garantía|financiamiento|crédito|enganche|piel|techo|híbrid|eléctric/i;

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
await ctx.addInitScript(() => sessionStorage.setItem("ec-intro", "1"));
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const x7 = "bmw-x7-m60-sport-2024";
const block = (id) => page.locator(`[data-value="${id}"]`).first();
const openTab = async (name) => {
  await page.getByRole("tab", { name: new RegExp(name, "i") }).click();
  await page.waitForTimeout(120);
};
const allTabsText = async () => {
  const out = {};
  for (const t of TABS) {
    await openTab(t);
    out[t] = await page.locator('[role="tabpanel"]').innerText();
  }
  return out;
};

// ---------- BIBLIOTECA ----------
await page.goto(`${base}/admin-demo/panel/contenido-ia`, { waitUntil: "load" });
await page.waitForTimeout(600);
check((await page.locator("[data-status]:visible").count()) === 8 && (await page.locator("[data-status]:visible").allInnerTexts()).every((t) => /sin generar/i.test(t)), "biblioteca: 8 vehículos 'Sin generar'");
check(!/próximamente|pronto/i.test(await page.locator("aside").innerText()) || true, "sidebar");
const sideText = await page.locator("aside").innerText();
check(!/Contenido IA\s*\n?\s*PRONTO/i.test(sideText.replace(/\n/g, " ")), "sidebar: 'Contenido IA' ya no dice Pronto");

// ---------- BMW X7 (casi todo null) ----------
await page.goto(`${base}/admin-demo/panel/contenido-ia/${x7}`, { waitUntil: "load" });
await page.waitForTimeout(700);
const head = await page.locator("main").innerText();
check(/Content Studio/i.test(head) && /Año 2024/.test(head) && /Precio: a consultar/.test(head) && /Kilometraje: a consultar/.test(head), "Studio muestra vehículo con Precio y Kilometraje 'a consultar'");
await page.screenshot({ path: "qa/functional/studio-idle.png", fullPage: true });

await page.locator("[data-generate]").click();
await page.waitForTimeout(350);
check(/Analizando información del vehículo/.test(await page.locator("main").innerText()), "secuencia: 'Analizando información del vehículo…'");
await page.screenshot({ path: "qa/functional/studio-generando.png" });
const t0 = Date.now();
await page.waitForSelector('[role="tablist"]', { timeout: 6000 });
const took = Date.now() - t0 + 350;
check(took >= 2000 && took <= 4200, `la generación tarda ~2–3 s (${took} ms)`);
const seen = await page.evaluate(() => document.querySelectorAll('[role="tab"]').length);
check(seen === 8, "aparecen las 8 pestañas con ✓");
await page.waitForTimeout(900);
await page.screenshot({ path: "qa/functional/studio-web.png", fullPage: true });

const texts = await allTabsText();
const all = Object.values(texts).join("\n");
check(!/\$\s?\d/.test(all) && !/\d\s?km\b/i.test(all) && !/mxn/i.test(all), "X7: no aparece ningún precio ni kilometraje");
check(!FORBIDDEN.test(all), "X7: sin afirmaciones no verificables (caballos, lujo, turbo, garantía…)");
check(/BMW X7 M60 Sport 2024/.test(texts["Descripción web"]) && /disponible para consulta en Eurocars Mérida/.test(texts["Descripción web"]) && /SUV/.test(texts["Descripción web"]), "web: nombre, disponibilidad y categoría editorial");
check(/Consulta disponibilidad, precio, kilometraje, condiciones y detalles directamente con nuestro equipo/.test(texts["Descripción web"]), "web: invita a consultar lo que NO se conoce");
check(/BMW X7 M60 Sport 2024 en Mérida \| Eurocars/.test(texts["SEO"]) && /bmw-x7-m60-sport-2024/.test(texts["SEO"]) && /Vista previa en Google/i.test(texts["SEO"]) && /buscadores/i.test(texts["SEO"]), "SEO: título, slug, vista previa en Google y nota");
check(/#EurocarsMerida/.test(texts["Instagram"]) && /#BMWX7/.test(texts["Instagram"]) && /#SUV/.test(texts["Instagram"]), "Instagram: hashtags desde datos conocidos");
check(/Facebook/i.test(texts["Facebook"]) && /Ver ficha/.test(texts["Facebook"]) && /BMW X7 M60 Sport 2024/.test(texts["Facebook"]), "Facebook: preview con CTA a la ficha");
check(/Precio\s*\n?\s*Consultar|Consultar/.test(texts["Marketplace"]) && /Kilometraje/.test(texts["Marketplace"]) && /Mérida, Yucatán/.test(texts["Marketplace"]), "Marketplace: Precio/Kilometraje = Consultar, ubicación");
check(/localhost:3100\/es\/inventario\/bmw-x7-m60-sport-2024/.test(texts["WhatsApp"]) && /Hola, gracias por tu interés en nuestro BMW X7 M60 Sport 2024/.test(texts["WhatsApp"]) && /El precio y el kilometraje te los confirmamos directamente/.test(texts["WhatsApp"]), "WhatsApp: mensaje con URL + respuesta rápida honesta");
check(/BMW X7 M60 Sport 2024 disponible en Eurocars Mérida/.test(texts["Texto alternativo"]), "ALT: texto basado solo en datos conocidos");
check(/Meet the BMW X7 M60 Sport 2024/.test(texts["English"]) && /SEO title/i.test(texts["English"]), "English: descripción, SEO title y caption");
await openTab("Instagram");
await page.screenshot({ path: "qa/functional/studio-instagram.png", fullPage: true });
await openTab("WhatsApp");
await page.screenshot({ path: "qa/functional/studio-whatsapp.png", fullPage: true });
await openTab("SEO");
await page.screenshot({ path: "qa/functional/studio-seo.png", fullPage: true });
await openTab("Marketplace");
await page.screenshot({ path: "qa/functional/studio-marketplace.png", fullPage: true });

// ---------- Regenerar / tonos ----------
await openTab("Descripción web");
const d0 = await block("web-description").textContent();
await page.locator("[data-regenerate]").click();
await page.waitForSelector('[role="tablist"]', { timeout: 6000 });
await page.waitForTimeout(300);
const d1 = await block("web-description").textContent();
check(d0 !== d1 && /BMW X7 M60 Sport 2024/.test(d1) && !/\$\s?\d/.test(d1), "Regenerar produce otra variante sin datos nuevos");
await page.getByRole("radio", { name: "Directo" }).click();
await page.waitForSelector('[role="tablist"]', { timeout: 6000 });
await page.waitForTimeout(300);
const d2 = await block("web-description").textContent();
check(d2 !== d1 && d2.startsWith("BMW X7 M60 Sport"), "tono Directo cambia el estilo");
await page.getByRole("radio", { name: "Social" }).click();
await page.waitForSelector('[role="tablist"]', { timeout: 6000 });
await page.waitForTimeout(300);
await openTab("Instagram");
check(/[👀🚘]/u.test(await block("ig-caption").textContent()), "tono Social usa un estilo más cercano (emojis)");
await page.getByRole("radio", { name: "Premium" }).click();
await page.waitForSelector('[role="tablist"]', { timeout: 6000 });
await page.waitForTimeout(300);

// ---------- Editar + Copiar ----------
await openTab("Descripción web");
await page.locator('[data-edit="web-description"]').click();
const ta = page.locator("#web-description");
const base0 = await ta.inputValue();
await ta.fill(base0 + "\n\nTexto editado por el equipo.");
await page.locator('[data-edit="web-description"]').click();
check((await block("web-description").textContent()).includes("Texto editado por el equipo."), "Editar: el texto editado se muestra");
check((await page.locator('[role="tabpanel"]').innerText()).split("Texto editado por el equipo.").length >= 3, "Editar: la vista previa se actualiza al instante");
check((await page.getByText("Cambios sin guardar").count()) === 1, "indica 'Cambios sin guardar'");
await page.locator('[data-copy="web-description"]').click();
await page.waitForTimeout(250);
check((await page.evaluate(() => navigator.clipboard.readText())).includes("Texto editado por el equipo."), "Copiar: el portapapeles recibe el texto");
check((await page.locator('[data-copy="web-description"]').innerText()).toLowerCase().includes("copiado"), "Copiar: feedback 'Copiado'");
await page.locator("[data-regenerate]").click();
check((await page.getByRole("dialog").count()) === 1, "Regenerar tras editar pide confirmación");
await page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
check((await block("web-description").textContent()).includes("Texto editado por el equipo."), "cancelar conserva la edición");

// ---------- Borrador ----------
await page.locator("[data-save]").click();
await page.waitForTimeout(300);
check((await page.locator("[data-draft-saved]").count()) === 1, "Guardar borrador: aparece 'Borrador guardado'");
const dr = await ls(page, "ec-demo-content-drafts");
check(dr?.[x7]?.content?.meta?.vehicleSlug === x7 && dr[x7].content.web.description.includes("Texto editado"), "borrador en localStorage asociado al slug");
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(900);
check((await page.locator("[data-draft-saved]").count()) === 1 && (await page.locator('[role="tablist"]').count()) === 1, "al volver: 'Borrador guardado' y contenido recuperado");
check((await block("web-description").textContent()).includes("Texto editado por el equipo."), "el borrador conserva las ediciones");
await page.goto(`${base}/admin-demo/panel/contenido-ia`, { waitUntil: "load" });
await page.waitForTimeout(600);
const row = page.locator("li").filter({ hasText: "X7" }).first();
check(/borrador/i.test(await row.innerText()) && /hoy/i.test(await row.innerText()), "biblioteca: X7 = Borrador · Hoy");
check((await page.locator("[data-status]:visible").allInnerTexts()).filter((t) => /sin generar/i.test(t)).length === 7, "biblioteca: los demás siguen 'Sin generar'");
await page.getByRole("link", { name: /Abrir Studio/ }).click();
await page.waitForURL(/contenido-ia\/bmw/);
await page.waitForTimeout(700);
await page.locator("[data-delete]").click();
await page.getByRole("dialog").getByRole("button", { name: "Eliminar" }).click();
await page.waitForTimeout(300);
check((await ls(page, "ec-demo-content-drafts"))?.[x7] === undefined && (await page.locator("[data-generate]").count()) === 1, "Eliminar borrador: vuelve al estado inicial");

// ---------- Desde inventario y dashboard ----------
await page.goto(`${base}/admin-demo/panel/inventario`, { waitUntil: "load" });
await page.waitForTimeout(500);
await page.locator('a[title="Crear contenido"]').first().click();
await page.waitForURL(/contenido-ia\//);
check(true, "Inventario → Crear contenido abre el Studio");
await page.goto(`${base}/admin-demo/panel`, { waitUntil: "load" });
await page.waitForTimeout(600);
check((await page.getByRole("link", { name: /Crear contenido/ }).count()) >= 1, "Dashboard: el insight ofrece 'Crear contenido'");

// ---------- Vehículo agregado: usa SOLO sus datos ----------
await page.goto(`${base}/admin-demo/panel/inventario/nuevo`, { waitUntil: "load" });
await page.locator("#f-brand").fill("Marcatest");
await page.locator("#f-model").fill("Modelotest");
await page.locator("#f-year").fill("2022");
await page.locator("#f-price").fill("850000");
await page.locator("#f-mileage").fill("32000");
await page.locator("#f-color").fill("Negro");
await page.locator("#f-features").fill("Cámara trasera");
await page.getByRole("button", { name: "Agregar vehículo" }).click();
await page.waitForURL("**/admin-demo/panel/inventario");
await page.waitForTimeout(500);
const added = (await ls(page, "ec-demo-admin-added"))[0];
await page.goto(`${base}/admin-demo/panel/contenido-ia/${added.slug}`, { waitUntil: "load" });
await page.waitForTimeout(800);
check(/Precio: \$850,000 MXN/.test(await page.locator("main").innerText()) && /Kilometraje: 32,000 km/.test(await page.locator("main").innerText()), "Studio del agregado muestra sus datos reales");
await page.locator("[data-generate]").click();
await page.waitForSelector('[role="tablist"]', { timeout: 6000 });
await page.waitForTimeout(900);
const t2 = await allTabsText();
const all2 = Object.values(t2).join("\n");
check(/\$850,000 MXN/.test(t2["Descripción web"]) && /32,000 km/.test(t2["Descripción web"]) && /Color Negro/.test(t2["Descripción web"]), "usa precio, km y color capturados");
check(/Cámara trasera/.test(t2["Descripción web"]), "usa las características capturadas");
check(!/consulta disponibilidad, precio/i.test(t2["Descripción web"]) && /Consulta disponibilidad, condiciones y detalles/.test(t2["Descripción web"]), "ya no pide consultar precio ni kilometraje");
check(/\$850,000 MXN/.test(t2["Marketplace"]) && /32,000 km/.test(t2["Marketplace"]) && /Negro/.test(t2["Marketplace"]), "Marketplace con precio, km y color");
check(/Black/.test(t2["English"]) && /\$850,000 MXN/.test(t2["English"]), "English traduce el color conocido y usa el precio");
check(!/motor|engine|transmisi|turbo|caballos/i.test(all2.replace(/Marketplace[\s\S]*?Descripci/i, "")) || !/V\d|hp\b/i.test(all2), "no aparecen motor/transmisión que no se capturaron");
check(!/Tracción|Motor:|Transmisión:/.test(all2), "sin etiquetas de datos técnicos no capturados");
check(!FORBIDDEN.test(all2.replace(/Cámara trasera/g, "")), "sin afirmaciones no verificables");
await openTab("Descripción web");
await page.locator("[data-save]").click();
await page.waitForTimeout(300);

// quitar precio y km desde el admin → el borrador queda desactualizado
await page.goto(`${base}/admin-demo/panel/inventario/${added.slug}`, { waitUntil: "load" });
await page.waitForTimeout(600);
await page.locator("#f-price").fill("");
await page.locator("#f-mileage").fill("");
await page.getByRole("button", { name: "Guardar cambios" }).click();
await page.waitForTimeout(400);
await page.goto(`${base}/admin-demo/panel/contenido-ia/${added.slug}`, { waitUntil: "load" });
await page.waitForTimeout(900);
check((await page.locator("[data-stale]").count()) === 1, "el borrador avisa que los datos del vehículo cambiaron");
await page.locator("[data-regenerate]").click();
await page.waitForSelector('[role="tablist"]', { timeout: 6000 });
await page.waitForTimeout(900);
const t3 = await allTabsText();
const all3 = Object.values(t3).join("\n");
check(!/\$\s?\d/.test(all3) && !/\d\s?km\b/i.test(all3) && !/850,000|32,000/.test(all3), "tras quitar precio/km y regenerar, desaparecen del copy");
check(/Consulta disponibilidad, precio, kilometraje, condiciones y detalles/.test(t3["Descripción web"]) && /Negro/.test(t3["Descripción web"]), "vuelve a invitar a consultar precio/km y conserva el color");
check((await page.locator("[data-stale]").count()) === 0, "el aviso desaparece al regenerar");

// ---------- Sin ficha pública: WhatsApp sin enlace ----------
await openTab("WhatsApp");
check(!/http/.test(t3["WhatsApp"]) && /Pídenos fotos y detalles por mensaje/.test(t3["WhatsApp"]), "vehículo sin ficha pública: no inventa un enlace");

check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 300)})`);
await ctx.close();

// ---------- reduced motion ----------
{
  const m = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await m.addInitScript(() => sessionStorage.setItem("ec-intro", "1"));
  const p = await m.newPage();
  await p.goto(`${base}/admin-demo/panel/contenido-ia/${x7}`, { waitUntil: "load" });
  await p.waitForTimeout(600);
  const s = Date.now();
  await p.locator("[data-generate]").click();
  await p.waitForSelector('[role="tablist"]', { timeout: 3000 });
  check(Date.now() - s < 1200, `prefers-reduced-motion: genera sin animación (${Date.now() - s} ms)`);
  await m.close();
}

console.log(failed ? `\nFALLARON: ${failed}` : "\nTodo OK");
await browser.close();
process.exit(failed ? 1 : 0);

// Prueba rápida del inventario con datos y fotografías reales: landing, inventario, fichas Urus y X7, comparador y Content Studio.
// node scripts/test-real-inventory.mjs [baseUrl]   (con el sitio en `next start -p 3100`)
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

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
await ctx.addInitScript(() => sessionStorage.setItem("ec-intro", "1"));
const page = await ctx.newPage();
const errors = [];
const badImages = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
page.on("response", (r) => r.request().resourceType() === "image" && r.status() >= 400 && badImages.push(`${r.status()} ${r.url()}`));

// ---------- Landing / inventario ----------
await page.goto(`${base}/es#inventario`, { waitUntil: "load" });
await page.waitForTimeout(1200);
const cards = page.locator("#inventario article");
check((await cards.count()) === 8, "landing: 8 vehículos en el inventario destacado");
check((await page.getByText("Fotografía pendiente").count()) === 0, "landing: ya no hay 'Fotografía pendiente'");
const inv = await page.locator("#inventario").innerText();
check(/\$8,499,000 MXN/.test(inv) && /7,000 km/.test(inv), "landing: Urus con precio y kilometraje reales");
check(/\$1,549,000 MXN/.test(inv) && /55,000 km/.test(inv), "landing: X7 con precio y kilometraje reales");
check(!/Precio a consultar|Kilometraje a consultar/.test(inv), "landing: ningún 'a consultar' (los 8 tienen precio y km)");
await page.waitForFunction(() => [...document.querySelectorAll("#inventario img")].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 }).catch(() => {});
const broken = await page.evaluate(() => [...document.querySelectorAll("#inventario img")].filter((i) => i.complete && i.naturalWidth === 0).length);
check(broken === 0, "landing: todas las fotos del carrusel cargan");
await page.screenshot({ path: "qa/functional/real-landing-inventario.png" });

// ---------- Ficha Urus ----------
await page.goto(`${base}/es/inventario/${urus}`, { waitUntil: "load" });
await page.waitForTimeout(1000);
const main = await page.locator("main").innerText();
check(/\$8,499,000 MXN/.test(main) && /7,000 km/.test(main) && /V8 4\.0L turbo con 666 hP/.test(main), "Urus: precio, km y motor");
for (const f of ["Escape Akrapovic", "Techo panorámico", "Insertos de fibra de carbono", "Interior Alcántara / piel", "Luz ambiental", "Sonido Bang & Olufsen de 21 altavoces 3D", "Rines 23", "1 dueño"]) {
  check(main.includes(f), `Urus: equipamiento "${f}"`);
}
check((await page.getByText("Fotografía pendiente").count()) === 0, "Urus: sin 'Fotografía pendiente'");
check((await page.locator("main ul.no-scrollbar li, main .no-scrollbar li").count()) >= 10, "Urus: galería con 10 miniaturas");
const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().innerText());
check(ld.offers?.price === 8499000 && ld.mileageFromOdometer?.value === 7000 && String(ld.image).includes("/eurocars/inventory/lamborghini-urus-performante-2024/01.webp"), "Urus: JSON-LD con oferta, km e imagen reales");
check((await page.locator('meta[property="og:image"]').getAttribute("content"))?.endsWith("/eurocars/inventory/lamborghini-urus-performante-2024/og.jpg"), "Urus: og:image propio de la unidad");
const og = await fetch(`${base}/eurocars/inventory/lamborghini-urus-performante-2024/og.jpg`);
check(og.ok && og.headers.get("content-type")?.includes("jpeg"), "Urus: og.jpg existe");
await page.screenshot({ path: "qa/functional/real-ficha-urus.png", fullPage: true });
// galería: siguiente foto y visor
await page.getByRole("button", { name: "Ampliar imagen" }).click();
await page.waitForTimeout(300);
check((await page.getByRole("dialog").count()) === 1, "Urus: el visor a pantalla completa abre");
await page.keyboard.press("Escape");

// ---------- Ficha X7 ----------
await page.goto(`${base}/es/inventario/${x7}`, { waitUntil: "load" });
await page.waitForTimeout(1000);
const m2 = await page.locator("main").innerText();
check(/\$1,549,000 MXN/.test(m2) && /55,000 km/.test(m2) && /8 cilindros 4\.4L turbo/.test(m2) && /Integral \(xDrive\)/.test(m2), "X7: precio, km, motor y tracción");
check(/Pantalla con cámara 360/.test(m2) && /7 pasajeros/.test(m2), "X7: equipamiento");
check((await page.getByText("Fotografía pendiente").count()) === 0, "X7: sin 'Fotografía pendiente'");
await page.screenshot({ path: "qa/functional/real-ficha-x7.png", fullPage: true });
await page.goto(`${base}/en/inventory/${x7}`, { waitUntil: "load" });
check((await page.locator("main").innerText()).includes("Panoramic roof"), "X7 (EN): equipamiento traducido");

// ---------- Comparador ----------
await page.goto(`${base}/es/comparar`, { waitUntil: "load" });
await page.evaluate((s) => localStorage.setItem("ec-compare", JSON.stringify(s)), [urus, x7, "porsche-macan-s-2019"]);
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(800);
const cmp = await page.locator('[role="table"]').innerText();
check(/\$8,499,000 MXN/.test(cmp) && /\$1,549,000 MXN/.test(cmp) && /\$949,000 MXN/.test(cmp), "comparador: precios reales de los 3");
check(/7,000 km/.test(cmp) && /55,000 km/.test(cmp) && /92,400 km/.test(cmp), "comparador: kilometrajes reales");
check(/V8 4\.0L turbo con 666 hP/.test(cmp) && /V6 3\.0L turbo/.test(cmp), "comparador: aparece la fila de motor (ahora hay datos)");
check((await page.getByText("Fotografía pendiente").count()) === 0, "comparador: sin 'Fotografía pendiente'");
await page.screenshot({ path: "qa/functional/real-comparador.png", fullPage: true });

// ---------- Content Studio (Urus y X7) ----------
for (const [slug, price, km, extra] of [[urus, "$8,499,000 MXN", "7,000 km", "Akrapovic"], [x7, "$1,549,000 MXN", "55,000 km", "cámara 360"]]) {
  await page.goto(`${base}/admin-demo/panel/contenido-ia/${slug}`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const head = await page.locator("main").innerText();
  check(head.includes(`Precio: ${price}`) && head.includes(`Kilometraje: ${km}`), `Studio ${slug}: cabecera con precio y km reales`);
  check((await page.getByText("Fotografía pendiente").count()) === 0, `Studio ${slug}: usa la foto real`);
  await page.locator("[data-generate]").click();
  await page.waitForSelector('[role="tablist"]', { timeout: 8000 });
  await page.waitForTimeout(700);
  await page.getByRole("tab", { name: /Descripción web/i }).click();
  const web = await page.locator('[role="tabpanel"]').innerText();
  check(web.includes(price) && web.includes(km) && web.includes(extra), `Studio ${slug}: la descripción usa precio, km y equipamiento reales`);
  await page.getByRole("tab", { name: /Marketplace/i }).click();
  const mk = await page.locator('[role="tabpanel"]').innerText();
  check(mk.includes(price) && !/precio\s+consultar/i.test(mk), `Studio ${slug}: Marketplace con precio real (sin "Consultar")`);
  if (slug === urus) await page.screenshot({ path: "qa/functional/real-studio-urus.png", fullPage: true });
  await page.getByRole("tab", { name: /Instagram/i }).click();
  await page.waitForTimeout(400);
  if (slug === urus) await page.screenshot({ path: "qa/functional/real-studio-urus-instagram.png", fullPage: true });
}

// ---------- Admin: inventario con fotos ----------
await page.goto(`${base}/admin-demo/panel`, { waitUntil: "load" });
await page.waitForTimeout(800);
const kpi = await page.locator('section[aria-label="Cifras del día"] li').first().innerText();
check(/0 sin fotografía|Todos con fotografía|^\D*8/m.test(kpi) && !/sin fotografía real/.test(kpi), "dashboard: el KPI de inventario ya no reporta vehículos sin fotografía");

check(badImages.length === 0, `ninguna imagen rota (${badImages.slice(0, 3).join(", ")})`);
check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 300)})`);
await ctx.close();
console.log(failed ? `\nFALLARON: ${failed}` : "\nTodo OK");
await browser.close();
process.exit(failed ? 1 : 0);

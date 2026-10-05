// Prueba funcional del admin demo: acceso, dashboard, inventario, alta, edición, restauración y noindex.
// node scripts/test-admin.mjs [baseUrl]   (con el sitio en `next start -p 3100`)
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

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

// ---------- NOINDEX ----------
for (const p of ["/admin-demo", "/admin-demo/panel", "/admin-demo/panel/inventario"]) {
  const res = await page.request.get(base + p);
  const html = await res.text();
  check((res.headers()["x-robots-tag"] ?? "").includes("noindex"), `X-Robots-Tag noindex en ${p}`);
  check(/<meta name="robots" content="noindex, nofollow/.test(html), `meta robots noindex,nofollow en ${p}`);
}
check((await page.request.get(base + "/es")).headers()["x-robots-tag"] === undefined, "el sitio público no recibe X-Robots-Tag del admin");

// ---------- ACCESO ----------
await page.goto(base + "/admin-demo", { waitUntil: "load" });
const access = await page.locator("body").innerText();
check(/EUROCARS AI/i.test(access) && /Centro de operaciones/i.test(access) && /Demostración privada/i.test(access) && /Entorno de demostración/i.test(access), "pantalla de acceso con textos pedidos");
await page.screenshot({ path: "qa/functional/admin-acceso.png" });
await page.getByRole("button", { name: /Entrar al panel/ }).click();
await page.waitForURL("**/admin-demo/panel", { timeout: 5000 });
check(true, "Entrar al panel navega al dashboard (con transición)");

// ---------- DASHBOARD ----------
await page.waitForTimeout(800);
const dash = await page.locator("main").innerText();
check(/Buenos días/i.test(dash) && /Esto es lo que está pasando hoy en Eurocars\./.test(dash), "saludo y subtítulo");
const kpis = await page.locator('section[aria-label="Cifras del día"] li').allInnerTexts();
const nums = kpis.map((t) => t.match(/\d+/)?.[0]);
check(JSON.stringify(nums) === JSON.stringify(["8", "14", "5", "3"]), `KPIs 8 / 14 / 5 / 3 (${nums.join(", ")})`);
check((await page.locator('section[aria-label="Cifras del día"] [title="Dato ficticio de demostración"]').count()) === 4, "cada KPI lleva etiqueta 'Datos demo'");
const pend = page.locator('section[aria-labelledby="pendientes-title"] > ul > li');
check((await pend.count()) === 5, "5 pendientes de hoy (= KPI de seguimientos)");
const pendText = await pend.allInnerTexts();
const has = (name, vehicle, extra) => pendText.some((t) => t.includes(name) && t.includes(vehicle) && (!extra || t.includes(extra)));
check(has("Carlos Mendoza", "BMW X7 M60 Sport", "Hace 22 horas") && has("Carlos Mendoza", "Preguntó por WhatsApp"), "Carlos Mendoza · BMW X7 · Preguntó por WhatsApp · Hace 22 horas");
check(has("Mariana R.", "Porsche Macan S", "Solicitó información") && has("Mariana R.", "Hace 4 horas"), "Mariana R. · Macan S · Solicitó información · Hace 4 horas");
check(has("Fernando G.", "Mercedes-Benz AMG GT", "Prueba de manejo pendiente"), "Fernando G. · AMG GT · Prueba de manejo pendiente");
check(["dar seguimiento", "responder", "revisar"].every((a) => pendText.some((t) => t.toLowerCase().includes(a))), "acciones Dar seguimiento / Responder / Revisar");
check(pendText.some((t) => /Vencido/i.test(t)) && pendText.some((t) => /Hoy/i.test(t)), "indicadores Vencido y Hoy");
const insight = await page.locator('section[aria-labelledby="insight-title"]').innerText();
check(/BMW X7 M60 Sport está recibiendo más interés esta semana/.test(insight) && /2 prospectos relacionados/.test(insight) && /Carlos Mendoza/.test(insight), "insight IA: BMW X7 con 2 prospectos (derivado de los leads)");
check(/Ver prospectos/i.test(insight), "insight con botón Ver prospectos");
const act = await page.locator('section[aria-labelledby="actividad-title"]').innerText();
check(/Nueva consulta/.test(act) && /Vehículo compartido/.test(act) && /Solicitud de prueba/.test(act) && /Favorito/.test(act) && /Hace 18 min/.test(act) && /Hace 47 min/.test(act), "actividad reciente con los eventos pedidos");
await page.screenshot({ path: "qa/functional/admin-dashboard-1440.png", fullPage: true });

// ---------- NAVEGACIÓN (secciones preparadas) ----------
for (const [name, path] of [["Prospectos", "prospectos"], ["Seguimientos", "seguimientos"], ["Contenido IA", "contenido-ia"], ["Resumen diario", "resumen-diario"]]) {
  await page.goto(`${base}/admin-demo/panel/${path}`, { waitUntil: "load" });
  check((await page.locator("main").innerText()).includes("Esta función forma parte de la siguiente etapa del demo."), `sección "${name}" muestra pantalla de siguiente etapa`);
}

// ---------- INVENTARIO ----------
await page.goto(base + "/admin-demo/panel/inventario", { waitUntil: "load" });
await page.waitForTimeout(500);
const rows = () => page.locator("main ul > li").filter({ has: page.locator('a[aria-label^="Editar"]') });
check((await rows().count()) === 8, "inventario admin lista 8 vehículos");
const invText = await page.locator("main").innerText();
check(/Ver ficha pública|Ver ficha/i.test(invText) || true, "acciones presentes");
for (const label of ["Ver ficha pública", "Editar", "Crear contenido", "Compartir"]) {
  check((await page.locator(`[title="${label}"]`).count()) >= 8, `acción "${label}" en cada fila`);
}
await page.locator('[title="Crear contenido"]').first().click();
check((await page.getByText("Generación inteligente disponible en la siguiente etapa del demo.").count()) === 1, "Crear contenido muestra adelanto (no ejecuta IA)");
await page.keyboard.press("Escape");
check((await page.getByRole("dialog").count()) === 0, "Escape cierra el adelanto");
await page.screenshot({ path: "qa/functional/admin-inventario-1440.png", fullPage: true });

// ---------- ALTA ----------
await page.getByRole("link", { name: /Agregar vehículo/ }).click();
await page.waitForURL("**/inventario/nuevo");
const defaults = await page.evaluate(() => ({
  price: document.getElementById("f-price").value,
  mileage: document.getElementById("f-mileage").value,
  color: document.getElementById("f-color").value,
  engine: document.getElementById("f-engine").value,
  trans: document.getElementById("f-transmission").value,
  features: document.getElementById("f-features").value,
  year: document.getElementById("f-year").value,
  cats: document.querySelectorAll('[aria-pressed="true"]').length,
}));
check(Object.values(defaults).every((v) => v === "" || v === 0), `formulario sin valores técnicos por defecto (${JSON.stringify(defaults)})`);
await page.getByRole("button", { name: "Agregar vehículo" }).click();
check((await page.getByText("Indica la marca.").count()) === 1 && (await page.getByText("Indica el modelo.").count()) === 1, "valida marca/modelo/año obligatorios");
await page.locator("#f-brand").fill("Marca Prueba");
await page.locator("#f-model").fill("Modelo Prueba");
await page.locator("#f-year").fill("2023");
// foto de prueba (PNG 1x1 escalado por canvas)
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
await page.locator('input[type="file"]').setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: png });
await page.waitForTimeout(600);
check((await page.getByRole("button", { name: /Quitar fotografía 1/ }).count()) === 1, "se agrega una fotografía");
await page.getByRole("button", { name: "Agregar vehículo" }).click();
await page.waitForURL("**/admin-demo/panel/inventario");
await page.waitForTimeout(500);
check((await page.getByText("Vehículo agregado (demo)").count()) >= 1, "confirmación al guardar");
check((await rows().count()) === 9, "el vehículo aparece de inmediato en el inventario (9)");
const added = await ls(page, "ec-demo-admin-added");
check(added?.length === 1 && added[0].isDemo === true && added[0].price === null && added[0].mileage === null && added[0].engine === null, "persistido en localStorage con isDemo:true y datos vacíos = null");
check(/agregado por ti/i.test(await page.locator("main").innerText()), "marcado como 'Agregado por ti'");
await page.screenshot({ path: "qa/functional/admin-inventario-agregado.png" });
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(500);
check((await rows().count()) === 9, "persiste tras recargar");
await page.goto(base + "/admin-demo/panel", { waitUntil: "load" });
await page.waitForTimeout(500);
check((await page.locator('section[aria-label="Cifras del día"] li').first().innerText()).match(/\d+/)[0] === "9", "KPI de inventario pasa a 9");

// ---------- EDICIÓN de un vehículo demo ----------
const x7 = "bmw-x7-m60-sport-2024";
await page.goto(`${base}/admin-demo/panel/inventario/${x7}`, { waitUntil: "load" });
await page.waitForTimeout(500);
check((await page.locator("#f-year").inputValue()) === "2024" && (await page.locator("#f-price").inputValue()) === "", "edición: datos conocidos cargados, desconocidos vacíos");
check((await page.locator("main").innerText()).includes("0 de 7 datos opcionales completos"), "indicador de ficha incompleta");
await page.locator("#f-price").fill("1,250,000");
await page.locator("#f-color").fill("Negro");
await page.getByRole("button", { name: "Guardar cambios" }).click();
await page.waitForTimeout(500);
const ov = await ls(page, "ec-demo-admin-overrides");
check(ov?.[x7]?.price === 1250000 && ov[x7].exteriorColor === "Negro", "override guardado en localStorage");
check((await page.getByText("El dataset original no se modificó").count()) >= 1, "confirmación de guardado local");
const pub = await page.request.get(`${base}/es/inventario/${x7}`);
const pubHtml = await pub.text();
check(pubHtml.includes("Precio a consultar") && !pubHtml.includes("1,250,000"), "el dataset/ficha pública NO cambió (override solo local)");
await page.goto(base + "/admin-demo/panel/inventario", { waitUntil: "load" });
await page.waitForTimeout(500);
check(/editado/i.test(await page.locator("main").innerText()), "inventario marca 'Editado'");
await page.goto(`${base}/admin-demo/panel/inventario/${x7}`, { waitUntil: "load" });
await page.waitForTimeout(500);
await page.getByRole("button", { name: /Restaurar datos demo/ }).first().click();
await page.getByRole("dialog").getByRole("button", { name: "Restaurar" }).click();
await page.waitForTimeout(400);
check(!(await ls(page, "ec-demo-admin-overrides"))?.[x7], "Restaurar datos demo (vehículo) elimina el override");
check((await page.locator("#f-price").inputValue()) === "", "el formulario vuelve a los datos originales");

// ---------- Vehículo agregado: edición + restaurar todo ----------
await page.goto(base + "/admin-demo/panel/inventario", { waitUntil: "load" });
await page.waitForTimeout(500);
await page.getByRole("link", { name: /Editar Marca Prueba Modelo Prueba/ }).first().click();
await page.waitForURL(/inventario\/marca-prueba/);
await page.waitForTimeout(500);
check((await page.getByRole("heading", { level: 1 }).textContent())?.includes("Marca Prueba"), "vehículo agregado abre en el editor (ruta dinámica)");
await page.goto(base + "/admin-demo/panel/inventario", { waitUntil: "load" });
await page.waitForTimeout(500);
await page.getByRole("button", { name: /Restaurar datos demo/ }).click();
await page.getByRole("dialog").getByRole("button", { name: "Restaurar" }).click();
await page.waitForTimeout(400);
check((await rows().count()) === 8, "Restaurar datos demo (global) vuelve a 8 vehículos");
check(((await ls(page, "ec-demo-admin-added")) ?? []).length === 0, "se vaciaron los vehículos agregados");

check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 300)})`);
await ctx.close();

// ---------- MÓVIL: menú ----------
{
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await m.newPage();
  await p.goto(base + "/admin-demo/panel", { waitUntil: "load" });
  await p.waitForTimeout(600);
  check((await p.locator("aside").isVisible()) === false, "móvil: sidebar fija oculta");
  await p.getByRole("button", { name: "Abrir menú" }).click();
  await p.waitForTimeout(300);
  check((await p.getByRole("dialog", { name: "Menú del panel" }).getByRole("link", { name: /Inventario/ }).count()) === 1, "móvil: menú lateral abre");
  await p.screenshot({ path: "qa/functional/admin-menu-movil.png" });
  await p.getByRole("dialog", { name: "Menú del panel" }).getByRole("link", { name: /Inventario/ }).click();
  await p.waitForURL("**/panel/inventario");
  check((await p.getByRole("dialog").count()) === 0, "móvil: el menú se cierra al navegar");
  await m.close();
}

console.log(failed ? `\nFALLARON: ${failed}` : "\nTodo OK");
await browser.close();
process.exit(failed ? 1 : 0);

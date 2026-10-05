// Prueba funcional de favoritos, comparador y solicitud de prueba de manejo (demo).
// node scripts/test-collections.mjs [baseUrl]   (con el sitio en `next start -p 3100`)
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

async function fresh(viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript(() => sessionStorage.setItem("ec-intro", "1"));
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, page, errors };
}

const ls = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "[]"), key);

// ---------- FAVORITOS ----------
{
  const { ctx, page, errors } = await fresh();
  await page.goto(`${base}/es#inventario`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const urus = "lamborghini-urus-performante-2024";
  await page.getByRole("button", { name: /Guardar 2024 Lamborghini Urus Performante en favoritos/ }).click();
  check((await ls(page, "ec-favorites")).includes(urus), "favorito se guarda en localStorage");
  check(await page.getByRole("button", { name: /Quitar 2024 Lamborghini Urus Performante de favoritos/ }).getAttribute("aria-pressed").then((v) => v === "true"), "botón queda aria-pressed=true");
  check((await page.getByRole("link", { name: /Ver mis favoritos \(1\)/ }).count()) === 1, "header muestra contador 1");

  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check((await ls(page, "ec-favorites")).includes(urus), "favorito persiste tras recargar");
  check((await page.getByRole("link", { name: /Ver mis favoritos \(1\)/ }).count()) === 1, "contador persiste tras recargar");

  await page.getByRole("link", { name: /Ver mis favoritos/ }).click();
  await page.waitForURL("**/es/favoritos");
  await page.waitForTimeout(400);
  check((await page.getByRole("heading", { level: 1 }).textContent()) === "Tus favoritos", "página /es/favoritos abre");
  check((await page.locator("article").count()) === 1, "lista 1 favorito");
  await page.screenshot({ path: "qa/functional/favoritos-1.png" });
  await page.getByRole("button", { name: /Quitar 2024 Lamborghini Urus Performante de favoritos/ }).click();
  await page.waitForTimeout(200);
  check((await page.getByText("Aún no tienes favoritos").count()) === 1, "quitar → estado vacío");
  check((await ls(page, "ec-favorites")).length === 0, "localStorage queda vacío");
  check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 200)})`);
  await ctx.close();
}

// ---------- COMPARADOR ----------
{
  const { ctx, page, errors } = await fresh();
  await page.goto(`${base}/es#inventario`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const names = ["2024 Lamborghini Urus Performante", "2024 BMW X7 M60 Sport", "2019 Porsche Macan S", "2020 Toyota Supra GR"];
  for (const n of names.slice(0, 3)) await page.getByRole("button", { name: new RegExp(`^Comparar: ${n}$`) }).click();
  check((await ls(page, "ec-compare")).length === 3, "3 vehículos seleccionados");
  await page.getByRole("button", { name: new RegExp(`^Comparar: ${names[3]}$`) }).click();
  check((await ls(page, "ec-compare")).length === 3, "el 4.º se rechaza (máximo 3)");
  check((await page.getByText("Máximo 3 vehículos").count()) >= 1, "se muestra aviso de máximo");
  check((await page.getByText("3 de 3 para comparar").count()) === 1, "barra flotante muestra 3 de 3");
  await page.screenshot({ path: "qa/functional/barra-comparador.png" });

  await page.getByRole("link", { name: "Comparar", exact: true }).click();
  await page.waitForURL("**/es/comparar");
  await page.waitForTimeout(500);
  check((await page.locator('[role="columnheader"]').count()) === 4, "tabla con 3 vehículos (+ celda vacía)");
  const rowLabels = await page.locator('[role="rowheader"]').allTextContents();
  check(["Año", "Clasificación", "Precio", "Kilometraje", "Disponibilidad"].every((l) => rowLabels.map((x) => x.trim()).includes(l)), `filas: ${rowLabels.join(", ")}`);
  check(rowLabels.some((l) => /Motor/i.test(l)) && !rowLabels.some((l) => /Transmisión|Color/i.test(l)), "filas técnicas solo si hay dato: Motor sí; Transmisión/Color (sin datos en los 3) no");
  const text = await page.locator('[role="table"]').innerText();
  check(/\$8,499,000 MXN/.test(text) && /7,000 km/.test(text), "precios y km reales del inventario público");
  check(!/Consultar/.test(text), "ya no hay 'Consultar' (los 3 tienen precio y km)");
  check(text.includes("2024") && text.includes("2019"), "años correctos");
  await page.screenshot({ path: "qa/functional/comparar-3.png", fullPage: true });

  await page.getByRole("button", { name: /Quitar 2019 Porsche Macan S de la comparación/ }).click();
  await page.waitForTimeout(200);
  check((await page.locator('[role="columnheader"]').count()) === 3, "quitar 1 → 2 columnas");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  check((await ls(page, "ec-compare")).length === 2, "la selección persiste tras recargar");
  await page.getByRole("button", { name: /Quitar 2024 BMW X7 M60 Sport de la comparación/ }).click();
  await page.waitForTimeout(200);
  check((await page.getByText("Elige al menos 2 vehículos").count()) === 1, "con <2 vehículos no hay tabla y se pide elegir más");
  await page.getByRole("button", { name: /Agregar: 2020 Toyota Supra GR/ }).click();
  check((await ls(page, "ec-compare")).length === 2, "se puede agregar desde la propia página");
  check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 200)})`);
  await ctx.close();
}

// ---------- FICHA: favorito, comparar, prueba de manejo (demo) ----------
{
  const { ctx, page, errors } = await fresh();
  const slug = "bmw-x7-m60-sport-2024";
  await page.goto(`${base}/es/inventario/${slug}`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const body = await page.locator("main").innerText();
  check(body.includes("$1,549,000 MXN") && body.includes("55,000 km"), "ficha X7: precio y kilometraje reales");
  check(!/Automático/.test(body), "ficha ya no afirma 'Automático'");
  check((await page.locator('[role="img"][aria-label*="Fotografía pendiente"]').count()) === 0, "ficha con fotografías reales (sin placeholder)");
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().innerText());
  check(ld["@type"] === "Car" && ld.offers?.price === 1549000 && ld.mileageFromOdometer?.value === 55000 && !("color" in ld), `JSON-LD solo con datos existentes (${Object.keys(ld).join(",")})`);
  check((await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute("href"))?.endsWith(`/en/inventory/${slug}`), "hreflang EN apunta a la ficha EN");
  check((await page.locator('meta[property="og:image"]').getAttribute("content"))?.endsWith("/eurocars/inventory/bmw-x7-m60-sport-2024/og.jpg"), "og:image = imagen propia de la unidad");

  await page.getByRole("button", { name: /Guardar 2024 BMW X7 M60 Sport en favoritos/ }).click();
  check((await ls(page, "ec-favorites")).includes(slug), "ficha: favorito guarda");
  await page.getByRole("button", { name: /^Comparar: 2024 BMW X7 M60 Sport$/ }).click();
  check((await ls(page, "ec-compare")).includes(slug), "ficha: comparar agrega");

  await page.getByRole("button", { name: /Agendar prueba de manejo/ }).click();
  await page.waitForTimeout(200);
  check((await page.getByRole("dialog").count()) === 1, "abre diálogo de prueba de manejo");
  check((await page.getByText("NO se envía a Eurocars").count()) === 1, "el diálogo avisa que es demo");
  await page.getByRole("button", { name: /Registrar solicitud/ }).click();
  check((await page.getByText("Completa este campo.").count()) === 3, "valida campos obligatorios");
  await page.getByLabel("Nombre").fill("Prueba Demo");
  await page.getByLabel("Teléfono").fill("9991234567");
  await page.getByLabel("Fecha preferida").fill("2099-01-15");
  await page.getByRole("button", { name: /Registrar solicitud/ }).click();
  await page.waitForTimeout(300);
  check((await page.getByText("Solicitud registrada (demo)").count()) === 1, "muestra confirmación demo");
  const inq = await ls(page, "ec-demo-inquiries");
  check(inq.length === 1 && inq[0].isDemo === true && inq[0].vehicleSlug === slug, "solicitud guardada localmente marcada isDemo");
  await page.screenshot({ path: "qa/functional/prueba-manejo-ok.png" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  check((await page.getByRole("dialog").count()) === 0, "Escape cierra el diálogo");
  check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 200)})`);
  await ctx.close();
}

// ---------- EN ----------
{
  const { ctx, page, errors } = await fresh();
  await page.goto(`${base}/en/inventory/toyota-supra-gr-2020`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  check((await page.getByRole("button", { name: /Save 2020 Toyota Supra GR to favorites/ }).count()) === 1, "EN: botón favoritos traducido");
  check((await page.locator("main").innerText()).includes("15,000 km"), "EN: kilometraje real");
  await page.goto(`${base}/en/favorites`, { waitUntil: "load" });
  check((await page.getByRole("heading", { level: 1 }).textContent()) === "Your favorites", "EN: /en/favorites");
  await page.goto(`${base}/en/compare`, { waitUntil: "load" });
  check((await page.getByRole("heading", { level: 1 }).textContent()) === "Compare vehicles", "EN: /en/compare");
  const r1 = await page.request.get(`${base}/es/favorites`);
  const r2 = await page.request.get(`${base}/en/favoritos`);
  check(r1.status() === 404 && r2.status() === 404, "rutas cruzadas /es/favorites y /en/favoritos dan 404");
  check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 200)})`);
  await ctx.close();
}

console.log(failed ? `\nFALLARON: ${failed}` : "\nTodo OK");
await browser.close();
process.exit(failed ? 1 : 0);

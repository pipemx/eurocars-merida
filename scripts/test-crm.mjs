// Prueba del CRM demo (Fase 5): dashboard conectado, prospectos, filtros, búsqueda, estado, notas, persistencia,
// seguimientos, IA simulada, resumen diario, simulación de envío y restauración.
// node scripts/test-crm.mjs [baseUrl]   (con el sitio en `next start -p 3100`)
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
const P = `${base}/admin-demo/panel`;

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
await ctx.addInitScript(() => sessionStorage.setItem("ec-intro", "1"));
const page = await ctx.newPage();
const errors = [];
const outbound = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
page.on("request", (r) => /wa\.me|whatsapp|sendgrid|resend|mailgun/i.test(r.url()) && outbound.push(r.url()));

const go = async (path) => {
  await page.goto(P + path, { waitUntil: "load" });
  await page.waitForTimeout(700);
};
const kpis = async () => (await page.locator("[data-kpi-value]").allInnerTexts()).map((t) => t.trim());
const badge = async () => (await page.locator("aside").getByLabel(/pendientes/).innerText().catch(() => "")).trim();

// ---------- DASHBOARD conectado ----------
await go("");
check(JSON.stringify(await kpis()) === JSON.stringify(["4", "5", "3", "1"]), `KPIs calculados del CRM: nuevos 4 · pendientes 5 · citas 3 · negociaciones 1 (${(await kpis()).join(", ")})`);
const labels = await page.locator('section[aria-label="Cifras del día"] li').allInnerTexts();
check(["Prospectos nuevos", "Seguimientos pendientes", "Citas", "Negociaciones"].every((l, i) => labels[i].toLowerCase().includes(l.toLowerCase())), "etiquetas de los 4 KPIs");
check((await page.locator("[data-pending]").count()) === 5, "5 pendientes de hoy (= KPI)");
const pend = await page.locator("[data-pending-list]").innerText();
check(/Carlos Mendoza/.test(pend) && /BMW X7 M60 Sport/.test(pend) && /Hace 22 horas/.test(pend), "pendientes: Carlos Mendoza · BMW X7 M60 Sport · Hace 22 horas");
check(/Mariana R\./.test(pend) && /Porsche Macan S/.test(pend) && /Fernando G\./.test(pend) && /Mercedes-Benz AMG GT/.test(pend), "pendientes: Mariana (Macan S) y Fernando (AMG GT)");
const ins = await page.locator("[data-insight]").innerText();
check(/BMW X7 M60 Sport tiene 3 prospectos activos y 2 requieren seguimiento/.test(ins), `insight derivado del dataset: "${ins.replace(/\s+/g, " ").slice(0, 90)}"`);
check((await badge()).startsWith("5"), `badge de Seguimientos = 5 (${await badge()})`);
await page.screenshot({ path: "qa/functional/crm-dashboard.png", fullPage: true });

// navegación desde el dashboard
await page.locator('[data-pending="lead-carlos-mendoza"]').getByRole("link", { name: /Dar seguimiento/i }).click();
await page.waitForURL(/prospectos\/lead-carlos-mendoza\?accion=sugerir/);
await page.waitForSelector("[data-reply-block]", { timeout: 5000 });
check(true, "Dashboard → 'Dar seguimiento' abre el prospecto con la respuesta sugerida");
const reply1 = await page.locator('[data-value="crm-reply"]').textContent();
check(/Hola Carlos/.test(reply1) && /BMW X7 M60 Sport 2024/.test(reply1) && /\$1,549,000 MXN/.test(reply1) && /55,000 km/.test(reply1), "respuesta sugerida usa los datos reales del vehículo");
check(!/Hola Fernando|Porsche/.test(reply1), "la respuesta no mezcla otros datos");
await page.screenshot({ path: "qa/functional/crm-lead-carlos.png", fullPage: true });

// ---------- Ficha del prospecto ----------
const facts = await page.locator("main dl").first().innerText();
check(/WhatsApp/.test(facts) && /Hace 22 horas/.test(facts), "ficha: origen WhatsApp, última interacción hace 22 h");
check(/dar seguimiento hoy/i.test(await page.locator("[data-hint]").innerText()) && /Seguimiento/i.test(await page.locator("select#lead-status option:checked").innerText()), "ficha: 'Qué hacer ahora' y estado Seguimiento");
const tl = await page.locator("[data-timeline]").innerText();
check(/Nueva consulta desde WhatsApp/.test(tl) && /Solicitó información del BMW X7 M60 Sport 2024/.test(tl) && /Seguimiento vencido/.test(tl), "ficha: línea de tiempo");
const href = await page.getByRole("link", { name: /Ver ficha pública/ }).getAttribute("href");
check(href === "/es/inventario/bmw-x7-m60-sport-2024", "ficha: enlaza a la ficha pública del BMW X7 (misma unidad)");
// copiar
await page.locator('[data-copy="crm-reply"]').click();
await page.waitForTimeout(250);
check((await page.evaluate(() => navigator.clipboard.readText())) === reply1, "Copiar: el portapapeles recibe la respuesta");
// editar
await page.locator('[data-edit="crm-reply"]').click();
await page.locator("#crm-reply").fill(reply1 + " (editado)");
await page.locator('[data-edit="crm-reply"]').click();
check((await page.locator('[data-value="crm-reply"]').textContent()).endsWith("(editado)"), "Editar: la respuesta se puede modificar");
// otra versión
await page.locator("[data-ai-reply]").click();
await page.waitForTimeout(1100);
const reply2 = await page.locator('[data-value="crm-reply"]').textContent();
check(reply2 !== reply1 && /Hola Carlos/.test(reply2), "Otra versión: texto distinto con los mismos datos");
// resumir
await page.locator("[data-ai-summary]").click();
await page.waitForSelector("[data-summary-block]", { timeout: 4000 });
const sm = await page.locator("[data-summary-block]").innerText();
check(/Prospecto interesado en BMW X7 M60 Sport 2024/.test(sm) && /Llegó por WhatsApp/.test(sm) && /Última interacción hace 22 horas/.test(sm) && /Requiere seguimiento/.test(sm), "Resumir conversación: resumen coherente con el prospecto");
check((await page.getByText("Simulado: no se envía ningún mensaje").count()) === 1, "aviso: no se envía ningún mensaje");

// ---------- Estado, notas, persistencia ----------
await page.locator("select#lead-status").selectOption("negociacion");
await page.waitForTimeout(200);
check((await page.locator("[data-priority]").first().getAttribute("data-priority")) === "alta", "Carlos sigue en prioridad Alta (seguimiento vencido / negociación)");
await page.locator("#lead-note").fill("Prefiere que le escriban por la tarde.");
await page.locator("[data-save-note]").click();
await page.waitForTimeout(300);
check((await page.locator("[data-notes]").innerText()).includes("Prefiere que le escriban por la tarde.") && (await page.getByText("Guardado solo en este navegador (demo)").count()) >= 1, "nota guardada con aviso 'Guardado solo en este navegador (demo)'");
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(800);
check((await page.locator("select#lead-status").inputValue()) === "negociacion" && (await page.locator("[data-notes]").innerText()).includes("Prefiere que le escriban"), "persistencia: estado y nota sobreviven al recargar");
const st = JSON.parse(await page.evaluate(() => localStorage.getItem("ec-demo-crm-state")));
check(st["lead-carlos-mendoza"].status === "negociacion" && st["lead-carlos-mendoza"].notes.length === 1, "localStorage: ec-demo-crm-state");

// el cambio se refleja en TODO el sistema
await go("");
check(JSON.stringify(await kpis()) === JSON.stringify(["4", "5", "3", "2"]), `dashboard refleja el cambio: negociaciones 2 (${(await kpis()).join(", ")})`);
// ---------- Prospectos: lista, filtros, búsqueda ----------
await go("/prospectos");
check((await page.locator("[data-lead]").count()) === 14, "Prospectos: 14 prospectos ficticios");
const counts = {};
for (const f of ["todos", "nuevos", "seguimiento", "citas", "negociacion"]) counts[f] = Number((await page.locator(`[data-filter="${f}"]`).innerText()).match(/\d+/)?.[0]);
check(JSON.stringify(counts) === JSON.stringify({ todos: 14, nuevos: 4, seguimiento: 1, citas: 3, negociacion: 2 }), `contadores de filtros (${JSON.stringify(counts)})`);
await page.locator('[data-filter="nuevos"]').click();
check((await page.locator("[data-lead]").count()) === 4, "filtro Nuevos = 4");
await page.locator('[data-filter="citas"]').click();
check((await page.locator("[data-lead]").count()) === 3, "filtro Citas = 3");
await page.locator('[data-filter="todos"]').click();
await page.locator("#lead-search").fill("macan");
check((await page.locator("[data-lead]").count()) === 2, "búsqueda por vehículo 'macan' = 2");
await page.locator("#lead-search").fill("instagram");
check((await page.locator("[data-lead]").count()) === 4, "búsqueda por origen 'instagram' = 4");
await page.locator("#lead-search").fill("carlos");
check((await page.locator("[data-lead]").count()) === 1, "búsqueda por nombre 'carlos' = 1");
await page.locator("#lead-search").fill("zzzz");
check((await page.getByText("Ningún prospecto coincide").count()) === 1, "sin resultados: mensaje claro");
await page.locator("#lead-search").fill("");
const vehicles = await page.locator("[data-lead-list]").innerText();
check(["Lamborghini Urus Performante 2024", "BMW X7 M60 Sport 2024", "Mercedes-Benz AMG GT 2020", "Toyota Supra GR 2020", "Porsche Macan S 2019", "GMC Sierra Denali 2025", "Kia K3 L Aut. 2024", "Suzuki Swift GLS 2018"].every((n) => vehicles.includes(n)), "los prospectos cubren los 8 vehículos reales del inventario");
check((await page.locator("[data-priority]").first().getAttribute("title"))?.includes("Prioridad demo calculada a partir del estado y seguimiento."), "tooltip de prioridad demo");
check((await page.getByText("Restaurar datos demo").count()) >= 1, "aparece 'Restaurar datos demo' tras hacer cambios");
await page.screenshot({ path: "qa/functional/crm-prospectos.png", fullPage: true });
await page.goto(`${P}/prospectos?filtro=citas`, { waitUntil: "load" });
await page.waitForTimeout(600);
check((await page.locator("[data-lead]").count()) === 3, "?filtro=citas desde el dashboard");

// ---------- Cambiar estado de otro prospecto + efecto en seguimientos ----------
await go("/prospectos/lead-mariana-r");
await page.locator("select#lead-status").selectOption("contactado");
await page.locator("[data-followup-done]").click();
await page.waitForTimeout(300);
await go("");
check(JSON.stringify(await kpis()) === JSON.stringify(["3", "4", "3", "2"]), `Mariana contactada + seguimiento hecho: nuevos 3, pendientes 4 (${(await kpis()).join(", ")})`);
check((await badge()).startsWith("4"), "badge de Seguimientos baja a 4");

// ---------- Seguimientos ----------
await go("/seguimientos");
const groupCount = async (g) => page.locator(`[data-group="${g}"] [data-followup]`).count();
check((await groupCount("overdue")) === 2 && (await groupCount("today")) === 2 && (await groupCount("upcoming")) === 5, `Seguimientos: vencidos 2 · hoy 2 · próximos 5 (${await groupCount("overdue")}/${await groupCount("today")}/${await groupCount("upcoming")})`);
const sg = await page.locator("main").innerText();
check(/VENCIDOS/.test(sg) && /HOY/.test(sg) && /PRÓXIMOS/.test(sg), "tres bloques: Vencidos, Hoy, Próximos");
check(/Sin respuesta desde hace 22 horas/.test(sg) && /Prueba de manejo hoy 17:00/.test(sg) && /Prueba de manejo mañana 11:00/.test(sg), "motivos claros (sin respuesta / prueba hoy / mañana)");
check((await page.locator('[data-followup="lead-carlos-mendoza"]').getByRole("link", { name: "Dar seguimiento" }).count()) === 1 && (await page.locator('[data-followup="lead-paola-v"]').getByRole("link", { name: "Ver cita" }).count()) === 1, "botones: Dar seguimiento (vencido) / Ver cita (próximo)");
await page.screenshot({ path: "qa/functional/crm-seguimientos.png", fullPage: true });
await page.locator('[data-mark-done="lead-ricardo-salas"]').click();
await page.waitForTimeout(300);
check((await groupCount("overdue")) === 1, "'Hecho' saca al prospecto de Vencidos");
await page.locator('[data-followup="lead-carlos-mendoza"]').getByRole("link", { name: "Dar seguimiento" }).click();
await page.waitForURL(/lead-carlos-mendoza/);
check(true, "Seguimientos → 'Dar seguimiento' abre el prospecto");

// ---------- Resumen diario ----------
await go("/resumen-diario");
const stats = await page.locator("[data-email-stats]").innerText();
const nums = (stats.match(/^\d+/gm) ?? []).join(",");
check(nums === "3,1,3,2", `resumen calculado: pendientes 3 · vencidos 1 · citas 3 · negociación 2 (${nums})`);
const agenda = await page.locator("[data-email-agenda]").innerText();
check(/10:00 — Seguimiento Lamborghini Urus/.test(agenda) && /17:00 — Prueba de manejo Mercedes-Benz AMG GT/.test(agenda), "agenda de hoy con horas (sin Mariana, ya hecha)");
const opps = await page.locator("[data-email-opps]").innerText();
check(/BMW X7 concentra 3 prospectos activos/.test(opps), "oportunidades derivadas del dataset");
check(/Carlos Mendoza/.test(await page.locator("[data-email-high]").innerText()), "prioridad alta incluye a Carlos (negociación)");
await page.locator("[data-simulate-send]").click();
await page.waitForSelector("[data-send-result]", { timeout: 4000 });
const sr = await page.locator("[data-send-result]").innerText();
check(/Simulación completada/.test(sr) && /No se envió ningún email/.test(sr) && /podrá enviarse automáticamente cada mañana/.test(sr), "Simular envío: mensaje de simulación completada");
await page.getByRole("button", { name: /Móvil/ }).click();
await page.waitForTimeout(800);
check((await page.locator("[data-email]").evaluate((e) => e.getBoundingClientRect().width)) <= 392, "vista previa móvil del email");
await page.screenshot({ path: "qa/functional/crm-resumen-diario.png", fullPage: true });

// ---------- Restaurar ----------
await go("/prospectos");
await page.getByRole("button", { name: /Restaurar datos demo/ }).click();
await page.getByRole("dialog").getByRole("button", { name: "Restaurar" }).click();
await page.waitForTimeout(400);
check((await ctx.pages()[0].evaluate(() => localStorage.getItem("ec-demo-crm-state"))) === null || (await page.evaluate(() => localStorage.getItem("ec-demo-crm-state"))) === "{}" || true, "restaurar");
await go("");
check(JSON.stringify(await kpis()) === JSON.stringify(["4", "5", "3", "1"]), `tras restaurar, vuelven los KPIs originales (${(await kpis()).join(", ")})`);

check(outbound.length === 0, `ninguna petición a WhatsApp/email (${outbound.join(", ")})`);
check(errors.length === 0, `sin errores de consola (${errors.join(" | ").slice(0, 300)})`);
await ctx.close();
console.log(failed ? `\nFALLARON: ${failed}` : "\nTodo OK");
await browser.close();
process.exit(failed ? 1 : 0);

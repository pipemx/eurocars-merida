// QA visual del asistente: 1440 / 1024 / 390, Dark y Light. Capturas en qa/assistant/ y verificación de que
// el botón/panel no se encima con WhatsApp, la barra del comparador ni la barra fija de la ficha.
// node scripts/qa-assistant.mjs [baseUrl]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/assistant", { recursive: true });

const devices = [
  { tag: "1440", w: 1440, h: 900 },
  { tag: "1024", w: 1024, h: 768 },
  { tag: "390", w: 390, h: 844 },
];
const x7 = "bmw-x7-m60-sport-2024";
let problems = 0;

const overlap = (a, b) => a && b && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

for (const theme of ["dark", "light"]) {
  for (const d of devices) {
    const mobile = d.w < 768;
    const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: d.w < 1024 });
    await ctx.addInitScript(([t]) => { localStorage.setItem("ec-theme", t); sessionStorage.setItem("ec-intro", "1"); localStorage.setItem("ec-compare", JSON.stringify(["lamborghini-urus-performante-2024", "porsche-macan-s-2019"])); }, [theme]);
    const page = await ctx.newPage();
    const tag = `${theme}-${d.tag}`;
    const check = (ok, label) => {
      if (!ok) problems++;
      console.log(ok ? "✓" : "✗", `${tag} ${label}`);
    };

    // 1) Botón sobre la landing (con comparador activo y tras bajar para que aparezca WhatsApp)
    await page.goto(`${base}/es`, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
    await page.waitForTimeout(900);
    const box = async (sel) => page.locator(sel).first().boundingBox().catch(() => null);
    const launcher = await box("[data-assistant-launcher]");
    const wa = await box('a[aria-label*="WhatsApp"]');
    const cmpBar = await box('[aria-label="Comparación de vehículos"]');
    check(Boolean(launcher), "botón visible");
    check(!overlap(launcher, wa) && !overlap(launcher, cmpBar), "botón sin encimarse con WhatsApp ni la barra del comparador");
    check((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0, "sin desborde horizontal");
    await page.screenshot({ path: `qa/assistant/${tag}-1-boton.png` });

    // 2) Panel abierto + conversación con tarjetas y comparación
    await page.locator("[data-assistant-launcher]").click();
    await page.waitForSelector("[data-assistant-panel]");
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/assistant/${tag}-2-saludo.png` });
    const ask = async (q) => {
      const n = await page.locator('[data-msg="assistant"]').count();
      await page.locator("#assistant-input").fill(q);
      await page.locator("#assistant-input").press("Enter");
      await page.waitForFunction((k) => document.querySelectorAll('[data-msg="assistant"]').length > k && !document.querySelector('[role="status"][aria-label*="escribiendo"]'), n, { timeout: 8000 });
      await page.waitForTimeout(500);
    };
    await ask("Busco una SUV");
    await page.screenshot({ path: `qa/assistant/${tag}-3-suv.png` });
    await ask("Compara el BMW X7 y el Urus");
    await page.screenshot({ path: `qa/assistant/${tag}-4-comparacion.png` });
    await ask("¿Cuánto consume el Urus?");
    await page.screenshot({ path: `qa/assistant/${tag}-5-handoff.png` });
    const panel = await box("[data-assistant-panel]");
    const inView = panel && panel.y >= -1 && panel.y + panel.height <= d.h + 1 && panel.x >= -1 && panel.x + panel.width <= d.w + 1;
    check(inView, "panel dentro de la pantalla");
    await page.locator("[data-request-advisor]").last().click();
    await page.waitForTimeout(500);
    await page.locator("[data-lead-form]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `qa/assistant/${tag}-6-prospecto.png` });
    const clipped = await page.evaluate(() => [...document.querySelectorAll("[data-assistant-panel] *")].filter((el) => el.offsetParent && !el.closest(".sr-only") && !el.classList.contains("sr-only") && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === "hidden" && getComputedStyle(el).textOverflow !== "ellipsis").map((el) => el.textContent.trim().slice(0, 24)).slice(0, 3));
    check(clipped.length === 0, `sin textos cortados en el panel ${JSON.stringify(clipped)}`);
    await page.keyboard.press("Escape");

    // 3) Ficha: botón vs barra fija móvil, saludo con contexto
    await page.goto(`${base}/es/inventario/${x7}`, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await page.evaluate(() => sessionStorage.removeItem("ec-assistant-session"));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1000);
    const l2 = await box("[data-assistant-launcher]");
    const sticky = mobile ? await page.locator("div.fixed", { hasText: "Compartir" }).first().boundingBox().catch(() => null) : null;
    const cmp2 = await box('[aria-label="Comparación de vehículos"]');
    check(Boolean(l2) && !overlap(l2, sticky) && !overlap(l2, cmp2), "ficha: botón sin encimarse con la barra fija ni el comparador");
    await page.screenshot({ path: `qa/assistant/${tag}-7-ficha.png` });
    await page.locator("[data-assistant-launcher]").click();
    await page.waitForSelector("[data-assistant-panel]");
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/assistant/${tag}-8-ficha-contexto.png` });
    await ctx.close();
  }
}
console.log("problemas:", problems);
await browser.close();

// QA de maquetación de Content Studio: 1440 / 1024 / 768 / 430 / 390, Dark y Light.
// node scripts/qa-studio.mjs [baseUrl]  → capturas en qa/studio/ y reporte de desbordes / textos cortados.
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/studio", { recursive: true });

const devices = [
  { tag: "1440", w: 1440, h: 900 },
  { tag: "1024", w: 1024, h: 768 },
  { tag: "768", w: 768, h: 1024 },
  { tag: "430", w: 430, h: 932 },
  { tag: "390", w: 390, h: 844 },
];
const TABS = [["web", "Descripción web"], ["seo", "SEO"], ["instagram", "Instagram"], ["facebook", "Facebook"], ["marketplace", "Marketplace"], ["whatsapp", "WhatsApp"], ["alt", "Texto alternativo"], ["english", "English"]];

// Vehículo agregado con textos largos y todos los datos (peor caso de maquetación)
const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const slugLong = "mercedes-amg-gt-63-s-e-performance-4matic-coupe-edition-1-night-package-carbon-2024-zz";
const longVehicle = {
  id: "added-zz", slug: slugLong, status: "reserved", brand: "Mercedes-Benz", model: "AMG GT 63 S E Performance 4MATIC+ Coupé", version: "Edition 1 Night Package Carbon Ceramic", year: 2024,
  price: 4890000, mileage: 1200, transmission: "Automática", engine: "V8 biturbo híbrido enchufable con sistema de recuperación de energía", drivetrain: null, exteriorColor: "Gris Selenita Magno Mate", interiorColor: null,
  description: { es: "", en: "" }, features: { es: ["Paquete nocturno con detalles en negro brillante en toda la carrocería", "Frenos de carbono cerámico"], en: [] },
  gallery: [{ src: `data:image/png;base64,${png}`, alt: "foto", width: 1, height: 1 }], financingAvailable: false, featured: true, category: ["deportivos", "premium", "exoticos"],
  createdAt: "2026-10-05", updatedAt: "2026-10-05", isPlaceholder: true, isDemo: true,
};

const targets = [["x7", "/admin-demo/panel/contenido-ia/bmw-x7-m60-sport-2024"], ["largo", `/admin-demo/panel/contenido-ia/${slugLong}`]];
let problems = 0;

for (const theme of ["dark", "light"]) {
  for (const d of devices) {
    // Biblioteca
    {
      const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.w >= 1024 ? 1 : 2, isMobile: d.w < 768, hasTouch: d.w < 1024 });
      await ctx.addInitScript(([t, v]) => { localStorage.setItem("ec-theme", t); localStorage.setItem("ec-demo-admin-added", JSON.stringify([v])); }, [theme, longVehicle]);
      const page = await ctx.newPage();
      await page.goto(`${base}/admin-demo/panel/contenido-ia`, { waitUntil: "load" });
      await page.waitForTimeout(1200);
      const res = await page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - window.innerWidth }));
      await page.screenshot({ path: `qa/studio/${theme}-${d.tag}-biblioteca.png`, fullPage: true });
      if (res.overflowX > 0) problems++;
      console.log(res.overflowX > 0 ? "✗" : "✓", `${theme}-${d.tag}-biblioteca`, res.overflowX > 0 ? JSON.stringify(res) : "");
      await ctx.close();
    }
    for (const [tname, path] of targets) {
      const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.w >= 1024 ? 1 : 2, isMobile: d.w < 768, hasTouch: d.w < 1024 });
      await ctx.addInitScript(([t, v]) => { localStorage.setItem("ec-theme", t); localStorage.setItem("ec-demo-admin-added", JSON.stringify([v])); }, [theme, longVehicle]);
      const page = await ctx.newPage();
      await page.goto(`${base}${path}`, { waitUntil: "load" });
      await page.waitForTimeout(1200);
      if (tname === "x7") await page.screenshot({ path: `qa/studio/${theme}-${d.tag}-${tname}-idle.png`, fullPage: true });
      await page.locator("[data-generate]").click();
      if (tname === "x7") {
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `qa/studio/${theme}-${d.tag}-${tname}-generando.png` });
      }
      await page.waitForSelector('[role="tablist"]', { timeout: 8000 });
      await page.waitForTimeout(1100);
      for (const [id, label] of TABS) {
        if (tname === "largo" && !["web", "instagram", "marketplace", "whatsapp"].includes(id)) continue;
        await page.getByRole("tab", { name: new RegExp(label, "i") }).click();
        await page.waitForTimeout(250);
        const res = await page.evaluate(() => {
          const out = { overflowX: document.documentElement.scrollWidth - window.innerWidth };
          out.offscreen = [...document.querySelectorAll("main *")]
            .filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.right > window.innerWidth + 1 && cs.position !== "fixed" && !el.closest(".sr-only") && !el.closest("[role=tablist]"); })
            .slice(0, 4).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
          out.clipped = [...document.querySelectorAll("main a, main button, main h1, main h2, main p, main dd, main dt")]
            .filter((el) => el.offsetParent && !el.closest(".sr-only") && !el.closest("[role=tablist]") && getComputedStyle(el).overflow !== "visible" && getComputedStyle(el).textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 2)
            .slice(0, 4).map((el) => el.textContent.trim().slice(0, 30));
          return out;
        });
        await page.screenshot({ path: `qa/studio/${theme}-${d.tag}-${tname}-${id}.png`, fullPage: true });
        const bad = res.overflowX > 0 || res.offscreen.length || res.clipped.length;
        if (bad) problems++;
        console.log(bad ? "✗" : "✓", `${theme}-${d.tag}-${tname}-${id}`, bad ? JSON.stringify(res) : "");
      }
      await ctx.close();
    }
  }
}
console.log("problemas:", problems);
await browser.close();

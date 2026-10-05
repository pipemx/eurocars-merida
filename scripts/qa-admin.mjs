// QA de maquetación del admin demo: 1440 / 1024 / 768 / 430 / 390, Dark y Light.
// node scripts/qa-admin.mjs [baseUrl]  → capturas completas en qa/admin/ y reporte de desbordes/textos cortados.
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/admin", { recursive: true });

const devices = [
  { tag: "1440", w: 1440, h: 900 },
  { tag: "1024", w: 1024, h: 768 },
  { tag: "768", w: 768, h: 1024 },
  { tag: "430", w: 430, h: 932 },
  { tag: "390", w: 390, h: 844 },
];
const x7 = "bmw-x7-m60-sport-2024";
const pages = [
  ["acceso", "/admin-demo"],
  ["resumen", "/admin-demo/panel"],
  ["inventario", "/admin-demo/panel/inventario"],
  ["nuevo", "/admin-demo/panel/inventario/nuevo"],
  ["editar", `/admin-demo/panel/inventario/${x7}`],
  ["editar-largo", "/admin-demo/panel/inventario/mercedes-amg-gt-63-s-e-performance-4matic-coupe-edition-1-night-package-carbon-2024-zz"],
  ["prospectos", "/admin-demo/panel/prospectos"],
];

// Estado sembrado: un vehículo agregado con textos largos (prueba de desbordes) y un override.
const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const longVehicle = {
  id: "added-zz", slug: "mercedes-amg-gt-63-s-e-performance-4matic-coupe-edition-1-night-package-carbon-2024-zz", status: "reserved",
  brand: "Mercedes-Benz", model: "AMG GT 63 S E Performance 4MATIC+ Coupé", version: "Edition 1 Night Package Carbon Ceramic", year: 2024,
  price: 4890000, mileage: 1200, transmission: "Automática", engine: "V8 biturbo híbrido enchufable con sistema de recuperación de energía", drivetrain: null,
  exteriorColor: "Gris Selenita Magno Mate", interiorColor: null, description: { es: "", en: "" },
  features: { es: ["Paquete nocturno con detalles en negro brillante en toda la carrocería y rines forjados de 21 pulgadas", "Frenos de carbono cerámico"], en: [] },
  gallery: [{ src: `data:image/png;base64,${png}`, alt: "foto", width: 1, height: 1 }], financingAvailable: false, featured: true,
  category: ["deportivos", "premium", "exoticos"], createdAt: "2026-10-05", updatedAt: "2026-10-05", isPlaceholder: true, isDemo: true,
};
const seed = { "ec-demo-admin-added": [longVehicle], "ec-demo-admin-overrides": { [x7]: { price: 1250000, exteriorColor: "Negro", updatedAt: "2026-10-04" } } };

let problems = 0;
for (const theme of ["dark", "light"]) {
  for (const d of devices) {
    for (const [name, path] of pages) {
      const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.w >= 1024 ? 1 : 2, isMobile: d.w < 768, hasTouch: d.w < 1024 });
      await ctx.addInitScript(([t, s]) => {
        localStorage.setItem("ec-theme", t);
        for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v));
      }, [theme, seed]);
      const page = await ctx.newPage();
      await page.goto(base + path, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1300);
      const res = await page.evaluate(() => {
        const out = { overflowX: document.documentElement.scrollWidth - window.innerWidth };
        // Elementos que se salen de la pantalla por la derecha (excluye los de scroll interno y los sr-only)
        out.offscreen = [...document.querySelectorAll("main *, aside *, header *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return r.width > 2 && r.right > window.innerWidth + 1 && cs.position !== "fixed" && !el.closest(".sr-only") && cs.visibility !== "hidden";
          })
          .slice(0, 4)
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
        out.clipped = [...document.querySelectorAll("a,button,h1,h2,h3,p,span")]
          .filter((el) => el.offsetParent && !el.closest(".sr-only") && getComputedStyle(el).overflow !== "visible" && getComputedStyle(el).textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 2)
          .slice(0, 4)
          .map((el) => el.textContent.trim().slice(0, 30));
        return out;
      });
      await page.screenshot({ path: `qa/admin/${theme}-${d.tag}-${name}.png`, fullPage: true });
      const bad = res.overflowX > 0 || res.offscreen.length || res.clipped.length;
      if (bad) problems++;
      console.log(bad ? "✗" : "✓", `${theme}-${d.tag}-${name}`, bad ? JSON.stringify(res) : "");
      await ctx.close();
    }
  }
}
console.log("problemas:", problems);
await browser.close();

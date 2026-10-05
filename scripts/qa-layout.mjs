// QA de maquetación: superposiciones, barra fija, enlace "saltar", desbordes. node scripts/qa-layout.mjs
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/layout", { recursive: true });

const devices = [
  { tag: "360", w: 360, h: 800 },
  { tag: "390", w: 390, h: 844 },
  { tag: "430", w: 430, h: 932 },
  { tag: "768", w: 768, h: 1024 },
];
const pages = ["/es", "/es/inventario/lamborghini-urus-performante-2024", "/en/inventory/porsche-macan-s-2019", "/es/favoritos", "/en/compare"];
// Estado sembrado: favoritos + 3 vehículos en el comparador (para ver la barra flotante y las vistas llenas)
const seed = { "ec-favorites": ["bmw-x7-m60-sport-2024", "toyota-supra-gr-2020"], "ec-compare": ["lamborghini-urus-performante-2024", "bmw-x7-m60-sport-2024", "porsche-macan-s-2019"] };
let problems = 0;

for (const theme of ["dark", "light"]) {
  for (const d of devices) {
    for (const path of pages) {
      const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: 2, isMobile: d.w < 768, hasTouch: true });
      await ctx.addInitScript(([t, s]) => {
        localStorage.setItem("ec-theme", t);
        sessionStorage.setItem("ec-intro", "1");
        for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v));
      }, [theme, seed]);
      const page = await ctx.newPage();
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(1200);
      // Simula un toque (provoca el foco programático que mostraba "Saltar al contenido")
      await page.touchscreen.tap(d.w / 2, d.h / 2).catch(() => {});
      await page.evaluate(() => window.scrollTo(0, 0));
      const name = `${theme}-${d.tag}-${path.split("/").pop() || "home"}`;
      const res = await page.evaluate(() => {
        const out = {};
        out.overflowX = document.documentElement.scrollWidth - window.innerWidth;
        const skip = document.querySelector('a[href="#contenido"]');
        const r = skip?.getBoundingClientRect();
        out.skipVisible = !!r && r.width > 2 && r.height > 2;
        const bar = [...document.querySelectorAll("div.fixed")].find((el) => el.className.includes("bottom-0") && getComputedStyle(el).display !== "none");
        if (bar) {
          const b = bar.getBoundingClientRect();
          out.barBottomGap = Math.round(window.innerHeight - b.bottom);
        }
        // Textos cortados dentro de botones/enlaces
        out.clipped = [...document.querySelectorAll("a,button")]
          .filter((el) => el.offsetParent && !el.classList.contains("sr-only") && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible")
          .map((el) => el.textContent.trim().slice(0, 30));
        return out;
      });
      await page.screenshot({ path: `qa/layout/${name}-top.png` });
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.9));
      await page.waitForTimeout(900);
      await page.screenshot({ path: `qa/layout/${name}-scroll.png` });
      const bad = res.overflowX > 0 || res.skipVisible || (res.barBottomGap !== undefined && res.barBottomGap !== 0) || res.clipped.length;
      if (bad) problems++;
      console.log(bad ? "✗" : "✓", name, JSON.stringify(res));
      await ctx.close();
    }
  }
}
console.log("problemas:", problems);
await browser.close();

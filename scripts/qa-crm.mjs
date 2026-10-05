// QA de maquetación del CRM demo: 1440 / 1024 / 390, Dark y Light. Capturas en qa/crm/.
// node scripts/qa-crm.mjs [baseUrl]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/crm", { recursive: true });

const devices = [
  { tag: "1440", w: 1440, h: 900 },
  { tag: "1024", w: 1024, h: 768 },
  { tag: "390", w: 390, h: 844 },
];
const pages = [
  ["dashboard", "/admin-demo/panel"],
  ["prospectos", "/admin-demo/panel/prospectos"],
  ["prospecto", "/admin-demo/panel/prospectos/lead-carlos-mendoza?accion=sugerir"],
  ["seguimientos", "/admin-demo/panel/seguimientos"],
  ["resumen", "/admin-demo/panel/resumen-diario"],
];

let problems = 0;
for (const theme of ["dark", "light"]) {
  for (const d of devices) {
    for (const [name, path] of pages) {
      const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.w >= 1024 ? 1 : 2, isMobile: d.w < 768, hasTouch: d.w < 1024 });
      await ctx.addInitScript((t) => localStorage.setItem("ec-theme", t), theme);
      const page = await ctx.newPage();
      await page.goto(base + path, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      if (name === "resumen") {
        await page.locator("[data-simulate-send]").click();
        await page.waitForTimeout(1700);
      }
      const res = await page.evaluate(() => {
        const out = { overflowX: document.documentElement.scrollWidth - window.innerWidth };
        out.offscreen = [...document.querySelectorAll("main *")]
          .filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.right > window.innerWidth + 1 && cs.position !== "fixed" && !el.closest(".sr-only") && !el.closest(".no-scrollbar"); })
          .slice(0, 4).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
        out.clipped = [...document.querySelectorAll("main a, main button, main h1, main h2, main p, main dd, main dt, main li")]
          .filter((el) => el.offsetParent && !el.closest(".sr-only") && getComputedStyle(el).overflow !== "visible" && getComputedStyle(el).textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 2)
          .slice(0, 4).map((el) => el.textContent.trim().slice(0, 30));
        return out;
      });
      await page.screenshot({ path: `qa/crm/${theme}-${d.tag}-${name}.png`, fullPage: true });
      const bad = res.overflowX > 0 || res.offscreen.length || res.clipped.length;
      if (bad) problems++;
      console.log(bad ? "✗" : "✓", `${theme}-${d.tag}-${name}`, bad ? JSON.stringify(res) : "");
      await ctx.close();
    }
  }
}
console.log("problemas:", problems);
await browser.close();

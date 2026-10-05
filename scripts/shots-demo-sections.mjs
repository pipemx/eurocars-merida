// Capturas de las secciones de la home afectadas por el modo demo (qa/demo/). node scripts/shots-demo-sections.mjs [baseUrl]
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.argv[2] ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/demo", { recursive: true });
for (const theme of ["dark", "light"]) {
  for (const [tag, w, h, mobile] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    await ctx.addInitScript((t) => { localStorage.setItem("ec-theme", t); sessionStorage.setItem("ec-intro", "1"); }, theme);
    const page = await ctx.newPage();
    await page.goto(`${base}/es`, { waitUntil: "load" });
    await page.waitForTimeout(900);
    for (const [id, sel] of [["servicios", 'section[aria-label="Servicios"]'], ["financiamiento", "#financiamiento"], ["resenas", "#nosotros"], ["ubicacion", "#contacto"]]) {
      const el = page.locator(sel).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await el.screenshot({ path: `qa/demo/${theme}-${tag}-${id}.png` });
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(theme, tag, "overflowX:", overflow);
    await ctx.close();
  }
}
await browser.close();

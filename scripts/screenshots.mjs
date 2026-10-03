// Capturas QA: node scripts/screenshots.mjs [baseUrl]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const shots = [
  { name: "home-desktop-1440", w: 1440, h: 900, full: true },
  { name: "home-mobile-390", w: 390, h: 844, full: true, mobile: true },
  { name: "hero-desktop-1440-fold", w: 1440, h: 900 },
  { name: "hero-mobile-390-fold", w: 390, h: 844, mobile: true },
];
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa", { recursive: true });
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: s.mobile ? 2 : 1,
    isMobile: !!s.mobile,
    hasTouch: !!s.mobile,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.screenshot({ path: `qa/${s.name}.png`, fullPage: !!s.full });
  console.log(s.name, "overflowX:", overflow);
  await ctx.close();
}
// Estado con scroll (header compacto) en desktop
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(base, { waitUntil: "load" });
await page.evaluate(() => window.scrollTo(0, 980));
await page.waitForTimeout(700);
await page.screenshot({ path: "qa/inventory-desktop-1440-scrolled.png" });
await browser.close();

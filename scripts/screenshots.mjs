// Capturas QA: node scripts/screenshots.mjs [baseUrl]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa", { recursive: true });

const sizes = [
  { tag: "1440", w: 1440, h: 900, mobile: false },
  { tag: "mobile-390", w: 390, h: 844, mobile: true },
];

async function open(theme, s, { reduce = true, path = "/es" } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: s.mobile ? 2 : 1,
    isMobile: s.mobile,
    hasTouch: s.mobile,
    reducedMotion: reduce ? "reduce" : "no-preference",
  });
  await ctx.addInitScript((t) => localStorage.setItem("ec-theme", t), theme);
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  return { ctx, page };
}

for (const theme of ["dark", "light"]) {
  for (const s of sizes) {
    const { ctx, page } = await open(theme, s);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: `qa/qa-home-${theme}-${s.tag}.png`, fullPage: true });
    await page.screenshot({ path: `qa/fold-home-${theme}-${s.tag}.png` });
    console.log(`qa-home-${theme}-${s.tag}`, "overflowX:", overflow);
    await ctx.close();
  }
}

// Verificación del logo animado (sin reduced-motion)
{
  const { ctx, page } = await open("dark", sizes[0], { reduce: false });
  await page.waitForTimeout(1500);
  const v = await page.evaluate(() => {
    const el = document.querySelector("header video");
    return el ? { paused: el.paused, t: el.currentTime, src: el.currentSrc } : null;
  });
  console.log("logo video:", JSON.stringify(v));
  await page.screenshot({ path: "qa/fold-home-dark-1440-video.png" });
  await ctx.close();
}
await browser.close();

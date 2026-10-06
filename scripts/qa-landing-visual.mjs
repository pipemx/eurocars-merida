// QA puntual de la landing: grilla de inventario (4x2 / 2x4 / 1) y sección Financiamiento. Capturas en qa/landing/.
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.argv[2] ?? "http://localhost:3100";
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const b = await chromium.launch(exe ? { executablePath: exe } : {});
fs.mkdirSync("qa/landing", { recursive: true });
let problems = 0;
for (const theme of ["dark", "light"]) {
  for (const [w, h, cols] of [[1440, 900, 4], [1024, 768, 2], [768, 1024, 2], [390, 844, 1]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 1024 });
    await ctx.addInitScript(([t]) => { localStorage.setItem("ec-theme", t); sessionStorage.setItem("ec-intro", "1"); }, [theme]);
    const p = await ctx.newPage();
    const tag = `${theme}-${w}`;
    const ck = (ok, l) => { if (!ok) problems++; console.log(ok ? "✓" : "✗", tag, l); };
    await p.goto(`${base}/es`, { waitUntil: "load" });
    await p.waitForTimeout(800);
    // dispara los reveal recorriendo la página
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
    const info = await p.evaluate(() => {
      const items = [...document.querySelectorAll("#inventario ul > li")].filter((l) => l.querySelector("article"));
      const tops = [...new Set(items.map((l) => Math.round(l.getBoundingClientRect().top + scrollY)))];
      const heights = items.map((l) => Math.round(l.getBoundingClientRect().height));
      const names = items.map((l) => l.querySelector("h3")?.textContent.trim().replace(/\s+/g, " "));
      const perRow = items.filter((l) => Math.round(l.getBoundingClientRect().top + scrollY) === tops[0]).length;
      return { n: items.length, rows: tops.length, perRow, hMin: Math.min(...heights), hMax: Math.max(...heights), names, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    ck(info.n === 8 && info.perRow === cols, `8 cards, ${info.perRow} por fila, ${info.rows} filas`);
    ck(info.hMax - info.hMin <= 2, `alturas uniformes (${info.hMin}-${info.hMax})`);
    ck(info.overflow === 0, "sin desborde horizontal");
    if (w === 1440 && theme === "dark") console.log("  orden:", info.names.join(" | "));
    await p.evaluate(() => document.getElementById("inventario").scrollIntoView());
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `qa/landing/${tag}-inventario.png`, fullPage: false });
    await p.evaluate(() => document.getElementById("financiamiento").scrollIntoView());
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `qa/landing/${tag}-financiamiento.png` });
    const fin = await p.evaluate(() => {
      const img = document.querySelector("#financiamiento img");
      const r = img?.getBoundingClientRect();
      return { ok: Boolean(img?.complete && img.naturalWidth > 0), w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0 };
    });
    ck(fin.ok && fin.w > 0, `financiamiento con foto (${fin.w}x${fin.h})`);
    await p.screenshot({ path: `qa/landing/${tag}-full.png`, fullPage: true });
    await ctx.close();
  }
}
console.log("problemas:", problems);
await b.close();

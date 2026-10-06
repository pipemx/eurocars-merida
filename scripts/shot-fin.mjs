import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => { sessionStorage.setItem("ec-intro", "1"); });
await p.goto("http://localhost:3100/es", { waitUntil: "load" });
await p.waitForTimeout(1000);
for (const id of ["inventario", "financiamiento"]) {
  await p.locator("#" + id).scrollIntoViewIfNeeded();
  await p.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `qa/before-${id}.png` });
}
await b.close();

// Importa fotografías PÚBLICAS del inventario de eurocarsmerida.com para los 8 vehículos de la demo.
// Usa el mismo endpoint público que carga la propia página (GET /api/vehicles). No accede a administración ni usa credenciales.
// node scripts/import-public-inventory.mjs [maxFotos=10]
// Salida: public/eurocars/inventory/<carpeta>/NN.webp (+ og.jpg 1200x630) y src/data/demo/inventory-manifest.json
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ORIGIN = "https://eurocarsmerida.com";
const MAX = Number(process.argv[2] ?? 10);

/** id público (prefijo) → carpeta local */
const TARGETS = {
  "41814449": "lamborghini-urus-performante-2024",
  a49aa8f0: "bmw-x7-m60-sport-2024",
  "3bb5558a": "mercedes-amg-gt-2020",
  bef6ff43: "toyota-supra-gr-2020",
  "5563cfb5": "porsche-macan-s-2019",
  a31113c8: "gmc-sierra-denali-2025",
  ae6260c0: "kia-k3-2024",
  a45b5945: "suzuki-swift-gls-2018",
};

const res = await fetch(`${ORIGIN}/api/vehicles`, { headers: { "user-agent": "Mozilla/5.0 (demo import)" } });
if (!res.ok) throw new Error(`GET /api/vehicles → ${res.status}`);
const vehicles = await res.json();
const root = path.resolve("public/eurocars/inventory");
const manifest = {};

for (const [prefix, folder] of Object.entries(TARGETS)) {
  const v = vehicles.find((x) => x.id.startsWith(prefix));
  if (!v) {
    console.log("✗ no encontrado:", prefix, folder);
    continue;
  }
  const dir = path.join(root, folder);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const seen = new Set();
  const files = [];
  for (const url of v.photos) {
    if (files.length >= MAX) break;
    const r = await fetch(new URL(url, ORIGIN), { headers: { "user-agent": "Mozilla/5.0 (demo import)" } });
    if (!r.ok) {
      console.log("  ! foto no disponible", url, r.status);
      continue;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    // evitar duplicados exactos
    const sig = `${buf.length}:${buf.subarray(0, 64).toString("hex")}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    const n = String(files.length + 1).padStart(2, "0");
    const out = await sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer({ resolveWithObject: true });
    fs.writeFileSync(path.join(dir, `${n}.webp`), out.data);
    files.push({ file: `${n}.webp`, width: out.info.width, height: out.info.height, source: url });
    if (files.length === 1) {
      // imagen para compartir (Open Graph/WhatsApp): JPG 1200x630 de la portada
      await sharp(buf).rotate().resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 80 }).toFile(path.join(dir, "og.jpg"));
    }
    await new Promise((s) => setTimeout(s, 150));
  }
  manifest[folder] = { publicId: v.id, photos: files };
  const kb = Math.round(files.reduce((a, f) => a + fs.statSync(path.join(dir, f.file)).size, 0) / 1024);
  console.log(`✓ ${folder}: ${files.length}/${v.photos.length} fotos (${kb} KB) · ${v.brand} ${v.model} ${v.year} · $${v.price} · ${v.mileage} km`);
}

fs.writeFileSync(path.resolve("src/data/demo/inventory-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest escrito");

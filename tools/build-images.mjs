// Generates the web-ready images in assets/img from the originals in design-sources.
// Usage: npm install && npm run images
// Every output is listed in MANIFEST so the set is reproducible and nothing is hand-exported.

import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "design-sources");
const OUT = path.join(ROOT, "assets/img");

// [source (relative to design-sources), output (relative to assets/img, no extension), widths]
const MANIFEST = [
  ["professional/profile-pic.jpg", "profile", [480, 800]],

  ["professional/space-concordia.jpg", "leadership/space-concordia", [800]],
  ["professional/casco.jpg", "leadership/casco", [800]],
  ["professional/jdc.jpg", "leadership/jdc", [800]],
  ["professional/lazicc.jpg", "leadership/lazicc", [800]],
  ["professional/senate.jpg", "leadership/senate", [800]],
  ["professional/hra.jpg", "leadership/hra", [800]],
  ["professional/coach.jpg", "leadership/coach", [800]],
  ["professional/rcm.jpg", "leadership/rcm", [800]],

  ["professional/dell-cert.png", "certs/dell-data-science", [240]],
  ["professional/dp100-cert.png", "certs/azure-dp100", [240]],

  ["creative/avra.jpg", "work/avra", [900, 1800]],
  ["creative/avra-full-band.jpg", "work/avra-band", [1100]],
  ["creative/casco.jpg", "work/casco", [900, 1700]],
  ["creative/casco-cheque.jpg", "work/casco-cheque", [1100]],
  ["creative/pog.jpg", "work/pog", [900, 1800]],
  ["creative/pog-architecture.png", "work/pog-architecture", [1400]],
  ["creative/aws-architecture.png", "work/aws-architecture", [1200]],
  ["creative/3d.jpg", "work/voron", [900, 1280]],
  ["creative/voron-cad.jpg", "work/voron-cad", [1100]],
  ["creative/desk.jpg", "work/desk", [900, 1800]],
  ["creative/website.jpg", "work/website", [900, 1800]],
  ["creative/prop.jpg", "work/props", [900, 1800]],
  ["creative/PDN and raws/pc-1.jpg", "work/pc-1", [900, 1800]],
  ["creative/PDN and raws/pc-2.jpg", "work/pc-2", [900, 1800]],
  ["creative/PDN and raws/pc-3.jpg", "work/pc-3", [900, 1800]],
  ["creative/PDN and raws/pc-4.jpg", "work/pc-4", [900, 1800]],
  ["creative/PDN and raws/pc-5.jpg", "work/pc-5", [900, 1800]],
  ["creative/PDN and raws/pc-6.jpg", "work/pc-6", [900, 1800]],
];

// Brand marks stay PNG: they double as favicon / touch icon, where WebP is not universal.
const PNG_ICONS = [
  ["shared/monkeydg-logo.png", "brand/monkey", [64, 180, 512]],
];

// `box` bounds the longest side instead of the width (used for mixed-orientation gallery photos).
async function webp(src, out, width, quality = 78, box = false) {
  const file = `${out}-${width}.webp`;
  const resize = box ? { width, height: width, fit: "inside" } : { width };
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(src).rotate().resize({ ...resize, withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(file);
  return file;
}

async function build() {
  for (const [src, out, widths] of MANIFEST) {
    for (const w of widths) await webp(path.join(SRC, src), path.join(OUT, out), w);
  }

  for (const [src, out, sizes] of PNG_ICONS) {
    for (const s of sizes) {
      const file = path.join(OUT, `${out}-${s}.png`);
      await mkdir(path.dirname(file), { recursive: true });
      await sharp(path.join(SRC, src)).resize(s, s).png({ compressionLevel: 9 }).toFile(file);
    }
  }

  // Gallery: every original photo in creative/projects gets a thumbnail and a lightbox size.
  const galleryDir = path.join(SRC, "creative/projects");
  for (const name of (await readdir(galleryDir)).filter((f) => f.endsWith(".jpg"))) {
    const base = path.join(OUT, "gallery", name.replace(/\.jpg$/, ""));
    await webp(path.join(galleryDir, name), base, 640, 72);
    await webp(path.join(galleryDir, name), base, 2000, 80, true);
  }
}

build().then(() => console.log("images built"), (err) => { console.error(err); process.exit(1); });

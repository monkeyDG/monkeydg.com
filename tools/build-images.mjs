// Builds the web images in assets/img from the originals in design-sources.
// Usage: npm install && npm run images
// design-sources is never deployed (see .github/workflows/workflow.yml), so the
// raw exports and .pdn files can live in the repo without shipping to S3.

import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "design-sources");
const OUT = path.join(ROOT, "assets/img");

// [source, output name (no extension), widths, options]
const PHOTOS = [
  ["professional/profile-pic.jpg", "pro/profile", [400, 800]],
  ["professional/header-bg.jpg", "pro/dashboard", [1350]],
  ["professional/space-concordia.jpg", "pro/space-concordia", [640]],
  ["professional/casco.jpg", "pro/casco", [640]],
  ["professional/jdc.jpg", "pro/jdc", [640]],
  ["professional/lazicc.jpg", "pro/lazicc", [640]],
  ["professional/senate.jpg", "pro/senate", [640]],
  ["professional/hra.jpg", "pro/hra", [640]],
  ["professional/coach.jpg", "pro/coach", [640]],
  ["professional/rcm.jpg", "pro/rcm", [640]],

  ["creative/avra.jpg", "creative/avra", [960, 1800]],
  ["creative/pog.jpg", "creative/pog", [960, 1920]],
  ["creative/3d.jpg", "creative/voron", [960, 1280]],
  ["creative/desk.jpg", "creative/desk", [960, 1800]],
  ["creative/website.jpg", "creative/website", [960, 1920]],
  ["creative/prop.jpg", "creative/props", [960, 1920]],
  ["creative/avra-full-band.jpg", "creative/avra-band", [1100]],
  ["creative/voron-cad.png", "creative/voron-cad", [1100]],
  ["creative/pog-architecture.png", "creative/pog-architecture", [1200]],
  ["creative/aws-architecture.png", "creative/aws-architecture", [1200]],
  ["creative/PDN and raws/pc-1.jpg", "creative/pc-1", [900, 1800]],
  ["creative/PDN and raws/pc-2.jpg", "creative/pc-2", [900, 1800]],
  ["creative/PDN and raws/pc-3.jpg", "creative/pc-3", [900, 1800]],
  ["creative/PDN and raws/pc-4.jpg", "creative/pc-4", [900, 1800]],
  ["creative/PDN and raws/pc-5.jpg", "creative/pc-5", [900, 1800]],
  ["creative/PDN and raws/pc-6.jpg", "creative/pc-6", [900, 1800]],

  ["contact/bg-01.jpg", "contact/ottawa", [560]],
  ["contact/bg-02.jpg", "contact/aerial", [1920]],
];

// Logos and anything else with transparency. Sized by width, kept lossless-ish.
const GRAPHICS = [
  ["creative/pog-logo.png", "creative/pog-logo", 360],
  ["creative/voron-logo.png", "creative/voron-logo", 520],
  ["creative/avra-logo.png", "creative/avra-logo", 400],
  ["professional/dell-cert.png", "pro/cert-dell", 300],
  ["professional/dp100-cert.png", "pro/cert-dp100", 300],
  ...["zinnia", "dh", "deloitte", "cira", "dnd", "dfo", "mnp", "tbs", "uottawa",
    "accenture", "jdc", "lazicc", "ap", "telfer", "opc"]
    .map((n) => [`professional/logos/logo-${n}.png`, `logos/${n}`, 400]),
];

// The home page face. Both layers get the same crop so they line up exactly.
const FACE_CROP = { left: 250, top: 0, width: 640, height: 1000 };

async function webp(input, out, resize, quality = 80) {
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(input).rotate().resize({ ...resize, withoutEnlargement: true })
    .webp({ quality, alphaQuality: 90, effort: 6 }).toFile(out);
}

async function build() {
  await rm(OUT, { recursive: true, force: true });

  for (const [src, name, widths] of PHOTOS) {
    for (const w of widths) await webp(path.join(SRC, src), path.join(OUT, `${name}-${w}.webp`), { width: w }, 78);
  }
  for (const [src, name, w] of GRAPHICS) {
    await webp(path.join(SRC, src), path.join(OUT, `${name}.webp`), { width: w }, 90);
  }

  for (const [src, name] of [["index/dg-face-left.png", "photo"], ["index/dg-face-right.png", "vector"]]) {
    for (const w of [420, 640]) {
      await mkdir(path.join(OUT, "home"), { recursive: true });
      await sharp(path.join(SRC, src)).extract(FACE_CROP).resize({ width: w })
        .webp({ quality: 84, alphaQuality: 95, effort: 6 }).toFile(path.join(OUT, `home/${name}-${w}.webp`));
    }
  }
  // Right half of the old sprite is the paint splash. The code half is live text now.
  await sharp(path.join(SRC, "index/sprite-background.png")).extract({ left: 500, top: 0, width: 524, height: 403 })
    .webp({ quality: 85, alphaQuality: 90 }).toFile(path.join(OUT, "home/splash.webp"));

  // Brand: wordmarks and the monkey. PNG so they also work as icons everywhere.
  await mkdir(path.join(OUT, "brand"), { recursive: true });
  for (const n of ["logo-black", "logo-white"]) {
    await sharp(path.join(SRC, `shared/${n}.png`)).png({ compressionLevel: 9 }).toFile(path.join(OUT, `brand/${n}.png`));
  }
  for (const s of [32, 180, 512]) {
    await sharp(path.join(SRC, "shared/monkeydg-logo.png")).resize(s, s).png({ compressionLevel: 9 })
      .toFile(path.join(OUT, `brand/monkey-${s}.png`));
  }
  await copyFile(path.join(SRC, "shared/favicon.ico"), path.join(OUT, "brand/favicon.ico"));

  // Social card: the photo from the old mobile home page, cropped to 1200x630.
  await sharp(path.join(SRC, "index/mobile-bg.jpg")).resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, "og-card.jpg"));

  // Gallery: every photo in creative/projects gets a thumbnail and a lightbox size.
  // The *_13.jpg files are old hand-made thumbnails, so they're skipped.
  const galleryDir = path.join(SRC, "creative/projects");
  const files = (await readdir(galleryDir)).filter((f) => f.endsWith(".jpg") && !f.endsWith("_13.jpg"));
  for (const f of files) {
    const base = path.join(OUT, "gallery", f.replace(/\.jpg$/, ""));
    await webp(path.join(galleryDir, f), `${base}-480.webp`, { width: 480, height: 480, fit: "inside" }, 72);
    await webp(path.join(galleryDir, f), `${base}-1800.webp`, { width: 1800, height: 1800, fit: "inside" }, 80);
  }
  // The two gallery videos in assets/video are re-encoded by hand (sharp can't do video):
  //   ffmpeg -i <source>.mp4 -c:v libx264 -crf 25 -preset slow -c:a aac -b:a 128k -movflags +faststart <out>.mp4
}

build().then(() => console.log("images built"), (err) => { console.error(err); process.exit(1); });

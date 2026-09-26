// Builds the tool logos for the professional page: assets/img/tools/<id>.svg, full-colour logos
// from the Iconify "logos" set (CC0/MIT), Devicon for scikit-learn, and a layered BigQuery mark
// from Simple Icons. The page shows them as white silhouettes at rest and in colour on hover.
// Brand marks that are black get their light "on dark" variant, since they sit on a dark band.
// Usage: npm install && npm run icons

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import * as latest from "simple-icons";
import * as v13 from "simple-icons-13";

const require = createRequire(import.meta.url);
const logos = require("@iconify-json/logos/icons.json");
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

// [id used in the HTML, colour source, colour swaps for a dark background, default fill]
const ICONS = [
  ["python", "logos:python"],
  ["snowflake", "logos:snowflake-icon"],
  ["apacheairflow", "logos:airflow-icon", { "#4a4848": "#e8e8e8" }],
  ["googlebigquery", "bigquery"],
  ["apachespark", "logos:apache-spark", { "#3c3a3e": "#ffffff" }],
  ["pandas", "logos:pandas-icon", { "#130754": "#ffffff" }],
  ["scikitlearn", "devicon:scikitlearn/scikitlearn-original.svg", { "#010101": "#ffffff" }],
  ["tensorflow", "logos:tensorflow"],
  ["jupyter", "logos:jupyter", { "#4e4e4e": "#b5b5b5" }],
  ["tableau", "logos:tableau-icon"],
  ["looker", "logos:looker-icon"],
  ["streamlit", "logos:streamlit"],
  ["claude", "logos:claude-icon"],
  ["openai", "logos:openai-icon", {}, "#ffffff"],
  ["cursor", "logos:cursor-icon", { "#26251e": "#ffffff" }],
  ["modelcontextprotocol", "logos:model-context-protocol-icon", {}, "#ffffff"],
  ["github", "logos:github-icon", { "#161614": "#ffffff" }],
  ["amazonwebservices", "logos:aws", { "#252f3e": "#ffffff" }],
];

function simpleIcon(slug) {
  const key = `si${slug[0].toUpperCase()}${slug.slice(1)}`;
  const icon = latest[key] ?? v13[key];
  if (!icon) throw new Error(`No Simple Icon for ${slug}`);
  return icon;
}

async function colourSvg(source, swaps = {}, defaultFill) {
  let svg;
  if (source === "bigquery") {
    // No colour BigQuery mark in either set: the Simple Icons glyph in Google blue over a white
    // hexagon, so the magnifier cut-out reads white like the real logo.
    const { path: d } = simpleIcon("googlebigquery");
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 3.2l7.6 4.4v8.8L12 20.8l-7.6-4.4V7.6z"/><path fill="#4386fa" d="${d}"/></svg>`;
  } else if (source.startsWith("devicon:")) {
    svg = await readFile(require.resolve(`devicon/icons/${source.slice(8)}`), "utf8");
  } else {
    const name = source.slice(6);
    const icon = logos.icons[name] ?? logos.icons[logos.aliases[name].parent];
    const w = icon.width ?? logos.width;
    const h = icon.height ?? logos.height;
    const fill = defaultFill ? ` fill="${defaultFill}"` : "";
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${fill}>${icon.body}</svg>`;
  }
  for (const [from, to] of Object.entries(swaps)) svg = svg.replaceAll(new RegExp(from, "gi"), to);
  return svg;
}

await mkdir(path.join(ROOT, "assets/img/tools"), { recursive: true });
for (const [id, source, swaps, defaultFill] of ICONS) {
  await writeFile(path.join(ROOT, `assets/img/tools/${id}.svg`), `${await colourSvg(source, swaps, defaultFill)}\n`);
}
console.log(`tool logos: ${ICONS.length}`);

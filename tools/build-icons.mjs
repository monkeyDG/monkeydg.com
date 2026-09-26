// Builds the tool logos for the professional page.
//   assets/img/icons.svg       monochrome sprite (Simple Icons, CC0), shown at rest
//   assets/img/tools/<id>.svg  full-colour logos (Iconify "logos" set, CC0/MIT; Devicon for
//                              scikit-learn), cross-faded in on hover
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

// [id used in the HTML, Simple Icons slug, colour source, colour swaps for a dark background]
const ICONS = [
  ["python", "python", "logos:python"],
  ["snowflake", "snowflake", "logos:snowflake-icon"],
  ["apacheairflow", "apacheairflow", "logos:airflow-icon", { "#4a4848": "#e8e8e8" }],
  ["googlebigquery", "googlebigquery", "bigquery"],
  ["apachespark", "apachespark", "logos:apache-spark", { "#3c3a3e": "#ffffff" }],
  ["pandas", "pandas", "logos:pandas-icon", { "#130754": "#ffffff" }],
  ["scikitlearn", "scikitlearn", "devicon:scikitlearn/scikitlearn-original.svg", { "#010101": "#ffffff" }],
  ["tensorflow", "tensorflow", "logos:tensorflow"],
  ["jupyter", "jupyter", "logos:jupyter", { "#4e4e4e": "#b5b5b5" }],
  ["tableau", "tableau", "logos:tableau-icon"],
  ["looker", "looker", "logos:looker-icon"],
  ["streamlit", "streamlit", "logos:streamlit"],
  ["claude", "claude", "logos:claude-icon"],
  ["openai", "openai", "logos:openai-icon", {}, "#ffffff"],
  ["cursor", "cursor", "logos:cursor-icon", { "#26251e": "#ffffff" }],
  ["modelcontextprotocol", "modelcontextprotocol", "logos:model-context-protocol-icon", {}, "#ffffff"],
  ["github", "github", "logos:github-icon", { "#161614": "#ffffff" }],
  ["amazonwebservices", "amazonwebservices", "logos:aws", { "#252f3e": "#ffffff" }],
  ["discord", "discord", null],
  ["mongodb", "mongodb", null],
  ["raspberrypi", "raspberrypi", null],
  ["autodesk", "autodesk", null],
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

const symbols = [];
await mkdir(path.join(ROOT, "assets/img/tools"), { recursive: true });
for (const [id, slug, source, swaps, defaultFill] of ICONS) {
  const icon = simpleIcon(slug);
  symbols.push(`  <symbol id="${id}" viewBox="0 0 24 24"><title>${icon.title}</title><path d="${icon.path}"/></symbol>`);
  if (source) await writeFile(path.join(ROOT, `assets/img/tools/${id}.svg`), `${await colourSvg(source, swaps, defaultFill)}\n`);
}
await writeFile(path.join(ROOT, "assets/img/icons.svg"), `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join("\n")}\n</svg>\n`);
console.log(`icons: ${ICONS.length} mono, ${ICONS.filter((i) => i[2]).length} colour`);

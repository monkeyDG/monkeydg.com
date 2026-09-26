// Writes assets/img/icons.svg, a sprite of the tool logos on the professional page.
// Glyphs come from Simple Icons (CC0). The current release is used first, with v13 as a
// fallback because later versions dropped a few brands used here (Tableau, OpenAI, AWS).
// Usage: npm install && npm run icons

import { writeFile } from "node:fs/promises";
import path from "node:path";
import * as latest from "simple-icons";
import * as v13 from "simple-icons-13";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const ICONS = [
  "python", "snowflake", "apacheairflow", "googlebigquery", "apachespark", "pandas",
  "scikitlearn", "tensorflow", "jupyter", "tableau", "looker", "streamlit",
  "claude", "openai", "cursor", "modelcontextprotocol", "github", "amazonwebservices",
  "discord", "mongodb", "raspberrypi", "autodesk",
];

const symbols = ICONS.map((slug) => {
  const key = `si${slug[0].toUpperCase()}${slug.slice(1)}`;
  const icon = latest[key] ?? v13[key];
  if (!icon) throw new Error(`No Simple Icon for ${slug}`);
  return `  <symbol id="${slug}" viewBox="0 0 24 24"><title>${icon.title}</title><path d="${icon.path}"/></symbol>`;
});

await writeFile(
  path.join(ROOT, "assets/img/icons.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join("\n")}\n</svg>\n`,
);
console.log(`icons.svg: ${ICONS.length} icons`);

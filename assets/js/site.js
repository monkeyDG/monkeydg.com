// Shared behaviour for every page: mobile nav, scroll reveals, the typewriter, footer year.

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mobile navigation
const header = document.querySelector(".site-header");
const toggle = header?.querySelector(".nav-toggle");
toggle?.addEventListener("click", () => {
  const open = header.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && header?.classList.contains("is-open")) toggle.click();
});

// Reveal elements as they scroll into view. Anything with .reveal gets .is-in once.
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-in");
    revealObserver.unobserve(entry.target);
  }
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Types a list of chunks into an element, pausing after each chunk.
// chunks: [["Hi!", 800], [" My name's David."]]
function typewrite(el, chunks, { startDelay = 600, speed = 70 } = {}) {
  const text = chunks.map(([t]) => t).join("");
  el.setAttribute("aria-label", text);
  if (reducedMotion) {
    el.textContent = text;
    return Promise.resolve();
  }
  const out = document.createElement("span");
  out.setAttribute("aria-hidden", "true");
  const caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");
  el.replaceChildren(out, caret);

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  return (async () => {
    await wait(startDelay);
    for (const [chunk, pause = 0] of chunks) {
      for (const ch of chunk) {
        out.textContent += ch;
        await wait(speed * (0.6 + Math.random() * 0.8));
      }
      await wait(pause);
    }
  })();
}
window.typewrite = typewrite;

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

console.log(
  "%cHi! You opened the console, which means we'd probably get along.\n%cThe code for this site is at github.com/monkeydg/monkeydg.com",
  "font: 700 14px monospace; color: #0b7fae",
  "font: 12px monospace",
);

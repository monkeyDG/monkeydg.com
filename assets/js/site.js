// Shared behaviour for every page: mobile nav, scroll reveals, the typewriter, footer year.

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
document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom").forEach((el) => revealObserver.observe(el));

// Types a list of chunks into an element, pausing after each chunk.
// chunks: [["Hi!", 800], [" My name's David."]]
function typewrite(el, chunks, { startDelay = 600, speed = 70 } = {}) {
  const text = chunks.map(([t]) => t).join("");
  el.setAttribute("aria-label", text);
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

// Footer line: a different data joke on each page load, never the same one twice in a row.
const QUIPS = [
  "End of funnel. Thanks for not bouncing.",
  "You scrolled all the way down. In my line of work, that's a conversion.",
  "This footer is the control. There is no variant.",
  "Scroll depth: 100%. I'll mention it in my next quarterly review.",
  "Congrats, you're in the top decile of scrollers.",
  "You've reached the bottom. Session logged as highly engaged.",
  "Null hypothesis: nobody reads footers. Rejected.",
  "All models are wrong. This footer is useful.",
  "Thanks for scrolling. I've updated my prior on you.",
  "Regression to the mean says the next footer will be funnier.",
  "Refresh for another footer. It's a multi-armed bandit.",
  "This footer was chosen at random. Seeded, of course.",
  "Please don't peek at the results early.",
  "You've been assigned to the treatment group.",
  "You made it to the bottom. That's an outlier, and I'm keeping it.",
  "Outlier detected: someone who reads footers.",
  "Welcome to the long tail.",
  "Most visitors churn before this point.",
  "The median visitor didn't make it this far.",
  "This is where the funnel narrows to exactly one person.",
  "Thanks for scrolling. That's one more row in the dataset.",
  "Congratulations, you are now a data point.",
  "Achievement unlocked: 100th percentile scroll depth.",
  "Footer engagement is up 100% since you arrived.",
  "Your visit has been bucketed. Hope you like the variant.",
  "You've converged. Training complete.",
  "Loss: minimized. Scroll: maximized.",
  "SELECT * FROM footer WHERE reader = 'you';",
  "The error bars on this footer are pleasantly narrow.",
  "Survivorship bias says you're the kind of person who scrolls.",
  "Please rate your scroll on a scale of 1 to 5.",
  "Bottom reached. Firing the footer_viewed event.",
  "Please don't make me write a retention report.",
  "This footer was A/B tested on a sample of one.",
  "You scrolled. I smiled. Correlated, not necessarily causal.",
  "Your dwell time is excellent. Keep it up.",
  "Cohort of the week: people who read footers.",
  "Best viewed with a 95% confidence interval.",
  "This page was powered to detect you.",
  "There's a 95% chance you meant to scroll this far.",
  "Thanks for reading. Your confidence interval just got narrower.",
  "No cookies were harmed in the measurement of this visit.",
  "Statistically, you should have left three sections ago.",
  "Plot twist: the footer was the dependent variable all along.",
  "Your scroll passed all the sanity checks.",
  "Bottom of the page. Time to check for novelty effects.",
  "Data point collected. Thank you for your contribution to science.",
  "Bayesian update: you're 99% likely to be curious.",
  "See you in the day-7 retention cohort.",
  "This footer has been cleaned, deduplicated, and imputed.",
];
document.querySelectorAll("[data-quip]").forEach((el) => {
  let last = -1;
  try { last = Number(sessionStorage.getItem("quip") ?? -1); } catch {}
  const fresh = last >= 0 && last < QUIPS.length;
  let i = Math.floor(Math.random() * (QUIPS.length - (fresh ? 1 : 0)));
  if (fresh && i >= last) i += 1;
  el.textContent = QUIPS[i];
  try { sessionStorage.setItem("quip", i); } catch {}
});

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

console.log(
  "%cHi! You opened the console, which means we'd probably get along.\n%cThe code for this site is at github.com/monkeydg/monkeydg.com",
  "font: 700 14px monospace; color: #0b7fae",
  "font: 12px monospace",
);

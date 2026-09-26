// Professional page: the skills forest plot, the timeline progress line, the volunteering carousel.

/* ---------- Skills forest plot ---------- */
// Each skill has a point estimate and a standard deviation. The interval is est ± 1.96·sd/√n.
// "Collect more data" bumps n, which tightens the intervals and jiggles the estimates a little.
(() => {
  const forest = document.getElementById("forest");
  if (!forest) return;

  const MAX_N = 12;
  const notes = {
    1: "n = 1. Point estimates with 95% intervals.",
    2: "n = 2. Twice the evidence, same guy.",
    3: "n = 3. Getting tighter.",
    5: "n = 5. Diminishing returns now, since the width only shrinks with √n.",
    8: "n = 8. Honestly, at this point you could just call my references.",
    [MAX_N]: `n = ${MAX_N}. That's all the data there is. References available on request.`,
  };
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

  const rows = [...forest.querySelectorAll("li")].map((li) => {
    const track = document.createElement("span");
    track.className = "forest-track";
    track.innerHTML = '<span class="forest-ci"></span><span class="forest-dot"></span>';
    const num = document.createElement("span");
    num.className = "forest-num";
    li.append(track, num);
    const truth = Number(li.dataset.est);
    return { li, truth, est: truth, sd: Number(li.dataset.sd), ci: track.firstChild, dot: track.lastChild, num };
  });

  let n = 1;
  function draw() {
    for (const r of rows) {
      const half = (1.96 * r.sd) / Math.sqrt(n);
      const lo = clamp(r.est - half);
      const hi = clamp(r.est + half);
      r.ci.style.left = `${lo * 100}%`;
      r.ci.style.width = `${(hi - lo) * 100}%`;
      r.dot.style.left = `${r.est * 100}%`;
      r.num.innerHTML = `<b>${r.est.toFixed(2)}</b> <span class="forest-range">[${lo.toFixed(2)}, ${hi.toFixed(2)}]</span>`;
    }
    forest.querySelector(".forest-note").textContent = notes[n] ?? `n = ${n}.`;
  }

  const more = forest.querySelector(".forest-more");
  more.addEventListener("click", () => {
    if (n >= MAX_N) return;
    n++;
    for (const r of rows) r.est = clamp(r.truth + (gauss() * r.sd) / Math.sqrt(n) / 2);
    draw();
    if (n >= MAX_N) {
      more.disabled = true;
      more.textContent = "out of data";
    }
  });

  draw();
})();

/* ---------- Timeline: on phones the older roles start folded away (see professional.css) ---------- */
(() => {
  const timeline = document.getElementById("timeline");
  const more = document.querySelector(".timeline-more");
  more?.addEventListener("click", () => {
    timeline.classList.remove("is-collapsed");
    more.hidden = true;
  });
})();

/* ---------- Volunteering carousel: arrows, and it advances on its own ---------- */
(() => {
  const track = document.getElementById("carousel");
  if (!track) return;
  const [prev, next] = document.querySelectorAll(".carousel-btn");
  const INTERVAL = 4500;
  let timer = null;
  let paused = false;
  let visible = false;

  const atEnd = () => track.scrollLeft + track.clientWidth > track.scrollWidth - 8;

  function step(dir) {
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" });
  }
  function sync() {
    prev.disabled = track.scrollLeft < 8;
    next.disabled = atEnd();
  }
  // Wraps back to the first card after the last one.
  function advance() {
    if (paused || !visible || document.hidden) return;
    if (atEnd()) track.scrollTo({ left: 0, behavior: "smooth" });
    else step(1);
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(advance, INTERVAL);
  }

  prev.addEventListener("click", () => { step(-1); restart(); });
  next.addEventListener("click", () => { step(1); restart(); });
  track.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);

  // Hold still while someone is reading or swiping.
  track.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") paused = true; });
  track.addEventListener("pointerleave", () => { paused = false; });
  track.addEventListener("pointerdown", () => { paused = true; });
  track.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") { paused = false; restart(); } });
  track.addEventListener("focusin", () => { paused = true; });
  track.addEventListener("focusout", () => { paused = false; });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.4 }).observe(track);

  sync();
  restart();
})();

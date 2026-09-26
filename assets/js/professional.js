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

/* ---------- Volunteering slideshow, like the original: advances on its own, dots to jump ---------- */
(() => {
  const stage = document.getElementById("vol");
  if (!stage) return;
  const slides = [...stage.querySelectorAll(".vol-slide")];
  const dotsBox = document.querySelector(".vol-dots");
  const INTERVAL = 8000;
  let current = 0;
  let timer = null;

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Slide ${i + 1}`);
    b.addEventListener("click", () => { go(i); restart(); });
    dotsBox.append(b);
    return b;
  });

  function go(i) {
    slides[current].classList.remove("is-current");
    current = (i + slides.length) % slides.length;
    slides[current].querySelector("img").loading = "eager";
    slides[current].classList.add("is-current");
    dots.forEach((d, j) => d.setAttribute("aria-selected", j === current));
    slides[(current + 1) % slides.length].querySelector("img").loading = "eager";
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), INTERVAL);
  }

  // Swipe on phones.
  let x0 = null;
  stage.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  stage.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) { go(current + (dx < 0 ? 1 : -1)); restart(); }
  });
  stage.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") clearInterval(timer); });
  stage.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") restart(); });

  // The first slide animates in when the band scrolls into view.
  slides[0].classList.remove("is-current");
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    go(0);
    restart();
  }, { threshold: 0.3 });
  io.observe(stage);
})();

// Hero widget: a simulated A/B test whose Bayesian posteriors update live.
//
// Each arm's conversion rate gets a Beta(1 + conversions, 1 + misses) posterior.
// Traffic arrives on a fixed schedule (a fixed-horizon test, so no peeking-based
// early stopping); the verdict is only read once the planned sample is reached.
(() => {
  "use strict";

  const widget = document.querySelector("[data-experiment]");
  if (!widget) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 460;
  const H = 210;
  const PAD = { top: 26, right: 8, bottom: 24, left: 8 };
  const SAMPLES = 140;
  const TICK_MS = 55;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Visitors per arm after each tick: slow at first so early uncertainty is visible.
// 80k per arm gives ~80% power for a 5% relative lift on a ~4.5% baseline.
  const SCHEDULE = [];
  for (let n = 0; n < 80000; ) {
    n = Math.min(80000, Math.round(n * 1.042 + 24));
    SCHEDULE.push(n);
  }

  /* Maths ------------------------------------------------------------------ */
  const LANCZOS = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  function lgamma(z) {
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1;
    let x = LANCZOS[0];
    for (let i = 1; i < 9; i++) x += LANCZOS[i] / (z + i);
    const t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  const betaPdf = (x, a, b, lnB) => Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lnB);

  // Abramowitz–Stegun approximation of the standard normal CDF.
  function phi(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  function gaussian() {
    let u = 0;
    while (u === 0) u = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
  }

  function binomial(n, p) {
    if (n < 40) {
      let k = 0;
      for (let i = 0; i < n; i++) if (Math.random() < p) k++;
      return k;
    }
    const k = Math.round(n * p + Math.sqrt(n * p * (1 - p)) * gaussian());
    return Math.max(0, Math.min(n, k));
  }

  function posterior(conversions, visitors) {
    const a = 1 + conversions;
    const b = 1 + visitors - conversions;
    const mean = a / (a + b);
    const variance = (a * b) / ((a + b) ** 2 * (a + b + 1));
    return { a, b, mean, sd: Math.sqrt(variance), variance, lnB: lgamma(a) + lgamma(b) - lgamma(a + b) };
  }

  // Draws a scenario: usually a real effect, sometimes a null or a regression.
  function scenario() {
    const base = 0.035 + Math.random() * 0.02;
    const roll = Math.random();
    const lift = roll < 0.55 ? 0.05 + Math.random() * 0.07 : roll < 0.75 ? -(0.04 + Math.random() * 0.05) : (Math.random() - 0.5) * 0.01;
    return { pA: base, pB: base * (1 + lift), lift };
  }

  /* Formatting -------------------------------------------------------------- */
  const pct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;
  const signed = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}%`;
  const int = new Intl.NumberFormat("en-US");

  function niceStep(range) {
    const target = range / 4;
    const steps = [0.0005, 0.001, 0.002, 0.0025, 0.005, 0.01, 0.02, 0.025, 0.05];
    return steps.find((s) => s >= target) || 0.05;
  }

  /* DOM --------------------------------------------------------------------- */
  const svg = widget.querySelector("[data-exp-chart] svg");
  const chartBox = widget.querySelector("[data-exp-chart]");
  const tip = widget.querySelector("[data-exp-tip]");
  const spark = widget.querySelector("[data-exp-spark]");
  const verdict = widget.querySelector("[data-exp-verdict]");
  const verdictText = verdict.querySelector("span");
  const stat = (name) => widget.querySelector(`[data-stat="${name}"]`);
  const nOut = stat("n");
  const liftOut = stat("lift");
  const probOut = stat("prob");

  const el = (tag, attrs = {}, parent = svg) => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    parent.appendChild(node);
    return node;
  };

  const grid = el("g");
  const axis = el("g", { class: "axis" });
  el("line", { x1: PAD.left, x2: W - PAD.right, y1: H - PAD.bottom, y2: H - PAD.bottom }, axis);
  const tickGroup = el("g", {}, axis);
  const areaA = el("path", { class: "area-a" });
  const areaB = el("path", { class: "area-b" });
  const lineA = el("path", { class: "line-a" });
  const lineB = el("path", { class: "line-b" });
  const labelA = el("text", { class: "direct-label", "text-anchor": "middle" });
  const labelB = el("text", { class: "direct-label", "text-anchor": "middle" });
  labelA.textContent = "Control";
  labelB.textContent = "Variant";
  // Hidden until the first render gives them a position.
  labelA.setAttribute("visibility", "hidden");
  labelB.setAttribute("visibility", "hidden");
  const cross = el("line", { class: "crosshair", y1: PAD.top - 6, y2: H - PAD.bottom, visibility: "hidden" });
  const markA = el("circle", { class: "marker", r: 4, fill: "var(--series-a)", visibility: "hidden" });
  const markB = el("circle", { class: "marker", r: 4, fill: "var(--series-b)", visibility: "hidden" });

  const sparkThreshold = el("line", { class: "spark-threshold", x1: 0, x2: W, y1: 2.6, y2: 2.6 }, spark);
  const sparkLine = el("path", { class: "spark-line", "vector-effect": "non-scaling-stroke" }, spark);
  void sparkThreshold;

  /* State ------------------------------------------------------------------- */
  let truth;
  let step;
  let arms;
  let history;
  let view = { lo: 0, hi: 0.12, ymax: 1 };
  let timer = null;
  let visible = false;
  let hoverX = null;
  let finished = false;

  function reset() {
    truth = scenario();
    step = 0;
    arms = { nA: 0, cA: 0, nB: 0, cB: 0 };
    history = [];
    finished = false;
    view = { lo: 0, hi: 0.12, ymax: 1 };
    verdict.dataset.state = "running";
    verdictText.textContent = "Collecting data…";
  }

  function advance() {
    const n = SCHEDULE[step];
    const add = n - arms.nA;
    arms.cA += binomial(add, truth.pA);
    arms.cB += binomial(add, truth.pB);
    arms.nA = arms.nB = n;
    step++;
  }

  function summarize() {
    const A = posterior(arms.cA, arms.nA);
    const B = posterior(arms.cB, arms.nB);
    const prob = phi((B.mean - A.mean) / Math.sqrt(A.variance + B.variance));
    // Delta-method interval for relative lift B/A − 1.
    const lift = B.mean / A.mean - 1;
    const liftSd = Math.sqrt(B.variance / A.mean ** 2 + (B.mean ** 2 * A.variance) / A.mean ** 4);
    return { A, B, prob, lift, lo: lift - 1.96 * liftSd, hi: lift + 1.96 * liftSd };
  }

  /* Rendering --------------------------------------------------------------- */
  const sx = (x) => PAD.left + ((x - view.lo) / (view.hi - view.lo)) * (W - PAD.left - PAD.right);
  const sy = (d) => H - PAD.bottom - (d / view.ymax) * (H - PAD.top - PAD.bottom);
  const invX = (px) => view.lo + ((px - PAD.left) / (W - PAD.left - PAD.right)) * (view.hi - view.lo);

  function curve(post) {
    const pts = [];
    let peak = { x: 0, d: 0 };
    for (let i = 0; i <= SAMPLES; i++) {
      const x = view.lo + ((view.hi - view.lo) * i) / SAMPLES;
      const d = x <= 0 || x >= 1 ? 0 : betaPdf(x, post.a, post.b, post.lnB);
      if (d > peak.d) peak = { x, d };
      pts.push([sx(x), sy(d)]);
    }
    const line = "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L");
    const base = sy(0).toFixed(1);
    const area = `${line}L${pts[pts.length - 1][0].toFixed(1)},${base}L${pts[0][0].toFixed(1)},${base}Z`;
    return { line, area, peak };
  }

  function render(s, animate = true) {
    // Ease the view window toward the region where the posteriors live.
    const spread = Math.max(s.A.sd, s.B.sd);
    const lo = Math.max(0, Math.min(s.A.mean, s.B.mean) - 4.2 * spread);
    const hi = Math.max(s.A.mean, s.B.mean) + 4.2 * spread;
    const peakA = betaPdf(s.A.mean, s.A.a, s.A.b, s.A.lnB);
    const peakB = betaPdf(s.B.mean, s.B.a, s.B.b, s.B.lnB);
    const ymax = Math.max(peakA, peakB) * 1.08;
    const k = animate ? 0.22 : 1;
    view.lo += (lo - view.lo) * k;
    view.hi += (hi - view.hi) * k;
    view.ymax += (ymax - view.ymax) * k;

    const cA = curve(s.A);
    const cB = curve(s.B);
    areaA.setAttribute("d", cA.area);
    lineA.setAttribute("d", cA.line);
    areaB.setAttribute("d", cB.area);
    lineB.setAttribute("d", cB.line);

    // Direct labels above each peak, nudged apart when the curves overlap.
    let xa = sx(cA.peak.x);
    let xb = sx(cB.peak.x);
    const gap = 64 - Math.abs(xa - xb);
    if (gap > 0) {
      const dir = xa <= xb ? 1 : -1;
      xa -= (dir * gap) / 2;
      xb += (dir * gap) / 2;
    }
    const clampX = (x) => Math.max(PAD.left + 26, Math.min(W - PAD.right - 26, x));
    labelA.setAttribute("x", clampX(xa));
    labelA.setAttribute("y", Math.max(12, sy(cA.peak.d) - 8));
    labelB.setAttribute("x", clampX(xb));
    labelB.setAttribute("y", Math.max(12, sy(cB.peak.d) - 8));
    labelA.removeAttribute("visibility");
    labelB.removeAttribute("visibility");

    // Axis ticks and dotted gridlines.
    const stepSize = niceStep(view.hi - view.lo);
    const digits = stepSize < 0.001 ? 2 : stepSize < 0.01 ? 1 : 0;
    tickGroup.replaceChildren();
    grid.replaceChildren();
    for (let t = Math.ceil(view.lo / stepSize) * stepSize; t <= view.hi; t += stepSize) {
      const x = sx(t);
      if (x < PAD.left + 14 || x > W - PAD.right - 14) continue;
      el("line", { class: "gridline", x1: x, x2: x, y1: PAD.top - 6, y2: H - PAD.bottom }, grid);
      el("line", { x1: x, x2: x, y1: H - PAD.bottom, y2: H - PAD.bottom + 4 }, tickGroup);
      el("text", { x, y: H - 6, "text-anchor": "middle" }, tickGroup).textContent = pct(t, digits);
    }

    // Stats.
    nOut.textContent = int.format(arms.nA);
    liftOut.innerHTML = `${signed(s.lift)}<small>[${signed(s.lo)}, ${signed(s.hi)}]</small>`;
    probOut.textContent = pct(s.prob);

    // Sparkline of P(variant > control) across the run.
    const total = SCHEDULE.length - 1;
    sparkLine.setAttribute(
      "d",
      "M" + history.map((p, i) => `${((i / total) * W).toFixed(1)},${(33 - p * 32).toFixed(1)}`).join("L")
    );

    if (hoverX !== null) drawHover(s);
  }

  function drawHover(s) {
    const x = Math.max(view.lo, Math.min(view.hi, invX(hoverX)));
    const px = sx(x);
    const dA = betaPdf(x, s.A.a, s.A.b, s.A.lnB);
    const dB = betaPdf(x, s.B.a, s.B.b, s.B.lnB);
    cross.setAttribute("x1", px);
    cross.setAttribute("x2", px);
    markA.setAttribute("cx", px);
    markA.setAttribute("cy", sy(dA));
    markB.setAttribute("cx", px);
    markB.setAttribute("cy", sy(dB));
    [cross, markA, markB].forEach((n) => n.setAttribute("visibility", "visible"));

    const below = (post) => pct(phi((x - post.mean) / post.sd), 0);
    tip.innerHTML =
      `<div class="tip-x">conversion rate ${pct(x, 2)}</div>` +
      `<div class="tip-row"><span><i class="swatch"></i>Control</span><span>P(rate &lt; x) <b>${below(s.A)}</b></span></div>` +
      `<div class="tip-row"><span><i class="swatch swatch--b"></i>Variant</span><span>P(rate &lt; x) <b>${below(s.B)}</b></span></div>`;
    const scale = chartBox.clientWidth / W;
    const left = Math.max(80, Math.min(chartBox.clientWidth - 80, px * scale));
    tip.style.left = `${left}px`;
    tip.style.top = `${Math.min(sy(Math.max(dA, dB)), H - PAD.bottom - 30) * scale}px`;
    tip.classList.add("is-visible");
  }

  function hideHover() {
    hoverX = null;
    tip.classList.remove("is-visible");
    [cross, markA, markB].forEach((n) => n.setAttribute("visibility", "hidden"));
  }

  function finish(s) {
    finished = true;
    const truthText = `True simulated lift: ${signed(truth.lift)}.`;
    if (s.prob >= 0.95) {
      verdict.dataset.state = "win";
      verdictText.textContent = `Ship it: variant wins, ${signed(s.lift)} lift. ${truthText}`;
    } else if (s.prob <= 0.05) {
      verdict.dataset.state = "loss";
      verdictText.textContent = `Keep control: the variant hurts conversion. ${truthText}`;
    } else {
      verdict.dataset.state = "idle";
      verdictText.textContent = `Inconclusive: no clear winner. ${truthText}`;
    }
  }

  /* Loop -------------------------------------------------------------------- */
  function tick() {
    timer = null;
    if (!visible || document.hidden) return;
    advance();
    const s = summarize();
    history.push(s.prob);
    render(s);
    if (step < SCHEDULE.length) {
      verdictText.textContent = `Collecting data… ${int.format(arms.nA)} of ${int.format(SCHEDULE.at(-1))} visitors per arm`;
      timer = setTimeout(tick, TICK_MS);
    } else {
      // Settle the eased view onto the final posteriors.
      for (let i = 0; i < 12; i++) render(s);
      finish(s);
    }
  }

  function start() {
    clearTimeout(timer);
    reset();
    if (reduceMotion) {
      let s;
      while (step < SCHEDULE.length) {
        advance();
        s = summarize();
        history.push(s.prob);
      }
      render(s, false);
      finish(s);
      return;
    }
    tick();
  }

  function resume() {
    if (!finished && timer === null && visible) tick();
  }

  /* Events ------------------------------------------------------------------ */
  widget.querySelector("[data-exp-rerun]").addEventListener("click", start);

  svg.addEventListener("pointermove", (e) => {
    const rect = svg.getBoundingClientRect();
    hoverX = ((e.clientX - rect.left) / rect.width) * W;
    drawHover(summarize());
  });
  svg.addEventListener("pointerleave", hideHover);

  document.addEventListener("visibilitychange", resume);

  let started = false;
  new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible && !started) {
      started = true;
      setTimeout(start, reduceMotion ? 0 : 700);
    } else {
      resume();
    }
  }, { threshold: 0.1 }).observe(widget);
})();

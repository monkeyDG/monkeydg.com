// A simulated A/B test with Bayesian posteriors that update live.
//
// Each arm's conversion rate gets a Beta(1 + conversions, 1 + misses) posterior. Traffic
// arrives on a fixed schedule up to a planned sample size (80k per arm, about 80% power
// for a 5% relative lift on a ~4.5% baseline). It's a fixed-horizon test, so the verdict
// is only read at the end. The "peek" button explains why, and what setup would allow it.
(() => {
  const widget = document.querySelector("[data-experiment]");
  if (!widget) return;

  const SVG = "http://www.w3.org/2000/svg";
  // The chart's drawing size. Narrower on phones so the axis labels stay readable.
  let W = 720;
  let H = 250;
  const PAD = { top: 30, right: 10, bottom: 30, left: 10 };
  const SAMPLES = 160;
  const TICK_MS = 55;
  const PLANNED = 80000;

  const TESTS = [
    'checkout button: "Buy" vs "Buy now"',
    "onboarding: 3 steps vs 2 steps",
    "pricing page: annual plan selected by default",
    "push notification: 9am vs 6pm",
    "signup form: optional phone field removed",
    "home screen: bigger search bar",
  ];

  // Visitors per arm after each tick. Slow at first so the early uncertainty is visible.
  const SCHEDULE = [];
  for (let n = 0; n < PLANNED; ) {
    n = Math.min(PLANNED, Math.round(n * 1.042 + 24));
    SCHEDULE.push(n);
  }

  /* ---------- Maths ---------- */

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
  const betaPdf = (x, p) => Math.exp((p.a - 1) * Math.log(x) + (p.b - 1) * Math.log(1 - x) - p.lnB);

  // Standard normal CDF (Abramowitz and Stegun 26.2.17).
  function phi(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  function gauss() {
    return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  }

  function binomial(n, p) {
    if (n < 40) {
      let k = 0;
      for (let i = 0; i < n; i++) if (Math.random() < p) k++;
      return k;
    }
    const k = Math.round(n * p + Math.sqrt(n * p * (1 - p)) * gauss());
    return Math.max(0, Math.min(n, k));
  }

  function posterior(conversions, visitors) {
    const a = 1 + conversions;
    const b = 1 + visitors - conversions;
    const mean = a / (a + b);
    const variance = (a * b) / ((a + b) ** 2 * (a + b + 1));
    return { a, b, mean, variance, sd: Math.sqrt(variance), lnB: lgamma(a) + lgamma(b) - lgamma(a + b) };
  }

  // Usually a real win, sometimes a regression, sometimes nothing at all.
  function scenario() {
    const base = 0.035 + Math.random() * 0.02;
    const roll = Math.random();
    const lift = roll < 0.55 ? 0.05 + Math.random() * 0.07
      : roll < 0.75 ? -(0.04 + Math.random() * 0.05)
      : (Math.random() - 0.5) * 0.01;
    return { pA: base, pB: base * (1 + lift), lift };
  }

  /* ---------- Formatting ---------- */

  const pct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;
  const signed = (x) => `${x >= 0 ? "+" : "-"}${Math.abs(x * 100).toFixed(1)}%`;
  const int = new Intl.NumberFormat("en-US");

  /* ---------- DOM ---------- */

  const svg = widget.querySelector("[data-exp-chart] svg");
  const chartBox = widget.querySelector("[data-exp-chart]");
  const tip = widget.querySelector("[data-exp-tip]");
  const nameOut = widget.querySelector("[data-exp-name]");
  const idOut = widget.querySelector(".exp-id");
  const status = widget.querySelector("[data-exp-status]");
  const progress = widget.querySelector("[data-exp-progress]");
  const verdict = widget.querySelector("[data-exp-verdict]");
  const peek = widget.querySelector("[data-exp-peek]");
  const stat = (name) => widget.querySelector(`[data-stat="${name}"]`);
  const nOut = stat("n");
  const liftOut = stat("lift");
  const probOut = stat("prob");

  const el = (tag, attrs = {}, parent = svg) => {
    const node = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    parent.appendChild(node);
    return node;
  };

  const grid = el("g");
  const axis = el("g", { class: "axis" });
  const baseline = el("line", {}, axis);
  const ticks = el("g", {}, axis);
  const areaA = el("path", { class: "area-a" });
  const areaB = el("path", { class: "area-b" });
  const lineA = el("path", { class: "line-a" });
  const lineB = el("path", { class: "line-b" });
  const labelA = el("text", { class: "label label-a", "text-anchor": "middle", visibility: "hidden" });
  const labelB = el("text", { class: "label label-b", "text-anchor": "middle", visibility: "hidden" });
  labelA.textContent = "control";
  labelB.textContent = "variant";
  const cross = el("line", { class: "crosshair", y1: PAD.top - 8, y2: H - PAD.bottom, visibility: "hidden" });

  /* ---------- State ---------- */

  let truth, step, arms, finished, timer = null, visible = false, hoverX = null;
  let view = { lo: 0, hi: 0.12, ymax: 1 };

  function size() {
    const narrow = chartBox.clientWidth < 520;
    W = narrow ? 380 : 720;
    H = narrow ? 230 : 250;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    for (const [k, v] of Object.entries({ x1: PAD.left, x2: W - PAD.right, y1: H - PAD.bottom, y2: H - PAD.bottom })) {
      baseline.setAttribute(k, v);
    }
    cross.setAttribute("y2", H - PAD.bottom);
  }

  function reset() {
    size();
    truth = scenario();
    step = 0;
    arms = { n: 0, cA: 0, cB: 0 };
    finished = false;
    view = { lo: 0, hi: 0.12, ymax: 1 };
    nameOut.textContent = TESTS[Math.floor(Math.random() * TESTS.length)];
    idOut.textContent = `exp_${String(Math.floor(Math.random() * 900) + 100)}`;
    status.dataset.state = "running";
    status.textContent = "running";
    peek.hidden = false;
    verdict.textContent = "Collecting data. The verdict gets read when the planned sample is in.";
  }

  function advance() {
    const n = SCHEDULE[step];
    const add = n - arms.n;
    arms.cA += binomial(add, truth.pA);
    arms.cB += binomial(add, truth.pB);
    arms.n = n;
    step++;
  }

  function summarize() {
    const A = posterior(arms.cA, arms.n);
    const B = posterior(arms.cB, arms.n);
    const prob = phi((B.mean - A.mean) / Math.sqrt(A.variance + B.variance));
    // Delta-method interval for the relative lift B/A - 1.
    const lift = B.mean / A.mean - 1;
    const sd = Math.sqrt(B.variance / A.mean ** 2 + (B.mean ** 2 * A.variance) / A.mean ** 4);
    return { A, B, prob, lift, lo: lift - 1.96 * sd, hi: lift + 1.96 * sd };
  }

  /* ---------- Rendering ---------- */

  const sx = (x) => PAD.left + ((x - view.lo) / (view.hi - view.lo)) * (W - PAD.left - PAD.right);
  const sy = (d) => H - PAD.bottom - (d / view.ymax) * (H - PAD.top - PAD.bottom);
  const invX = (px) => view.lo + ((px - PAD.left) / (W - PAD.left - PAD.right)) * (view.hi - view.lo);

  function curve(p) {
    const pts = [];
    let peak = { x: 0, d: 0 };
    for (let i = 0; i <= SAMPLES; i++) {
      const x = view.lo + ((view.hi - view.lo) * i) / SAMPLES;
      const d = x <= 0 || x >= 1 ? 0 : betaPdf(x, p);
      if (d > peak.d) peak = { x, d };
      pts.push(`${sx(x).toFixed(1)},${sy(d).toFixed(1)}`);
    }
    const line = `M${pts.join("L")}`;
    const base = sy(0).toFixed(1);
    return { line, area: `${line}L${sx(view.hi).toFixed(1)},${base}L${sx(view.lo).toFixed(1)},${base}Z`, peak };
  }

  function niceStep(range) {
    return [0.0005, 0.001, 0.002, 0.0025, 0.005, 0.01, 0.02, 0.025, 0.05].find((s) => s >= range / 5) ?? 0.05;
  }

  function render(s, ease = true) {
    // Ease the window toward wherever the posteriors live.
    const spread = Math.max(s.A.sd, s.B.sd);
    const lo = Math.max(0, Math.min(s.A.mean, s.B.mean) - 4.2 * spread);
    const hi = Math.max(s.A.mean, s.B.mean) + 4.2 * spread;
    const ymax = Math.max(betaPdf(s.A.mean, s.A), betaPdf(s.B.mean, s.B)) * 1.1;
    const k = ease ? 0.22 : 1;
    view.lo += (lo - view.lo) * k;
    view.hi += (hi - view.hi) * k;
    view.ymax += (ymax - view.ymax) * k;

    const cA = curve(s.A);
    const cB = curve(s.B);
    areaA.setAttribute("d", cA.area);
    lineA.setAttribute("d", cA.line);
    areaB.setAttribute("d", cB.area);
    lineB.setAttribute("d", cB.line);

    // Direct labels over each peak, pushed apart when the curves overlap.
    let xa = sx(cA.peak.x);
    let xb = sx(cB.peak.x);
    const overlap = 76 - Math.abs(xa - xb);
    if (overlap > 0) {
      const dir = xa <= xb ? 1 : -1;
      xa -= (dir * overlap) / 2;
      xb += (dir * overlap) / 2;
    }
    const inside = (x) => Math.max(PAD.left + 34, Math.min(W - PAD.right - 34, x));
    labelA.setAttribute("x", inside(xa));
    labelA.setAttribute("y", Math.max(14, sy(cA.peak.d) - 10));
    labelB.setAttribute("x", inside(xb));
    labelB.setAttribute("y", Math.max(14, sy(cB.peak.d) - 10));
    labelA.removeAttribute("visibility");
    labelB.removeAttribute("visibility");

    const size = niceStep(view.hi - view.lo);
    const digits = size < 0.001 ? 2 : size < 0.01 ? 1 : 0;
    ticks.replaceChildren();
    grid.replaceChildren();
    for (let t = Math.ceil(view.lo / size) * size; t <= view.hi; t += size) {
      const x = sx(t);
      if (x < PAD.left + 20 || x > W - PAD.right - 20) continue;
      el("line", { class: "gridline", x1: x, x2: x, y1: PAD.top - 8, y2: H - PAD.bottom }, grid);
      el("line", { x1: x, x2: x, y1: H - PAD.bottom, y2: H - PAD.bottom + 5 }, ticks);
      el("text", { x, y: H - 8, "text-anchor": "middle" }, ticks).textContent = pct(t, digits);
    }

    nOut.textContent = int.format(arms.n);
    liftOut.innerHTML = `${signed(s.lift)}<small>[${signed(s.lo)}, ${signed(s.hi)}]</small>`;
    probOut.textContent = pct(s.prob);
    progress.style.width = `${(arms.n / PLANNED) * 100}%`;

    if (hoverX !== null) drawHover(s);
  }

  function drawHover(s) {
    const x = Math.max(view.lo, Math.min(view.hi, invX(hoverX)));
    const px = sx(x);
    cross.setAttribute("x1", px);
    cross.setAttribute("x2", px);
    cross.setAttribute("visibility", "visible");
    const below = (p) => pct(phi((x - p.mean) / p.sd), 0);
    tip.innerHTML = `conversion rate <b>${pct(x, 2)}</b><br>P(control &lt; x) <b>${below(s.A)}</b><br>P(variant &lt; x) <b>${below(s.B)}</b>`;
    const scale = chartBox.clientWidth / W;
    tip.style.left = `${Math.max(100, Math.min(chartBox.clientWidth - 100, px * scale))}px`;
    tip.style.top = `${PAD.top * scale + 40}px`;
    tip.classList.add("is-visible");
  }

  function hideHover() {
    hoverX = null;
    tip.classList.remove("is-visible");
    cross.setAttribute("visibility", "hidden");
  }

  function finish(s) {
    finished = true;
    peek.hidden = true;
    const truthText = `The true simulated lift was ${signed(truth.lift)}.`;
    if (s.prob >= 0.95) {
      status.dataset.state = "win";
      status.textContent = "ship it";
      verdict.innerHTML = `<b>Ship it.</b> The variant wins with a ${signed(s.lift)} lift and a ${pct(s.prob)} chance of beating control. ${truthText}`;
    } else if (s.prob <= 0.05) {
      status.dataset.state = "loss";
      status.textContent = "keep control";
      verdict.innerHTML = `<b>Keep control.</b> The variant hurts conversion (${signed(s.lift)}). ${truthText} Good thing we tested it.`;
    } else {
      status.dataset.state = "flat";
      status.textContent = "inconclusive";
      verdict.innerHTML = `<b>Inconclusive.</b> No clear winner at this sample size. ${truthText} This happens more than people think.`;
    }
  }

  /* ---------- Loop ---------- */

  function tick() {
    timer = null;
    if (!visible || document.hidden) return;
    advance();
    const s = summarize();
    render(s);
    if (step < SCHEDULE.length) {
      timer = setTimeout(tick, TICK_MS);
    } else {
      for (let i = 0; i < 14; i++) render(s);
      finish(s);
    }
  }

  function start() {
    clearTimeout(timer);
    timer = null;
    reset();
    tick();
  }

  function resume() {
    if (!finished && timer === null && visible && truth) tick();
  }

  /* ---------- Events ---------- */

  widget.querySelector("[data-exp-rerun]").addEventListener("click", start);

  peek.addEventListener("click", () => {
    verdict.innerHTML = "<b>This one's a fixed-horizon test.</b> Checking it early and stopping when it looks good inflates the false positive rate. If you want to peek, set it up as a sequential test instead (an mSPRT with always-valid confidence intervals, for example), which lets you check the results as often as you like.";
  });

  svg.addEventListener("pointermove", (e) => {
    if (!truth) return;
    const box = svg.getBoundingClientRect();
    hoverX = ((e.clientX - box.left) / box.width) * W;
    drawHover(summarize());
  });
  svg.addEventListener("pointerleave", hideHover);
  document.addEventListener("visibilitychange", resume);

  let started = false;
  new IntersectionObserver((entries) => {
    visible = entries.at(-1).isIntersecting;
    if (visible && !started) {
      started = true;
      setTimeout(start, 500);
    } else {
      resume();
    }
  }, { threshold: 0.1 }).observe(widget);
})();

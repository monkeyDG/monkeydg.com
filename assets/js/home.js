// Home page: the split face follows the mouse. The side you're on takes over the portrait,
// so hovering left shows the photo (professional) and hovering right shows the illustration
// (creative). Clicking either half opens that portfolio. On phones, touching a side does the same.

const stage = document.getElementById("stage");
const readout = document.getElementById("seam-value");
const sideLinks = [...document.querySelectorAll("[data-side]")];
const small = window.matchMedia("(max-width: 900px)");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let split = 0.5;      // what's drawn
let target = 0.5;     // where it's heading
let running = false;
let touched = false;  // the visitor has taken over from the intro / idle sway
let swayStart = 0;
let activeSide = null; // "1" = professional, "0" = creative

const clamp = (v) => Math.min(1, Math.max(0, v));

function frame(now) {
  if (!touched && small.matches && !calm) {
    // Idle sway on phones so it's obvious the portrait does something.
    target = 0.5 + 0.28 * Math.sin((now - swayStart) / 900);
  }
  split += (target - split) * 0.085;
  if (Math.abs(target - split) < 0.0008) split = target;

  stage.style.setProperty("--split", split.toFixed(4));
  readout.textContent = split.toFixed(2);
  // Nothing is highlighted while the intro or idle sway is driving the seam. Once the visitor
  // takes over, exactly one side is lit, with a little hysteresis so it doesn't flicker.
  const next = !touched ? null : split > 0.53 ? "1" : split < 0.47 ? "0" : activeSide ?? (split >= 0.5 ? "1" : "0");
  if (next !== activeSide) {
    activeSide = next;
    for (const a of sideLinks) a.classList.toggle("is-active", a.dataset.side === activeSide);
  }

  running = split !== target || (!touched && small.matches && !calm);
  if (running) requestAnimationFrame(frame);
}

function aim(value) {
  target = clamp(value);
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}

function takeOver() {
  if (touched) return;
  touched = true;
  stage.classList.add("is-live");
}

// Desktop: the whole window is the control surface, like the original.
window.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse" || small.matches) return;
  takeOver();
  const t = e.clientX / window.innerWidth;
  aim((0.78 - t) / 0.56);
});

// Phones and tablets: same idea as the mouse. Touch or drag on a side and that side takes over,
// and the matching button below lights up.
const face = document.getElementById("face");
function dragTo(e) {
  const box = face.getBoundingClientRect();
  const t = (e.clientX - box.left) / box.width;
  aim((0.8 - t) / 0.6);
}
stage.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && !small.matches) return;
  takeOver();
  stage.setPointerCapture(e.pointerId);
  dragTo(e);
});
stage.addEventListener("pointermove", (e) => {
  if (stage.hasPointerCapture(e.pointerId)) dragTo(e);
});

// Keyboard users get the same effect by focusing a side.
for (const a of sideLinks) {
  a.addEventListener("focus", () => { takeOver(); aim(Number(a.dataset.side)); });
}

// Intro: once the portrait has loaded, sweep the seam across once so the trick is obvious.
function intro() {
  stage.classList.add("is-live");
  if (calm) return;
  if (small.matches) {
    swayStart = performance.now();
    aim(0.5);
    return;
  }
  const steps = [[0.86, 500], [0.14, 1300], [0.5, 2100]];
  for (const [value, delay] of steps) {
    setTimeout(() => { if (!touched) aim(value); }, delay);
  }
}

const photo = stage.querySelector(".face-photo");
(photo.complete ? Promise.resolve() : new Promise((r) => photo.addEventListener("load", r, { once: true })))
  .then(() => setTimeout(intro, 900));

const hello = document.getElementById("hello");
typewrite(hello, small.matches ? [["Hi!", 800], [" I'm David."]] : [["Hi!", 800], [" My name's David."]], { startDelay: 700 });

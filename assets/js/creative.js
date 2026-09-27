// Creative page: the hero slideshow, YouTube facade, the lazy Discord embed, the PC photo
// carousel, and the gallery lightbox.

/* ---------- Hero slideshow ---------- */
// Same mechanics as the original: the current slide gets .is-current and its neighbours get
// .is-prev / .is-next, and CSS does the slide-past-and-zoom transition between them.
(() => {
  const show = document.getElementById("show");
  if (!show) return;
  const slides = [...show.querySelectorAll(".slide")];
  const dotsBox = show.querySelector(".show-dots");
  const DURATION = 7500;
  const LOCK = 1200; // matches the CSS transition, so clicks can't pile up
  let current = 0;
  let busy = false;
  let timer = null;

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Slide ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dotsBox.append(b);
    return b;
  });

  function go(i, force = false) {
    if (busy && !force) return;
    busy = true;
    setTimeout(() => { busy = false; }, LOCK);
    current = (i + slides.length) % slides.length;
    const prev = (current - 1 + slides.length) % slides.length;
    const next = (current + 1) % slides.length;
    slides.forEach((s, j) => {
      s.classList.toggle("is-current", j === current);
      s.classList.toggle("is-prev", j === prev);
      s.classList.toggle("is-next", j === next && j !== prev);
      if (j === current || j === next) s.querySelector("img").loading = "eager";
    });
    dots.forEach((d, j) => d.setAttribute("aria-selected", j === current));
    restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => { if (!document.hidden) go(current + 1); }, DURATION);
  }

  show.querySelectorAll("[data-step]").forEach((b) =>
    b.addEventListener("click", () => go(current + Number(b.dataset.step))));

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, dialog")) return;
    const box = show.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) return;
    if (e.key === "ArrowRight") go(current + 1);
    if (e.key === "ArrowLeft") go(current - 1);
  });

  let x0 = null;
  show.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") x0 = e.clientX; });
  show.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
  });

  go(0, true);
})();

/* ---------- YouTube: load the player only when someone asks for it ---------- */
document.querySelectorAll("[data-yt]").forEach((button) => {
  button.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.yt}?autoplay=1&rel=0`;
    frame.title = "AVRA on YouTube";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    button.replaceChildren(frame);
    button.removeAttribute("aria-label");
  }, { once: true });
});

/* ---------- The live POG Discord, loaded when it gets close to the screen ---------- */
(() => {
  const box = document.getElementById("discord");
  if (!box) return;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    const widget = document.createElement("widgetbot");
    widget.setAttribute("server", box.dataset.server);
    widget.setAttribute("channel", box.dataset.channel);
    widget.setAttribute("width", "100%");
    widget.setAttribute("height", "100%");
    box.append(widget);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/html-embed";
    script.async = true;
    script.onerror = () => {
      box.querySelector(".discord-loading").textContent = "Discord didn't load. It might be blocked on your network.";
    };
    document.body.append(script);
  }, { rootMargin: "600px 0px" });
  io.observe(box);
})();

/* ---------- PC builds: one photo per screen, with the same arrows and squares as the slideshow ---------- */
(() => {
  const track = document.getElementById("pc-track");
  if (!track) return;
  const section = track.closest(".pc");
  const count = track.children.length;
  const index = () => Math.round(track.scrollLeft / track.clientWidth);
  const goTo = (i) => track.scrollTo({ left: ((i + count) % count) * track.clientWidth, behavior: "smooth" });

  section.querySelectorAll(".show-arrows button").forEach((b) =>
    b.addEventListener("click", () => goTo(index() + Number(b.dataset.dir))));

  const dotsBox = section.querySelector(".show-dots");
  const dots = [...track.children].map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Photo ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsBox.append(b);
    return b;
  });
  const sync = () => { const i = index(); dots.forEach((d, j) => d.setAttribute("aria-selected", j === i)); };
  track.addEventListener("scroll", sync, { passive: true });
  sync();

  // mouse drag
  let x0 = null;
  let left0 = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    x0 = e.clientX;
    left0 = track.scrollLeft;
    track.style.scrollSnapType = "none";
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (x0 !== null) track.scrollLeft = left0 - (e.clientX - x0);
  });
  const drop = (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    track.style.scrollSnapType = "";
    const from = Math.round(left0 / track.clientWidth);
    goTo(Math.abs(dx) > 60 ? from + (dx < 0 ? 1 : -1) : from);
  };
  track.addEventListener("pointerup", drop);
  track.addEventListener("pointercancel", drop);
})();

/* ---------- Gallery: "show all" on phones, and the lightbox ---------- */
(() => {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;
  const more = document.querySelector(".gallery-more");
  more?.addEventListener("click", () => {
    grid.classList.remove("is-collapsed");
    more.hidden = true;
  });

  const box = document.getElementById("lightbox");
  const stage = box.querySelector(".lightbox-stage");
  const title = box.querySelector(".lightbox-title");
  const counter = box.querySelector(".lightbox-count");
  let list = [];
  let index = 0;

  function show(i) {
    index = (i + list.length) % list.length;
    const link = list[index];
    let media;
    if (link.hasAttribute("data-video")) {
      media = document.createElement("video");
      media.src = link.href;
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
      media.poster = link.querySelector("img").src;
    } else {
      media = document.createElement("img");
      media.src = link.href;
      media.alt = link.dataset.caption;
    }
    stage.replaceChildren(media);
    title.textContent = link.dataset.caption;
    counter.textContent = `${String(index + 1).padStart(2, "0")}/${String(list.length).padStart(2, "0")}`;
  }

  grid.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    e.preventDefault();
    list = [...grid.querySelectorAll("a")].filter((a) => a.offsetParent !== null);
    box.showModal();
    show(list.indexOf(link));
  });

  box.querySelectorAll("[data-step]").forEach((b) =>
    b.addEventListener("click", () => show(index + Number(b.dataset.step))));
  box.querySelector(".lightbox-close").addEventListener("click", () => box.close());
  box.addEventListener("close", () => stage.replaceChildren());
  box.addEventListener("click", (e) => { if (e.target === box || e.target === stage) box.close(); });
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(index + 1);
    if (e.key === "ArrowLeft") show(index - 1);
  });

  let x0 = null;
  stage.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  stage.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
})();

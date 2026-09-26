// Creative page: hero slideshow, YouTube facade, lazy Discord embed, PC photo strip,
// gallery filters and lightbox.

const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Hero slideshow ---------- */
(() => {
  const show = document.getElementById("show");
  if (!show) return;
  const slides = [...show.querySelectorAll(".slide")];
  const count = show.querySelector(".show-count b");
  const barsBox = show.querySelector(".show-bars");
  const DURATION = 7000;

  const bars = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Slide ${i + 1}`);
    b.addEventListener("click", () => go(i));
    barsBox.append(b);
    return b;
  });

  let current = 0;
  let elapsed = 0;
  let last = performance.now();
  let paused = false;
  let visible = true;

  function go(i) {
    slides[current].classList.remove("is-current");
    current = (i + slides.length) % slides.length;
    const slide = slides[current];
    slide.querySelector("img").loading = "eager";
    // restart the slow zoom
    slide.classList.remove("is-current");
    void slide.offsetWidth;
    slide.classList.add("is-current");
    count.textContent = String(current + 1).padStart(2, "0");
    bars.forEach((b, j) => {
      b.style.setProperty("--fill", j < current ? 1 : 0);
      b.setAttribute("aria-selected", j === current);
    });
    // warm up the next image so it's ready when we get there
    slides[(current + 1) % slides.length].querySelector("img").loading = "eager";
    elapsed = 0;
  }

  function frame(now) {
    const dt = now - last;
    last = now;
    if (!paused && visible && !document.hidden && !calm) {
      elapsed += dt;
      bars[current].style.setProperty("--fill", Math.min(1, elapsed / DURATION));
      if (elapsed >= DURATION) go(current + 1);
    }
    requestAnimationFrame(frame);
  }

  show.querySelectorAll("[data-step]").forEach((b) =>
    b.addEventListener("click", () => go(current + Number(b.dataset.step))));

  show.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") paused = true; });
  show.addEventListener("pointerleave", () => { paused = false; });
  show.addEventListener("focusin", () => { paused = true; });
  show.addEventListener("focusout", () => { paused = false; });

  document.addEventListener("keydown", (e) => {
    if (!visible || e.target.closest("input, textarea, dialog")) return;
    if (e.key === "ArrowRight") go(current + 1);
    if (e.key === "ArrowLeft") go(current - 1);
  });

  // swipe
  let startX = null;
  show.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") startX = e.clientX; });
  show.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
  });

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(show);

  go(0);
  requestAnimationFrame(frame);
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

/* ---------- PC strip: drag to scroll with a mouse ---------- */
(() => {
  const strip = document.querySelector(".pc-strip");
  if (!strip) return;
  let x0 = null;
  let left0 = 0;
  strip.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    x0 = e.clientX;
    left0 = strip.scrollLeft;
    strip.setPointerCapture(e.pointerId);
    strip.classList.add("is-dragging");
  });
  strip.addEventListener("pointermove", (e) => {
    if (x0 !== null) strip.scrollLeft = left0 - (e.clientX - x0);
  });
  const stop = () => {
    if (x0 === null) return;
    x0 = null;
    strip.classList.remove("is-dragging");
  };
  strip.addEventListener("pointerup", stop);
  strip.addEventListener("pointercancel", stop);
})();

/* ---------- Gallery: filters and lightbox ---------- */
(() => {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;
  const items = [...grid.children];
  const filterButtons = [...document.querySelectorAll("[data-filter]")];

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const cat = button.dataset.filter;
      filterButtons.forEach((b) => b.setAttribute("aria-pressed", b === button));
      items.forEach((li) => {
        li.hidden = cat !== "all" && li.dataset.cat !== cat;
        if (!li.hidden && !calm) {
          li.style.animation = "none";
          void li.offsetWidth;
          li.style.animation = "";
        }
      });
    });
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
    list = items.filter((li) => !li.hidden).map((li) => li.querySelector("a"));
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

  let startX = null;
  stage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  stage.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
})();

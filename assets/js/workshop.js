// Workshop page: click-to-load YouTube embeds, gallery filters, and a lightbox.
(() => {
  "use strict";

  /* YouTube facades: load the iframe only when asked ----------------------- */
  document.querySelectorAll("[data-youtube]").forEach((button) => {
    button.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.className = "video-frame";
      iframe.src = `https://www.youtube-nocookie.com/embed/${button.dataset.youtube}?autoplay=1&rel=0`;
      iframe.title = button.getAttribute("aria-label").replace(/^Play /, "");
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      button.replaceWith(iframe);
      iframe.focus();
    });
  });

  /* Gallery filters ---------------------------------------------------------- */
  const gallery = document.querySelector("[data-gallery]");
  const filters = document.querySelectorAll("[data-filter]");
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const cat = button.dataset.filter;
      filters.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      gallery.querySelectorAll("[data-cat]").forEach((item) => {
        item.hidden = cat !== "all" && item.dataset.cat !== cat;
      });
    });
  });

  /* Lightbox ----------------------------------------------------------------- */
  const box = document.querySelector("[data-lightbox]");
  if (!box || typeof box.showModal !== "function") return;

  const stage = box.querySelector("[data-lightbox-stage]");
  const caption = box.querySelector("[data-lightbox-caption]");
  const counter = box.querySelector("[data-lightbox-count]");
  let items = [];
  let index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    const item = items[index];
    stage.querySelector("img, video")?.remove();

    let media;
    if (item.dataset.video) {
      media = document.createElement("video");
      media.src = item.dataset.video;
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
    } else {
      media = document.createElement("img");
      media.src = item.dataset.full;
      media.alt = item.dataset.caption || "";
      const [w, h] = (item.dataset.size || "").split("x");
      if (w) { media.width = w; media.height = h; }
    }
    stage.prepend(media);
    caption.textContent = item.dataset.caption || "";
    counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;

    // Warm the cache for the next photo.
    const next = items[(index + 1) % items.length];
    if (next?.dataset.full) new Image().src = next.dataset.full;
  }

  function open(group, item) {
    items = [...group.querySelectorAll("button:not([hidden])")].filter((b) => b.dataset.full || b.dataset.video);
    box.showModal();
    show(items.indexOf(item));
  }

  document.querySelectorAll("[data-lightbox-group]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const item = e.target.closest("button");
      if (item && (item.dataset.full || item.dataset.video)) open(group, item);
    });
  });

  box.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(index - 1));
  box.querySelector("[data-lightbox-next]").addEventListener("click", () => show(index + 1));
  box.querySelector("[data-lightbox-close]").addEventListener("click", () => box.close());
  box.addEventListener("close", () => stage.querySelector("img, video")?.remove());
  box.addEventListener("click", (e) => { if (e.target === stage || e.target === box) box.close(); });
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  // Swipe between photos on touch screens.
  let startX = null;
  stage.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();

// Shared behaviour for every page: theme, navigation, scroll reveals, and the
// small interactive touches on the home page. No dependencies.
(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* private mode: theme just won't persist */ }
    },
  };

  /* Theme ------------------------------------------------------------------ */
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      storage.set("theme", next);
      document.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    });
  });

  /* Navigation ------------------------------------------------------------- */
  const nav = document.querySelector("[data-nav]");
  const menuButton = document.querySelector("[data-menu-toggle]");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    menuButton?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
    nav.querySelectorAll(".nav__link").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  // Scrollspy: highlight the nav link for the section in view.
  const spyLinks = [...document.querySelectorAll("[data-spy]")];
  if (spyLinks.length) {
    const byId = new Map(spyLinks.map((a) => [a.hash.slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        spyLinks.forEach((a) => a.removeAttribute("aria-current"));
        byId.get(entry.target.id)?.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* Reveal on scroll ------------------------------------------------------- */
  const revealables = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        reveal.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach((el) => reveal.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }

  /* Count-up stats --------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && !reduceMotion) {
    const count = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        count.unobserve(entry.target);
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 1400;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
          if (t < 1) requestAnimationFrame(tick);
        };
        el.textContent = "0";
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => count.observe(el));
  }

  /* Timeline progress rail ------------------------------------------------- */
  const timeline = document.querySelector("[data-timeline]");
  if (timeline) {
    const roles = [...timeline.querySelectorAll(".role")];
    let queued = false;
    const update = () => {
      queued = false;
      const rect = timeline.getBoundingClientRect();
      const anchor = window.innerHeight * 0.55;
      const progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
      timeline.style.setProperty("--progress", progress.toFixed(4));
      roles.forEach((role) => role.classList.toggle("is-passed", role.getBoundingClientRect().top + 14 < anchor));
    };
    const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
  }

  /* Cursor glow on toolkit cards ------------------------------------------- */
  document.querySelectorAll("[data-glow] .tool-group").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* Carousel --------------------------------------------------------------- */
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const bar = carousel.querySelector("[data-carousel-bar]");
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 320) + 16;

    carousel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      const visible = track.clientWidth / track.scrollWidth;
      bar.style.setProperty("--w", `${visible * 100}%`);
      bar.style.setProperty("--x", `${max > 0 ? (track.scrollLeft / max) * (1 - visible) * 100 : 0}%`);
    };
    sync();
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
  });

  /* Copy to clipboard ------------------------------------------------------ */
  document.querySelectorAll("[data-copy]").forEach((button) => {
    const label = button.querySelector("span");
    const icon = button.querySelector("use");
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
      } catch {
        window.location.href = `mailto:${button.dataset.copy}`;
        return;
      }
      button.classList.add("is-copied");
      label.textContent = "Copied";
      icon.setAttribute("href", "#i-check");
      setTimeout(() => {
        button.classList.remove("is-copied");
        label.textContent = "Copy";
        icon.setAttribute("href", "#i-copy");
      }, 1800);
    });
  });

  /* Contact form ----------------------------------------------------------- */
  // Posts JSON to the AWS Lambda + SES function that emails me.
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector("[type=submit]");
    const submitHTML = submit.innerHTML;
    const messages = {
      name: "Please add your name.",
      email: "Please enter a valid email address.",
      message: "Please write a short message.",
    };

    const validate = (input) => {
      const field = input.closest(".field");
      const error = field.querySelector(".field__error");
      input.value = input.value.trimStart();
      const valid = input.checkValidity() && (!input.required || input.value.trim() !== "");
      field.classList.toggle("is-invalid", !valid);
      input.setAttribute("aria-invalid", String(!valid));
      if (error) error.textContent = valid ? "" : messages[input.name];
      return valid;
    };

    form.querySelectorAll("[required]").forEach((input) => {
      input.addEventListener("blur", () => { if (input.value) validate(input); });
      input.addEventListener("input", () => { if (input.closest(".is-invalid")) validate(input); });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const required = [...form.querySelectorAll("[required]")];
      const invalid = required.filter((input) => !validate(input));
      if (invalid.length) {
        invalid[0].focus();
        return;
      }

      const data = new FormData(form);
      submit.setAttribute("aria-busy", "true");
      submit.innerHTML = 'Sending <span class="spinner" aria-hidden="true"></span>';
      status.dataset.state = "";
      status.textContent = "";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: JSON.stringify({
            senderName: data.get("name").trim(),
            senderEmail: data.get("email").trim(),
            senderPhone: data.get("phone").trim(),
            message: data.get("message").trim(),
          }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        status.dataset.state = "success";
        status.textContent = "Thanks! Your message is on its way. I'll get back to you soon.";
      } catch {
        status.dataset.state = "error";
        status.innerHTML = 'Something went wrong. Please email me directly at <a class="link" href="mailto:david.gallo747@gmail.com">david.gallo747@gmail.com</a>.';
      } finally {
        submit.removeAttribute("aria-busy");
        submit.innerHTML = submitHTML;
      }
    });
  }

  /* Footer year ------------------------------------------------------------ */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();

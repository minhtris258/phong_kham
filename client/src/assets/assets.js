// ui-helpers.js (drop-in thay cho file cũ)
(function () {
  // HMR-safe: gom mọi listener để remove khi reload
  const listeners = [];
  const add = (el, ev, fn, opts) => {
    if (!el || !ev || !fn) return;
    el.addEventListener(ev, fn, opts);
    listeners.push(() => el.removeEventListener(ev, fn, opts));
  };

  const onReady = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn, { once: true });

  onReady(() => {
    const topbar = document.getElementById("topbar");
    const mainbar = document.getElementById("mainbar");
    const openBtn = document.getElementById("open-menu");
    const closeBtn = document.getElementById("close-menu");
    const drawer = document.getElementById("mobile-drawer");

// =========================
// MAINBAR POSITIONING
// =========================
if (mainbar) {
  const positionMainbar = () => {
    const topH = topbar ? topbar.offsetHeight || 0 : 0;
    const scrollY = window.scrollY || window.pageYOffset;

    // Khoảng offset còn lại của topbar
    const offset = topH - scrollY;

    if (offset <= 0) {
      // Đã cuộn qua hết topbar -> mainbar dính sát trên
      mainbar.style.top = "0px";
      mainbar.classList.remove("z-40");
      mainbar.classList.add("z-50");
    } else {
      // Đang cuộn trong đoạn có topbar -> mainbar trượt theo
      mainbar.style.top = offset + "px";
      mainbar.classList.remove("z-50");
      mainbar.classList.add("z-40");
    }
  };

  // Init + listeners
  positionMainbar();
  add(window, "resize", positionMainbar);
  add(window, "scroll", positionMainbar, { passive: true });

  // Theo dõi thay đổi chiều cao của topbar (vd: font load, responsive)
  if (topbar && "ResizeObserver" in window) {
    const ro = new ResizeObserver(positionMainbar);
    ro.observe(topbar);
    // cleanup
    listeners.push(() => ro.disconnect());
  }

  // cũng chạy sau khi mọi tài nguyên load xong (ảnh, font)
  add(window, "load", positionMainbar);
}


    // =========================
    // MOBILE DRAWER
    // =========================
    const showDrawer = () => {
      if (!drawer) return;
      drawer.classList.remove("translate-x-full", "opacity-0", "invisible");
      drawer.classList.add("translate-x-0", "opacity-100", "visible");
      drawer.setAttribute("aria-hidden", "false");
      // khóa cuộn nền
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };

    const hideDrawer = () => {
      if (!drawer) return;
      drawer.classList.add("translate-x-full", "opacity-0", "invisible");
      drawer.classList.remove("translate-x-0", "opacity-100", "visible");
      drawer.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };

    if (openBtn) add(openBtn, "click", showDrawer);
    if (closeBtn) add(closeBtn, "click", hideDrawer);

    // Đóng bằng ESC
    add(document, "keydown", (e) => {
      if (e.key === "Escape") hideDrawer();
    });

    // Đóng khi click link bên trong drawer
    if (drawer) {
      add(drawer, "click", (e) => {
        const a = e.target.closest("a");
        if (a) hideDrawer();
      });
    }

    // =========================
    // PARTNERS CAROUSEL
    // #partners-track, #partners-prev, #partners-next
    // =========================
    (function initPartnersCarousel() {
      const track = document.getElementById("partners-track");
      if (!track) return;

      const prev = document.getElementById("partners-prev");
      const next = document.getElementById("partners-next");

      const pageStep = () => track.clientWidth; // cuộn theo vùng nhìn

      const setDisabled = (btn, disabled) => {
        if (!btn) return;
        btn.setAttribute("aria-disabled", String(disabled));
        btn.classList.toggle("opacity-50", disabled);
        btn.classList.toggle("pointer-events-none", disabled);
      };

      const updateArrows = () => {
        const maxScroll = track.scrollWidth - track.clientWidth - 1; // chống sai số
        const atStart = track.scrollLeft <= 0;
        const atEnd = track.scrollLeft >= maxScroll;
        setDisabled(prev, atStart);
        setDisabled(next, atEnd);
      };

      const scrollPage = (dir) => {
        track.scrollBy({ left: dir * pageStep(), behavior: "smooth" });
      };

      if (prev) add(prev, "click", () => scrollPage(-1));
      if (next) add(next, "click", () => scrollPage(1));

      add(track, "scroll", updateArrows, { passive: true });
      add(window, "resize", updateArrows);

      // enable keyboard khi focus vào track
      track.setAttribute("tabindex", "0");
      add(track, "keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollPage(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollPage(1);
        }
      });

      // init
      updateArrows();
      // cũng chạy sau khi ảnh load
      add(window, "load", updateArrows);
    })();

    // =========================
    // BIO EXCERPT: Xem thêm / Thu gọn
    // #bio-text, #bio-toggle, #bio-fade (tùy chọn)
    // =========================
    (function initBioExcerpt() {
      const text = document.getElementById("bio-text");
      const btn = document.getElementById("bio-toggle");
      const fade = document.getElementById("bio-fade");
      if (!text || !btn) return;

      const clampClass = Array.from(text.classList).find((c) =>
        c.startsWith("line-clamp-")
      );
      const usingClamp = Boolean(clampClass);

      const COLLAPSED = ["max-h-[9.5rem]", "overflow-hidden"];
      const EXPANDED = ["max-h-none", "overflow-visible"];

      let expanded = false;

      const applyState = () => {
        if (usingClamp) {
          if (expanded) {
            text.classList.remove(clampClass);
            btn.textContent = "Thu gọn";
            if (fade) fade.classList.add("hidden");
          } else {
            text.classList.add(clampClass);
            btn.textContent = "…Xem thêm";
            if (fade) fade.classList.remove("hidden");
          }
        } else {
          if (expanded) {
            text.classList.remove(...COLLAPSED);
            text.classList.add(...EXPANDED);
            btn.textContent = "Thu gọn";
            if (fade) fade.classList.add("hidden");
          } else {
            text.classList.remove(...EXPANDED);
            text.classList.add(...COLLAPSED);
            btn.textContent = "…Xem thêm";
            if (fade) fade.classList.remove("hidden");
          }
        }
      };

      // init
      expanded = false;
      if (!usingClamp) text.classList.add(...COLLAPSED);
      applyState();

      add(btn, "click", () => {
        expanded = !expanded;
        applyState();
      });
    })();
  });

  // =========================
  // Vite HMR cleanup
  // =========================
  if (import.meta && import.meta.hot) {
    import.meta.hot.dispose(() => {
      // remove all event listeners đã add
      try {
        for (const off of listeners) off();
      } catch (_) {}
    });
  }
})();

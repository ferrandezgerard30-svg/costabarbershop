/* ============================================================
   LA COSTA BARBERSHOP — motor de animación (vanilla, sin libs)
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  if (window.__lc_fail) clearTimeout(window.__lc_fail); // desactiva failsafe del <head>

  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var lerp = function (a, b, n) { return a + (b - a) * n; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- Preloader ---------------- */
  function preloader() {
    var pre = $(".preloader");
    if (!pre) return;
    var done = false;
    function finish() {
      if (done) return; done = true;
      pre.classList.add("done");
      setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 950);
    }
    var min = RM ? 250 : 1150;
    var start = performance.now();
    function ready() {
      var wait = Math.max(0, min - (performance.now() - start));
      setTimeout(finish, wait);
    }
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready, { once: true });
    setTimeout(finish, 2600); // failsafe
  }

  /* ---------------- Header ---------------- */
  function header() {
    var h = $(".header");
    if (!h) return;
    var last = window.scrollY, ticking = false;
    function upd() {
      var y = window.scrollY;
      h.classList.toggle("header--solid", y > 40);
      if (!document.body.classList.contains("menu-open")) {
        if (y > last && y > 260) h.classList.add("header--hidden");
        else h.classList.remove("header--hidden");
      }
      last = y; ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  }

  /* ---------------- Menú móvil ---------------- */
  function mobileMenu() {
    var t = $(".nav-toggle"), m = $(".mobile-menu");
    if (!t || !m) return;
    function close() { m.classList.remove("open"); document.body.classList.remove("menu-open"); t.setAttribute("aria-expanded", "false"); }
    t.addEventListener("click", function () {
      var open = m.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      t.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", m).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------------- Reveal + stagger + kinetic ---------------- */
  function reveals() {
    // stagger delays
    $$("[data-stagger]").forEach(function (g) {
      var step = parseInt(g.getAttribute("data-stagger"), 10) || 70;
      $$("[data-reveal]", g).forEach(function (el, i) {
        el.style.transitionDelay = (i * step) + "ms";
      });
    });
    // kinetic split
    $$(".kinetic").forEach(function (k) {
      if (k.dataset.split) return; k.dataset.split = "1";
      var words = k.textContent.trim().split(/\s+/);
      k.textContent = "";
      words.forEach(function (w, i) {
        var outer = document.createElement("span"); outer.className = "word";
        var inner = document.createElement("span"); inner.textContent = w;
        inner.style.transitionDelay = (i * 55) + "ms";
        outer.appendChild(inner); k.appendChild(outer);
        k.appendChild(document.createTextNode(" "));
      });
    });

    var targets = $$("[data-reveal], .kinetic");
    if (!("IntersectionObserver" in window)) { targets.forEach(function (t) { t.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
    // failsafe: revela todo tras 3.5s
    setTimeout(function () { targets.forEach(function (t) { t.classList.add("in"); }); }, 3500);
  }

  /* ---------------- Contadores ---------------- */
  function counters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    function run(el) {
      var raw = el.getAttribute("data-count");
      var dec = raw.indexOf(",") > -1 || raw.indexOf(".") > -1;
      var target = parseFloat(raw.replace(",", "."));
      var dur = RM ? 0 : 1400, t0 = null;
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = clamp((ts - t0) / dur, 0, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = dec ? val.toFixed(1).replace(".", ",") : Math.round(val).toString();
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = raw;
      }
      requestAnimationFrame(frame);
      var bar = el.closest(".stat") && el.closest(".stat").querySelector(".stat__bar");
      if (bar) bar.style.width = "100%";
    }
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- Cursor propio ---------------- */
  function cursor() {
    if (!FINE || RM) return;
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    root.classList.add("has-cursor");
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, shown = false;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      if (!shown) { shown = true; dot.style.opacity = 1; ring.style.opacity = 1; }
    });
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a,button,[data-magnetic],[data-tilt],.g,.tile,input,textarea"))
        ring.classList.add("is-hover");
      else ring.classList.remove("is-hover");
    });
    window.addEventListener("mouseout", function (e) { if (!e.relatedTarget) { dot.style.opacity = 0; ring.style.opacity = 0; shown = false; } });
    (function loop() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- Botones magnéticos ---------------- */
  function magnetic() {
    if (!FINE || RM) return;
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.35;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, inside = false;
      function loop() {
        cx = lerp(cx, tx, 0.2); cy = lerp(cy, ty, 0.2);
        el.style.transform = "translate(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px)";
        if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1 || inside) raf = requestAnimationFrame(loop);
        else { el.style.transform = ""; raf = null; }
      }
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * strength;
        ty = (e.clientY - (r.top + r.height / 2)) * strength;
        inside = true; if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", function () { tx = 0; ty = 0; inside = false; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }

  /* ---------------- Tilt 3D ---------------- */
  function tilt() {
    if (!FINE || RM) return;
    $$("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 7;
      var rx = 0, ry = 0, tx = 0, ty = 0, raf = null, active = false;
      var glare = el.querySelector(".tilt-glare");
      function loop() {
        rx = lerp(rx, tx, 0.12); ry = lerp(ry, ty, 0.12);
        el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
        if (active || Math.abs(rx - tx) > 0.05 || Math.abs(ry - ty) > 0.05) raf = requestAnimationFrame(loop);
        else { el.style.transform = ""; raf = null; }
      }
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ty = (px - 0.5) * (max * 2); tx = -(py - 0.5) * (max * 2);
        if (glare) { glare.style.setProperty("--gx", (px * 100) + "%"); glare.style.setProperty("--gy", (py * 100) + "%"); }
        active = true; if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", function () { tx = 0; ty = 0; active = false; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }

  /* ---------------- Carruseles ---------------- */
  function carousels() {
    $$("[data-carousel]").forEach(function (track) {
      // Los botones pueden estar en un .head-row hermano (no dentro de .carousel-wrap),
      // así que se buscan en el contenedor común más cercano.
      var host = track.closest(".carousel-scope") || track.closest(".container") || track.closest("section") || track.parentElement;
      var prev = host.querySelector("[data-car-prev]");
      var next = host.querySelector("[data-car-next]");
      function amount() {
        var first = track.children[0];
        if (!first) return track.clientWidth;
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 16) || 16;
        return first.getBoundingClientRect().width + gap;
      }
      function update() {
        if (!prev || !next) return;
        var max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
      }
      if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -amount() * (window.innerWidth < 700 ? 1 : 1), behavior: RM ? "auto" : "smooth" }); });
      if (next) next.addEventListener("click", function () { track.scrollBy({ left: amount(), behavior: RM ? "auto" : "smooth" }); });
      track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
      window.addEventListener("resize", update);
      update();

      // drag to scroll (desktop)
      var down = false, moved = false, sx = 0, sl = 0;
      track.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch") return;
        down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
        track.classList.add("dragging");
      });
      window.addEventListener("pointermove", function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 5) moved = true;
        track.scrollLeft = sl - dx;
      });
      window.addEventListener("pointerup", function () {
        if (!down) return; down = false; track.classList.remove("dragging");
      });
      track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    });
  }

  /* ---------------- Parallax ---------------- */
  function parallax() {
    if (RM) return;
    var els = $$("[data-parallax]");
    if (!els.length) return;
    var ticking = false;
    function upd() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var off = (center - vh / 2) / vh;
        var sp = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        el.style.transform = "translate3d(0," + (off * sp * 100).toFixed(2) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---------------- Showcase sticky (cross-fade) ---------------- */
  function showcase() {
    var sc = $("[data-showcase]");
    if (!sc) return;
    var imgs = $$("[data-sc-img]", sc);
    var steps = $$("[data-sc-step]", sc);
    var tag = $("[data-sc-tag]", sc);
    var tags = (sc.getAttribute("data-sc-tags") || "").split("|");
    if (!imgs.length) return;
    var n = imgs.length, cur = -1, ticking = false;
    function setActive(i) {
      if (i === cur) return; cur = i;
      imgs.forEach(function (im, k) { im.classList.toggle("active", k === i); });
      steps.forEach(function (st, k) { st.classList.toggle("active", k === i); });
      if (tag && tags[i]) tag.textContent = tags[i];
    }
    function upd() {
      if (window.innerWidth <= 960) { ticking = false; return; }
      var r = sc.getBoundingClientRect();
      var total = sc.offsetHeight - window.innerHeight;
      var p = clamp((-r.top) / (total || 1), 0, 0.9999);
      setActive(Math.min(n - 1, Math.floor(p * n)));
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener("resize", upd);
    setActive(0); upd();
  }

  /* ---------------- Horario: día de hoy ---------------- */
  function todayHours() {
    var lists = $$("[data-hours]");
    if (!lists.length) return;
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var today = 0;
    try {
      var s = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Madrid", weekday: "short" }).format(new Date());
      today = map[s] != null ? map[s] : new Date().getDay();
    } catch (e) { today = new Date().getDay(); }
    lists.forEach(function (ul) {
      $$("li", ul).forEach(function (li) {
        if (parseInt(li.getAttribute("data-day"), 10) === today) li.classList.add("today");
      });
    });
  }

  /* ---------------- Lightbox (galería) ---------------- */
  function lightbox() {
    var items = $$("[data-lb]");
    if (!items.length) return;
    var srcs = items.map(function (it) { return it.getAttribute("data-lb"); });
    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML =
      '<button class="lb-close" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<img alt="">' +
      '<button class="lb-btn lb-next" aria-label="Siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>';
    document.body.appendChild(box);
    var img = box.querySelector("img");
    var idx = 0;
    function show(i) { idx = (i + srcs.length) % srcs.length; img.src = srcs[idx]; }
    function open(i) { show(i); box.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { box.classList.remove("open"); document.body.style.overflow = ""; }
    items.forEach(function (it, i) { it.addEventListener("click", function () { open(i); }); });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    box.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }

  /* ---------------- Filtros galería ---------------- */
  function filters() {
    var bar = $("[data-filters]");
    if (!bar) return;
    var chips = $$(".filter-chip", bar);
    var items = $$("[data-cat]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var f = chip.getAttribute("data-filter");
        items.forEach(function (it) {
          var show = f === "all" || it.getAttribute("data-cat") === f;
          it.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------------- Año footer ---------------- */
  function year() { $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); }); }

  /* ---------------- Init ---------------- */
  function init() {
    preloader(); header(); mobileMenu(); reveals(); counters();
    cursor(); magnetic(); tilt(); carousels(); parallax();
    showcase(); todayHours(); lightbox(); filters(); year();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

/* =========================================================================
   main.js — motion orchestration (anime.js v3, global window.anime)
   Feature-guarded: no anime.js OR reduced-motion => fully visible, static.
   ========================================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var anime = window.anime;
  var MOTION = !!anime && !prefersReduced;
  if (MOTION) document.documentElement.classList.add("anim-ready");

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Scroll progress + sticky nav ---- */
  var bar = $("#scroll-bar"), nav = $("#nav");
  function onScroll() {
    var h = document.documentElement;
    var y = h.scrollTop || document.body.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0).toFixed(2) + "%";
    if (nav) nav.classList.toggle("is-stuck", y > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Nav active section + sliding thumb ---- */
  var navLinks = $$(".nav__pill a[data-nav]"), thumb = $("#navthumb"), pill = $("#navpill");
  var linkById = {};
  navLinks.forEach(function (a) { linkById[a.getAttribute("data-nav")] = a; });
  function moveThumb(link) {
    if (!thumb || !pill || !link) return;
    if (getComputedStyle(pill).display === "none") { thumb.style.opacity = 0; return; }
    var lr = link.getBoundingClientRect(), pr = pill.getBoundingClientRect();
    thumb.style.opacity = 1;
    if (MOTION) anime({ targets: thumb, left: lr.left - pr.left, width: lr.width, duration: 420, easing: "easeOutExpo" });
    else { thumb.style.left = (lr.left - pr.left) + "px"; thumb.style.width = lr.width + "px"; }
  }
  function setActive(id) {
    var link = linkById[id]; if (!link) return;
    navLinks.forEach(function (a) { a.classList.remove("is-active"); });
    link.classList.add("is-active"); moveThumb(link);
  }
  if ("IntersectionObserver" in window && navLinks.length) {
    var secObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(linkById).forEach(function (id) { var s = document.getElementById(id); if (s) secObs.observe(s); });
  }
  window.addEventListener("resize", function () { var a = $(".nav__pill a.is-active"); if (a) moveThumb(a); }, { passive: true });

  /* ---- Rotating discipline title ---- */
  var ROLES = ["Data Engineer","Data Platform Engineer","Data Architect","Full-Stack / UI-UX Dev","Process-Improvement Eng"];
  var rotator = $("#rotator");
  if (rotator && !prefersReduced) {
    var idx = 0, current = rotator.querySelector(".rotator__item");
    setInterval(function () {
      idx = (idx + 1) % ROLES.length;
      if (!MOTION) { current.textContent = ROLES[idx]; return; }
      // 3D block roll: current face rotates up & away, next face rolls in from below
      anime({ targets: current, rotateX: [0, 90], duration: 300, easing: "easeInQuad",
        complete: function () {
          current.textContent = ROLES[idx];
          anime({ targets: current, rotateX: [-90, 0], duration: 480, easing: "easeOutQuad" });
        } });
    }, 2300);
  }

  /* ---- Build the "structured data" cell grid (pure DOM, always) ---- */
  (function () {
    var g = $(".cells"); if (!g) return;
    var svgns = "http://www.w3.org/2000/svg", cols = 9, rows = 4;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var rect = document.createElementNS(svgns, "rect");
      rect.setAttribute("x", 8 + c * 32); rect.setAttribute("y", 10 + r * 20);
      rect.setAttribute("width", 30); rect.setAttribute("height", 16);
      rect.setAttribute("rx", 3); rect.setAttribute("class", "cell");
      rect.style.animationDelay = ((c + r) * 0.14).toFixed(2) + "s";
      g.appendChild(rect);
    }
  })();

  /* ================================================================= */
  if (!MOTION) return;   // pure motion below; CSS already shows everything
  /* ================================================================= */

  /* ---- Hero headline word wrap ---- */
  var wordEls = [];
  $$(".hero__title [data-words]").forEach(function (line) {
    var t = line.textContent; line.textContent = "";
    t.split(" ").forEach(function (w, i, arr) {
      var s = document.createElement("span");
      s.className = "word"; s.textContent = w;
      line.appendChild(s); wordEls.push(s);
      // real space BETWEEN spans (inline-blocks drop trailing spaces)
      if (i < arr.length - 1) line.appendChild(document.createTextNode(" "));
    });
  });

  /* ---- Reusable: prime an SVG's edges for draw-in ---- */
  function primeEdges(scope) {
    $$(".edge", scope).forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 200;
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.setAttribute("data-len", len);
    });
  }
  /* ---- Reusable: flowing packets along route paths in a container ---- */
  function flow(container, routeSel, opts) {
    if (!anime.path) return;
    opts = opts || {};
    var group = $(".packets", container);
    var routes = routeSel.map(function (s) { return $(s, container); }).filter(Boolean);
    if (!group || !routes.length) return;
    var per = opts.per || 2, dur = opts.dur || 3000, r = opts.r || 3.4, spread = opts.spread || 260;
    var svgns = "http://www.w3.org/2000/svg";
    routes.forEach(function (route, ri) {
      var path = anime.path(route);
      for (var k = 0; k < per; k++) {
        var dot = document.createElementNS(svgns, "circle");
        dot.setAttribute("r", r); dot.setAttribute("class", "packet");
        group.appendChild(dot);
        anime({
          targets: dot, translateX: path("x"), translateY: path("y"),
          easing: "linear", duration: dur, loop: true,
          delay: (ri * spread) + k * (dur / per),
          opacity: [{ value: 0, duration: 0 }, { value: 1, duration: 260 },
                    { value: 1, duration: dur - 620 }, { value: 0, duration: 360 }]
        });
      }
    });
  }

  /* ---- Reusable: packets along .route paths inside any svg (mini-viz) ---- */
  function flowPaths(svg, opts) {
    if (!anime.path || !svg) return;
    opts = opts || {};
    var group = svg.querySelector(".packets");
    var routes = Array.prototype.slice.call(svg.querySelectorAll(".route"));
    if (!group || !routes.length) return;
    var per = opts.per || (routes.length === 1 ? 2 : 1);
    var dur = opts.dur || 2800, r = opts.r || 3, spread = opts.spread || 240;
    var svgns = "http://www.w3.org/2000/svg";
    routes.forEach(function (route, ri) {
      var p = anime.path(route);
      for (var k = 0; k < per; k++) {
        var dot = document.createElementNS(svgns, "circle");
        dot.setAttribute("r", r); dot.setAttribute("class", "packet");
        group.appendChild(dot);
        anime({ targets: dot, translateX: p("x"), translateY: p("y"), easing: "linear",
          duration: dur, loop: true, delay: (ri * spread) + k * (dur / per),
          opacity: [{ value: 0, duration: 0 }, { value: 1, duration: 200 },
                    { value: 1, duration: dur - 460 }, { value: 0, duration: 260 }] });
      }
    });
  }

  /* ---- HERO timeline ---- */
  var heroSvg = $("#flow");
  primeEdges(heroSvg);
  anime.timeline({ easing: "easeOutQuad" })
    .add({ targets: "[data-hero]", opacity: [0,1], translateY: [24,0], duration: 620, delay: anime.stagger(90) })
    .add({ targets: "#flow .edge", strokeDashoffset: function (el) { return [+el.getAttribute("data-len"), 0]; },
           opacity: [.1,.4], duration: 900, delay: anime.stagger(80) }, "-=480")
    .add({ targets: "#flow .node", opacity: [0,1], scale: [.6,1], duration: 560,
           delay: anime.stagger(60), easing: "easeOutBack" }, "-=760")
    .add({ targets: wordEls, opacity: [0,1], translateY: [34,0], duration: 680, delay: anime.stagger(42) }, "-=1200");
  flow(heroSvg, ["#rA","#rB","#rC","#rD"], { per: 2, dur: 3000 });

  /* ---- QA automation flow: reveal + one continuous stream ---- */
  var qaSvg = $("#qa");
  var qaStarted = false;
  function startQA() {
    if (qaStarted || !qaSvg) return; qaStarted = true;
    primeEdges(qaSvg);
    anime({ targets: "#qa .edge", strokeDashoffset: function (el) { return [+el.getAttribute("data-len"), 0]; },
            opacity: [.15,.55], duration: 700, delay: anime.stagger(120), easing: "easeOutQuad" });
    anime({ targets: "#qa .qnode, #qa .viewchip", opacity: [0,1], scale: [.6,1], duration: 520,
            delay: anime.stagger(90), easing: "easeOutBack" });
    flowPaths(qaSvg, { per: 2, dur: 3600, r: 3.6, spread: 600 });
  }

  /* ---- Scroll reveals + count-ups + logo/card pops ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0, obj = { v: 0 };
    anime({ targets: obj, v: target, round: 1, duration: 1600, easing: "easeOutExpo",
      update: function () { el.textContent = obj.v; } });
  }
  var revealables = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (es, obs) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        anime({ targets: el, opacity: [0,1], translateY: [28,0], duration: 720, easing: "easeOutQuad" });
        var logos = $$(".logo", el);
        if (logos.length) anime({ targets: logos, opacity: [0,1], translateY: [18,0], scale: [.92,1], duration: 560, delay: anime.stagger(35), easing: "easeOutBack" });
        $$(".count", el).forEach(countUp);
        $$(".mviz[data-flow]", el).forEach(function (s) { flowPaths(s); });
        if (el.closest && el.closest("#automation")) startQA();
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealables.forEach(function (el) { revObs.observe(el); });
  } else {
    revealables.forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
    $$(".count").forEach(countUp); startQA();
  }
})();

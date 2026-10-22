/* ==========================================================================
   Portfolio — animations.js
   Owner: Collaborator 1 (design / animation)

   Data-independent effects boot on DOMContentLoaded:
     loader, theme toggle, scroll engine (progress bar, nav hide/show,
     back-to-top, timeline fill), active-section nav, mobile menu,
     custom cursor, magnetic buttons, hero canvas, tilt/spotlight.
   Data-dependent effects run on 'portfolio:rendered' (and if it already
   fired — window.__portfolioRendered), idempotently:
     hero name letter split, typewriter, reveal observer, count-up,
     brand text, nav visibility for hidden sections, copy-email button.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('anim-ok');

  /* ---------- Helpers ---------- */
  function $(id) { return doc.getElementById(id); }
  function mq(query) {
    return window.matchMedia ? window.matchMedia(query) : { matches: false, addEventListener: function () {} };
  }
  function onMQChange(list, fn) {
    if (list.addEventListener) list.addEventListener('change', fn);
    else if (list.addListener) list.addListener(fn);
  }
  var mqReduce = mq('(prefers-reduced-motion: reduce)');
  var mqFine = mq('(hover: hover) and (pointer: fine)');
  function reduced() { return mqReduce.matches; }
  // Data last rendered by render.js (Portfolio.render(newData) passes it in the event detail)
  var renderedData = null;
  function getData() { return renderedData || window.PORTFOLIO_DATA || {}; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  var raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : function (fn) { return setTimeout(function () { fn(Date.now()); }, 16); };
  var caf = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : clearTimeout;
  function closest(el, sel) { return el && el.closest ? el.closest(sel) : null; }

  var booted = false;
  var renderPending = false;

  /* ======================================================================
     1. Loader — short, CSS has its own failsafe (auto-hides at ~1.1s)
     ====================================================================== */
  function initLoader() {
    var loader = $('loader');
    if (!loader) return;
    setTimeout(function () { loader.classList.add('is-done'); }, reduced() ? 0 : 650);
    loader.addEventListener('animationend', function (e) {
      if (e.animationName === 'loader-out') loader.hidden = true;
    });
  }

  /* ======================================================================
     2. Theme toggle — explicit choice persisted; default follows system
     ====================================================================== */
  var mqLight = mq('(prefers-color-scheme: light)');

  function storedTheme() {
    try { var t = localStorage.getItem('theme'); return t === 'light' || t === 'dark' ? t : null; }
    catch (e) { return null; }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var btn = $('theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0a12' : '#f6f4f9');
    canvasFX.refreshColors();
  }

  function initTheme() {
    var btn = $('theme-toggle');
    applyTheme(root.getAttribute('data-theme') || (mqLight.matches ? 'light' : 'dark'));
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
      });
    }
    onMQChange(mqLight, function () {
      if (!storedTheme()) applyTheme(mqLight.matches ? 'light' : 'dark');
    });
  }

  /* ======================================================================
     3. Scroll engine — one passive listener, one rAF per frame.
        Reads happen first, writes after; geometry is cached in measure().
     ====================================================================== */
  var scroll = {
    ticking: false,
    lastY: 0,
    docH: 1,
    navHidden: false,
    scrolled: false,
    topVisible: false,
    tl: null          // { top, height, lineTop, lineH, items: [{el, y}] }
  };

  function measure() {
    scroll.docH = Math.max(1, root.scrollHeight - window.innerHeight);
    var wrap = $('timeline-wrap');
    if (wrap && wrap.offsetParent !== null) {
      var rect = wrap.getBoundingClientRect();
      var items = wrap.querySelectorAll('.timeline-item');
      var list = [];
      for (var i = 0; i < items.length; i++) list.push({ el: items[i], y: items[i].offsetTop + 30, passed: items[i].classList.contains('is-passed') });
      scroll.tl = { top: rect.top + window.pageYOffset, height: wrap.offsetHeight, items: list };
    } else {
      scroll.tl = null;
    }
  }

  function requestScrollUpdate() {
    if (!scroll.ticking) { scroll.ticking = true; raf(updateScroll); }
  }

  function updateScroll() {
    scroll.ticking = false;
    // ---- reads ----
    var y = window.pageYOffset || root.scrollTop || 0;
    var vh = window.innerHeight;
    var header = $('site-header');
    var menuOpen = header && header.classList.contains('menu-open');
    var focusInHeader = header && header.contains(doc.activeElement) && doc.activeElement !== doc.body;

    // ---- writes ----
    var bar = $('scroll-progress-bar');
    if (bar) bar.style.transform = 'scaleX(' + clamp(y / scroll.docH, 0, 1).toFixed(4) + ')';

    if (header) {
      var scrolled = y > 12;
      if (scrolled !== scroll.scrolled) { scroll.scrolled = scrolled; header.classList.toggle('is-scrolled', scrolled); }
      var delta = y - scroll.lastY;
      var hide = scroll.navHidden;
      if (menuOpen || focusInHeader || y < 120) hide = false;
      else if (delta > 6) hide = true;
      else if (delta < -6) hide = false;
      if (hide !== scroll.navHidden) { scroll.navHidden = hide; header.classList.toggle('is-hidden', hide); }
    }

    var top = $('back-to-top');
    if (top) {
      var show = y > vh * 0.9;
      if (show !== scroll.topVisible) { scroll.topVisible = show; top.classList.toggle('is-visible', show); }
    }

    var tl = scroll.tl;
    var fill = $('timeline-fill');
    if (tl && fill && tl.height > 0) {
      var progressPx = clamp(y + vh * 0.6 - tl.top, 0, tl.height);
      fill.style.transform = 'scaleY(' + (progressPx / tl.height).toFixed(4) + ')';
      for (var i = 0; i < tl.items.length; i++) {
        var it = tl.items[i];
        var passed = progressPx >= it.y;
        if (passed !== it.passed) { it.passed = passed; it.el.classList.toggle('is-passed', passed); }
      }
    }

    scroll.lastY = y;
  }

  function initScrollEngine() {
    measure();
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { measure(); requestScrollUpdate(); }, 120);
    }, { passive: true });
    window.addEventListener('load', function () { measure(); requestScrollUpdate(); });
    // Content height changes (expanding timeline cards, fonts, filters) → re-measure
    if ('ResizeObserver' in window) {
      var roPending = false;
      var ro = new ResizeObserver(function () {
        if (roPending) return;
        roPending = true;
        raf(function () { roPending = false; measure(); requestScrollUpdate(); });
      });
      ro.observe(doc.body);
      var wrap = $('timeline-wrap');
      if (wrap) ro.observe(wrap);
    }
    var topBtn = $('back-to-top');
    if (topBtn) {
      topBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
        var brand = doc.querySelector('.brand');
        if (brand) brand.focus({ preventScroll: true });
      });
    }
    requestScrollUpdate();
  }

  /* ======================================================================
     4. Active-section highlighting in the nav
     ====================================================================== */
  function initActiveNav() {
    var links = doc.querySelectorAll('.nav-link[data-section]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    for (var i = 0; i < links.length; i++) byId[links[i].getAttribute('data-section')] = links[i];
    var current = null;
    function setActive(id) {
      if (id === current) return;
      current = id;
      for (var k in byId) {
        var on = k === id;
        byId[k].classList.toggle('is-active', on);
        if (on) byId[k].setAttribute('aria-current', 'location');
        else byId[k].removeAttribute('aria-current');
      }
    }
    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) setActive(entries[j].target.id);
      }
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    var sections = doc.querySelectorAll('main > section[id]');
    for (var s = 0; s < sections.length; s++) io.observe(sections[s]);
  }

  /** Hide nav entries whose section render.js hid (empty data). */
  function syncNavVisibility() {
    var links = doc.querySelectorAll('.nav-link[data-section]');
    for (var i = 0; i < links.length; i++) {
      var section = $(links[i].getAttribute('data-section'));
      var li = links[i].parentElement;
      if (li) li.hidden = !section || section.hidden;
    }
    // Hero CTAs / scroll indicator that point at a hidden section are hidden too
    var jumps = doc.querySelectorAll('.hero-ctas a[href^="#"], .scroll-indicator');
    for (var j = 0; j < jumps.length; j++) {
      var href = jumps[j].getAttribute('href') || '';
      if (href.length < 2 || jumps[j].id === 'cv-link') continue;
      var target = $(href.slice(1));
      jumps[j].hidden = !!(target && target.hidden);
    }
  }

  /* ======================================================================
     5. Mobile menu — aria-expanded, ESC closes, focus management
     ====================================================================== */
  var menu = { open: false };

  function setMenu(open, restoreFocus) {
    var toggle = $('nav-toggle');
    var panel = $('nav-menu');
    var header = $('site-header');
    if (!toggle || !panel) return;
    menu.open = open;
    panel.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (header) {
      header.classList.toggle('menu-open', open);
      if (open) { header.classList.remove('is-hidden'); scroll.navHidden = false; }
    }
    doc.body.classList.toggle('is-locked', open);
    if (open) {
      var first = panel.querySelector('li:not([hidden]) .nav-link');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
    } else if (restoreFocus) {
      toggle.focus({ preventScroll: true });
    }
  }

  function initMobileMenu() {
    var toggle = $('nav-toggle');
    var panel = $('nav-menu');
    var header = $('site-header');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () { setMenu(!menu.open, false); });
    panel.addEventListener('click', function (e) {
      if (closest(e.target, '.nav-link') && menu.open) setMenu(false, false);
    });
    doc.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && menu.open) setMenu(false, true);
    });
    if (header) {
      header.addEventListener('focusout', function (e) {
        if (menu.open && e.relatedTarget && !header.contains(e.relatedTarget)) setMenu(false, false);
      });
    }
    var desktop = mq('(min-width: 901px)');
    onMQChange(desktop, function () { if (desktop.matches && menu.open) setMenu(false, false); });
  }

  /* ======================================================================
     6. Custom cursor follower (fine pointers only, no reduced motion)
     ====================================================================== */
  function initCursor() {
    var cursor = $('cursor');
    if (!cursor || !mqFine.matches || reduced()) return;
    var dot = cursor.querySelector('.cursor-dot');
    var ring = cursor.querySelector('.cursor-ring');
    root.classList.add('has-cursor');
    cursor.classList.add('is-hidden');

    var mx = -100, my = -100, rx = -100, ry = -100, running = false, hover = false;
    var interactive = 'a, button, .tilt, [role="button"], input, textarea, select, label, summary';

    function loop() {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      var scale = hover ? 1.6 : 1;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) scale(' + scale + ')';
      if (Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1) { running = false; return; }
      raf(loop);
    }
    function kick() { if (!running) { running = true; raf(loop); } }

    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (rx < -50) { rx = mx; ry = my; }
      cursor.classList.remove('is-hidden');
      kick();
    }, { passive: true });
    doc.addEventListener('pointerover', function (e) {
      var h = !!closest(e.target, interactive);
      if (h !== hover) { hover = h; cursor.classList.toggle('is-hover', h); kick(); }
    }, { passive: true });
    doc.documentElement.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });
    window.addEventListener('blur', function () { cursor.classList.add('is-hidden'); });
  }

  /* ======================================================================
     7. Magnetic buttons (static CTAs)
     ====================================================================== */
  function initMagnetic() {
    if (!mqFine.matches || reduced()) return;
    var els = doc.querySelectorAll('.magnetic');
    Array.prototype.forEach.call(els, function (el) {
      if (el.__magnetic) return;
      el.__magnetic = true;
      var frame = 0, px = 0, py = 0;
      function apply() {
        frame = 0;
        var r = el.getBoundingClientRect();
        var dx = px - (r.left + r.width / 2);
        var dy = py - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.28).toFixed(2) + 'px,' + (dy * 0.38).toFixed(2) + 'px)';
      }
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        px = e.clientX; py = e.clientY;
        if (!frame) frame = raf(apply);
      }, { passive: true });
      el.addEventListener('pointerleave', function () {
        if (frame) { caf(frame); frame = 0; }
        el.style.transform = '';
      });
    });
  }

  /* ======================================================================
     8. Hero canvas — particle constellation reacting to the pointer.
        Paused when the tab is hidden or the hero is off-screen; disabled
        under prefers-reduced-motion; fewer particles on small screens.
     ====================================================================== */
  var canvasFX = (function () {
    var canvas, ctx, hero, w = 0, h = 0, dpr = 1;
    var particles = [];
    var pointer = { x: 0, y: 0, active: false };
    var colors = { a: '#c48bb6', b: '#2fe3d3', line: '#8b7bff' };
    var running = false, frameId = 0, heroVisible = true, inited = false;
    var LINK = 130, MOUSE_R = 170;

    function readColors() {
      var cs = getComputedStyle(root);
      colors.a = cs.getPropertyValue('--accent').trim() || colors.a;
      colors.b = cs.getPropertyValue('--accent-2').trim() || colors.b;
      colors.line = cs.getPropertyValue('--accent-3').trim() || colors.line;
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var small = w < 700;
      var count = clamp(Math.round((w * h) / (small ? 15000 : 11000)), 22, small ? 45 : 110);
      LINK = small ? 100 : 130;
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.8,
          c: Math.random() < 0.5 ? 'a' : 'b'
        });
      }
      if (!running) draw(); // static frame
    }

    function step() {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (pointer.active) {
          var dx = pointer.x - p.x, dy = pointer.y - p.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_R * MOUSE_R && d2 > 1) {
            var d = Math.sqrt(d2);
            var f = (1 - d / MOUSE_R) * 0.035;
            p.vx += (dx / d) * f; p.vy += (dy / d) * f;   // gentle attraction
          }
        }
        p.vx *= 0.985; p.vy *= 0.985;
        // keep a minimum drift
        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.04;
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.04;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var n = particles.length, i, j, p, q, dx, dy, d2, link2 = LINK * LINK;
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.line;
      for (i = 0; i < n; i++) {
        p = particles[i];
        for (j = i + 1; j < n; j++) {
          q = particles[j];
          dx = p.x - q.x; dy = p.y - q.y;
          d2 = dx * dx + dy * dy;
          if (d2 < link2) {
            ctx.globalAlpha = (1 - d2 / link2) * 0.35;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      if (pointer.active) {
        ctx.strokeStyle = colors.b;
        var m2 = MOUSE_R * MOUSE_R;
        for (i = 0; i < n; i++) {
          p = particles[i];
          dx = p.x - pointer.x; dy = p.y - pointer.y;
          d2 = dx * dx + dy * dy;
          if (d2 < m2) {
            ctx.globalAlpha = (1 - d2 / m2) * 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < n; i++) {
        p = particles[i];
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = colors[p.c];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      if (!running) return;
      step(); draw();
      frameId = raf(loop);
    }

    function shouldRun() { return inited && heroVisible && !doc.hidden && !reduced(); }
    function sync() {
      var go = shouldRun();
      if (go && !running) { running = true; frameId = raf(loop); }
      else if (!go && running) { running = false; caf(frameId); }
    }

    function init() {
      canvas = $('hero-canvas');
      hero = $('home');
      if (!canvas || !canvas.getContext || !hero) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      inited = true;
      readColors();
      resize();

      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(resize, 150);
      }, { passive: true });

      hero.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
      }, { passive: true });
      hero.addEventListener('pointerleave', function () { pointer.active = false; });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          heroVisible = entries[0].isIntersecting;
          sync();
        }, { threshold: 0 }).observe(hero);
      }
      doc.addEventListener('visibilitychange', sync);
      onMQChange(mqReduce, sync);
      sync();
    }

    return {
      init: init,
      refreshColors: function () { if (inited) { readColors(); if (!running) draw(); } }
    };
  })();

  /* ======================================================================
     9. Tilt + spotlight (event delegation → idempotent across re-renders)
     ====================================================================== */
  function initTilt() {
    if (!mqFine.matches) return;
    var active = null, px = 0, py = 0, frame = 0;

    function reset(el) {
      el.classList.remove('is-tilting');
      el.style.transform = '';
    }
    function apply() {
      frame = 0;
      if (!active) return;
      var r = active.getBoundingClientRect();
      var x = px - r.left, y = py - r.top;
      active.style.setProperty('--mx', x.toFixed(1) + 'px');
      active.style.setProperty('--my', y.toFixed(1) + 'px');
      if (reduced()) return;
      var nx = clamp(x / r.width, 0, 1) - 0.5;
      var ny = clamp(y / r.height, 0, 1) - 0.5;
      active.classList.add('is-tilting');
      active.style.transform = 'perspective(900px) rotateX(' + (-ny * 7).toFixed(2) + 'deg) rotateY(' + (nx * 9).toFixed(2) + 'deg)';
    }

    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var t = closest(e.target, '.tilt');
      if (t !== active) {
        if (active) reset(active);
        active = t;
      }
      if (!active) return;
      px = e.clientX; py = e.clientY;
      if (!frame) frame = raf(apply);
    }, { passive: true });

    function clear() { if (active) { reset(active); active = null; } }
    doc.documentElement.addEventListener('mouseleave', clear);
    window.addEventListener('blur', clear);
  }

  /* ======================================================================
     10. Project filter transition — animates cards after render.js filters
     ====================================================================== */
  function initFilterAnim() {
    doc.addEventListener('click', function (e) {
      var btn = closest(e.target, '#project-filters .filter-btn');
      if (!btn || reduced()) return;
      var grid = $('projects-grid');
      if (!grid) return;
      var cards = grid.querySelectorAll('.project-card');
      var n = 0;
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].classList.contains('is-hidden')) continue;
        cards[i].style.setProperty('--fi', n++);
        cards[i].classList.add('is-visible');
      }
      // alternate keyframe names so every click restarts the entrance
      grid.setAttribute('data-anim', grid.getAttribute('data-anim') === 'a' ? 'b' : 'a');
    });
  }

  /* ======================================================================
     11. Toast + copy email
     ====================================================================== */
  var toastTimer = 0;
  function toast(msg, isError) {
    var el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('is-error', !!isError);
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      // Clipboard API can reject (permissions, unfocused document) → fall back to execCommand
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.top = '0';
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      doc.body.removeChild(ta);
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }

  function currentEmail() {
    var c = getData().contact || {};
    return typeof c.email === 'string' ? c.email.trim() : '';
  }

  function syncCopyEmail() {
    var btn = $('copy-email');
    if (!btn) return;
    btn.hidden = !currentEmail();
    if (btn.__bound) return;
    btn.__bound = true;
    btn.addEventListener('click', function () {
      var email = currentEmail();
      if (!email) return;
      copyText(email).then(function () {
        toast('Email copied — ' + email);
      }, function () {
        toast(email, true);
      });
    });
  }

  /* ======================================================================
     12. Hero name — letter split with per-word gradient alignment
     ====================================================================== */
  function splitName() {
    var el = $('hero-name');
    if (!el) return;
    if (el.querySelector('.char')) { measureName(); return; }   // already split
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    el.classList.remove('is-split');
    el.removeAttribute('aria-label');
    if (!text || reduced()) return;   // keep static gradient heading

    var frag = doc.createDocumentFragment();
    var words = text.split(' ');
    var ci = 0;
    words.forEach(function (word, wi) {
      var w = doc.createElement('span');
      w.className = 'word';
      w.setAttribute('aria-hidden', 'true');
      Array.from ? Array.from(word).forEach(addChar) : word.split('').forEach(addChar);
      function addChar(ch) {
        var c = doc.createElement('span');
        c.className = 'char';
        c.textContent = ch;
        c.style.setProperty('--ci', ci++);
        w.appendChild(c);
      }
      frag.appendChild(w);
      if (wi < words.length - 1) frag.appendChild(doc.createTextNode(' '));
    });
    el.setAttribute('aria-label', text);
    el.textContent = '';
    el.appendChild(frag);
    el.classList.add('is-split');
    measureName();
  }

  /** Give each char its offset inside its word so one gradient spans the word. */
  function measureName() {
    var el = $('hero-name');
    if (!el) return;
    var words = el.querySelectorAll('.word');
    var writes = [];
    // reads
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      var bw = word.offsetWidth;
      var base = word.offsetLeft;
      var chars = word.querySelectorAll('.char');
      for (var j = 0; j < chars.length; j++) writes.push([chars[j], chars[j].offsetLeft - base, bw]);
    }
    // writes
    for (var k = 0; k < writes.length; k++) {
      writes[k][0].style.setProperty('--bx', writes[k][1] + 'px');
      writes[k][0].style.setProperty('--bw', writes[k][2] + 'px');
    }
  }

  function initNameMeasureHooks() {
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(measureName, 150);
    }, { passive: true });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measureName);
  }

  /* ======================================================================
     13. Typewriter — cycles PORTFOLIO_DATA.profile.roles in #hero-typed
     ====================================================================== */
  var typer = { timer: 0, key: null };

  function initTyped() {
    var el = $('hero-typed');
    var line = $('hero-typed-line');
    if (!el) return;
    var profile = getData().profile || {};
    var roles = (Array.isArray(profile.roles) ? profile.roles : [])
      .filter(function (r) { return typeof r === 'string' && r.trim(); })
      .map(function (r) { return r.trim(); });
    var key = roles.join('\u0001');
    if (key === typer.key) return;          // same data → keep the running loop
    typer.key = key;
    clearTimeout(typer.timer);

    if (line) line.hidden = !roles.length;
    if (!roles.length) { el.textContent = ''; return; }

    // Screen readers get the full list once; the animated text is decorative.
    el.setAttribute('aria-hidden', 'true');
    var sr = $('hero-typed-sr');
    if (!sr && line) {
      sr = doc.createElement('span');
      sr.id = 'hero-typed-sr';
      sr.className = 'sr-only';
      line.appendChild(sr);
    }
    if (sr) sr.textContent = roles.join(', ');

    if (reduced()) { el.textContent = roles[0]; return; }

    var ri = 0, ci = 0, deleting = false;
    function tick() {
      var word = roles[ri];
      var delay;
      if (!deleting) {
        ci++;
        el.textContent = word.slice(0, ci);
        delay = 55 + Math.random() * 55;
        if (ci >= word.length) {
          if (roles.length === 1) return;   // single role: type once and stay
          deleting = true; delay = 1700;
        }
      } else {
        ci--;
        el.textContent = word.slice(0, ci);
        delay = 32;
        if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 380; }
      }
      typer.timer = setTimeout(tick, delay);
    }
    el.textContent = '';
    typer.timer = setTimeout(tick, 1200);   // start after the hero entrance
  }

  /* ======================================================================
     14. Reveal-on-scroll + count-up
     ====================================================================== */
  var revealIO = null;

  function onRevealed(el) {
    if (el.classList.contains('stat')) {
      var v = el.querySelector('.stat-value');
      if (v) countUp(v);
    }
  }

  function observeReveals() {
    var els = doc.querySelectorAll('.reveal:not(.is-visible)');
    if (reduced() || !('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) { els[i].classList.add('is-visible'); onRevealed(els[i]); }
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        for (var j = 0; j < entries.length; j++) {
          var e = entries[j];
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-visible');
          revealIO.unobserve(e.target);
          onRevealed(e.target);
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    }
    for (var k = 0; k < els.length; k++) revealIO.observe(els[k]);   // observe() is a no-op for already-observed nodes
  }

  function countUp(el) {
    if (el.getAttribute('data-counted')) return;
    el.setAttribute('data-counted', '1');
    var raw = el.getAttribute('data-count') || '0';
    var target = parseFloat(raw);
    var suffix = el.getAttribute('data-suffix') || '';
    if (!isFinite(target)) return;
    var decimals = (raw.split('.')[1] || '').length;
    var final = target.toFixed(decimals) + suffix;
    el.setAttribute('aria-label', final);
    if (reduced()) { el.textContent = final; return; }
    var start = null, dur = 1700;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);   // easeOutExpo
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) raf(frame);
    }
    raf(frame);
  }

  /* ======================================================================
     15. Small data-driven bits
     ====================================================================== */
  function syncBrand() {
    var p = getData().profile || {};
    var text = $('brand-text');
    if (text) text.textContent = (typeof p.name === 'string' && p.name.trim()) || '';
  }

  function resetFilterAnim() {
    var grid = $('projects-grid');
    if (grid) grid.removeAttribute('data-anim');
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  function onRendered() {
    if (!booted) { renderPending = true; return; }
    renderPending = false;
    try { splitName(); } catch (e) { /* non-fatal */ }
    initTyped();
    resetFilterAnim();
    observeReveals();
    syncNavVisibility();
    syncBrand();
    syncCopyEmail();
    measure();
    requestScrollUpdate();
  }

  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.error('[animations]', e); } }

  function boot() {
    if (booted) return;
    booted = true;
    safe(initLoader);
    safe(initTheme);
    safe(initScrollEngine);
    safe(initActiveNav);
    safe(initMobileMenu);
    safe(initCursor);
    safe(initMagnetic);
    safe(canvasFX.init);
    safe(initTilt);
    safe(initFilterAnim);
    safe(initNameMeasureHooks);
    safe(observeReveals);           // static headings work even if render.js fails
    safe(syncCopyEmail);
    if (renderPending || window.__portfolioRendered) safe(onRendered);
  }

  doc.addEventListener('portfolio:rendered', function (e) {
    if (e && e.detail && e.detail.data) renderedData = e.detail.data;
    safe(onRendered);
  });

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

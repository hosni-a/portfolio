/* ==========================================================================
   Portfolio — whatsapp.js
   Smart WhatsApp chat button, configured by PORTFOLIO_DATA.whatsapp.

   - Floating button + chat panel (Esc / outside click close, focus managed)
   - Live "Online / Away" status from the owner's working hours & timezone
   - Quick-topic chips that prefill an editable message
   - Opens https://wa.me/<number>?text=… (WhatsApp app on mobile, Web on desktop)
   - One-time teaser bubble per visit, unread badge until first opened
   Re-renders on every 'portfolio:rendered'; hidden when no number is set.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var STORAGE_KEY = 'portfolio-wa-seen';
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  var widget = null;      // #wa-widget mount (stable across re-renders)
  var cfg = null;         // normalised config for the current render
  var statusTimer = null;
  var teaserTimer = null;

  /* ---------- Helpers ---------- */
  function utils() { return (window.Portfolio && window.Portfolio.utils) || {}; }
  function esc(v) {
    var fn = utils().escapeHTML;
    return fn ? fn(v) : String(v == null ? '' : v).replace(/[&<>"'`]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; });
  }
  function str(v) { return (typeof v === 'string' || typeof v === 'number') ? String(v).trim() : ''; }
  function storage(get, value) {
    try {
      if (get) return window.sessionStorage.getItem(STORAGE_KEY);
      window.sessionStorage.setItem(STORAGE_KEY, value);
    } catch (e) { /* storage blocked — the teaser just shows again next visit */ }
    return null;
  }
  var warned = {};
  function warn(msg) {
    if (warned[msg]) return;
    warned[msg] = true;
    if (window.console && console.warn) console.warn('[portfolio] ' + msg);
  }
  function parseHM(value) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(str(value));
    if (!m || Number(m[2]) > 59) return null;
    var minutes = Number(m[1]) * 60 + Number(m[2]);
    return minutes <= 24 * 60 ? minutes : null;   // "24:00" allowed as end of day
  }

  /** Current weekday (0=Sun) and minutes-since-midnight in the given IANA timezone. */
  function nowIn(timeZone) {
    var d = new Date();
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(d);
      var get = function (type) {
        for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value;
        return '';
      };
      var hour = Number(get('hour')) % 24;
      return { day: DAY_NAMES.indexOf(get('weekday')), minutes: hour * 60 + Number(get('minute')) };
    } catch (e) {
      // bad/unsupported timezone → visitor's local clock (warned once in readConfig)
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes(), fallback: true };
    }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hm(minutes) { return pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60); }

  var FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /** "today" / "tomorrow" / weekday name of the next working day, or '' if none is configured. */
  function nextOpening(h, now) {
    for (var offset = 0; offset < 8; offset++) {
      var day = (now.day + offset) % 7;
      if (h.days.indexOf(day) === -1) continue;
      if (offset === 0 && now.minutes >= h.start) continue;   // today's window already passed
      return offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : FULL_DAYS[day];
    }
    return '';
  }

  /** { online: bool|null, label: string } — null when no working hours are configured. */
  function availability() {
    var h = cfg.hours;
    var now = nowIn(cfg.timezone);
    var clock = 'it\'s ' + hm(now.minutes) + (cfg.city && !now.fallback ? ' in ' + cfg.city : '');
    if (!h) return { online: null, label: clock.charAt(0).toUpperCase() + clock.slice(1) };
    var open = h.days.indexOf(now.day) !== -1 && now.minutes >= h.start && now.minutes < h.end;
    if (open) return { online: true, label: 'Online now · ' + clock };
    var next = nextOpening(h, now);
    return { online: false, label: 'Away' + (next ? ' · back ' + next + ' at ' + hm(h.start) : '') + ' · ' + clock };
  }

  /* ---------- Config ---------- */
  function readConfig(data) {
    var wa = (data && data.whatsapp) || {};
    var numberFn = utils().whatsappNumber;
    var number = numberFn ? numberFn(data || {}) : str(wa.number).replace(/\D/g, '');
    if (!number) return null;

    var hours = null;
    if (wa.hours) {
      var start = parseHM(wa.hours.start);
      var end = parseHM(wa.hours.end);
      var days = Array.isArray(wa.hours.days)
        ? wa.hours.days.map(Number).filter(function (n) { return n % 1 === 0 && n >= 0 && n <= 6; })   // "1" → 1
        : [0, 1, 2, 3, 4, 5, 6];
      if (start !== null && end !== null && end > start) hours = { days: days, start: start, end: end };
      else warn('whatsapp.hours ignored: use "HH:MM" times with end after start (overnight ranges are not supported).');
    }
    if (str(wa.timezone)) {
      try { new Intl.DateTimeFormat('en-US', { timeZone: str(wa.timezone) }); }
      catch (e) { warn('whatsapp.timezone "' + str(wa.timezone) + '" is not a valid IANA timezone (e.g. "Africa/Tunis"); using the visitor\'s clock.'); }
    }
    var name = str(wa.displayName) || str(data.profile && data.profile.name) || 'Chat';
    return {
      number: number,
      name: name,
      initials: name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase(),
      replyTime: str(wa.replyTime),
      greeting: str(wa.greeting) || 'Hi there 👋 How can I help you?',
      timezone: str(wa.timezone) || undefined,
      city: str(wa.cityLabel),
      hours: hours,
      teaser: str(wa.teaser),
      teaserDelay: Number(wa.teaserDelay),
      messages: (Array.isArray(wa.messages) ? wa.messages : []).filter(function (m) {
        return m && str(m.label) && str(m.text);
      })
    };
  }

  /* ---------- Markup ---------- */
  function waIcon() {
    var fn = utils().icon;
    return fn ? fn('whatsapp') : '';
  }

  function template() {
    var chips = cfg.messages.map(function (m, i) {
      return '<button type="button" class="wa-chip" data-msg="' + i + '">' + esc(m.label) + '</button>';
    }).join('');
    return '' +
      '<div class="wa-teaser" id="wa-teaser" hidden>' +
        '<button type="button" class="wa-teaser-text" data-wa="open">' + esc(cfg.teaser) + '</button>' +
        '<button type="button" class="wa-teaser-close" data-wa="dismiss" aria-label="Dismiss">×</button>' +
      '</div>' +
      '<div class="wa-panel" id="wa-panel" role="dialog" aria-modal="false" aria-labelledby="wa-title" hidden>' +
        '<header class="wa-head">' +
          '<span class="wa-avatar" aria-hidden="true">' + esc(cfg.initials) + '<i class="wa-dot"></i></span>' +
          '<div class="wa-head-text">' +
            '<strong id="wa-title">' + esc(cfg.name) + '</strong>' +
            '<span class="wa-status" id="wa-status"></span>' +
          '</div>' +
          '<button type="button" class="wa-close" data-wa="close" aria-label="Close chat">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
        '</header>' +
        '<div class="wa-body">' +
          '<div class="wa-bubble">' + esc(cfg.greeting) +
            (cfg.replyTime ? '<small>' + esc(cfg.replyTime) + '</small>' : '') + '</div>' +
          (chips ? '<div class="wa-chips" role="group" aria-label="Quick topics">' + chips + '</div>' : '') +
        '</div>' +
        '<form class="wa-form" id="wa-form">' +
          '<label class="sr-only" for="wa-input">Your message</label>' +
          '<textarea id="wa-input" class="wa-input" rows="2" maxlength="1000" placeholder="Type a message…"></textarea>' +
          '<button type="submit" class="wa-send" aria-label="Send on WhatsApp">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>' +
          '</button>' +
        '</form>' +
      '</div>' +
      '<button type="button" class="wa-fab" id="wa-fab" data-wa="toggle" aria-expanded="false" aria-controls="wa-panel" aria-label="Chat on WhatsApp">' +
        '<span class="wa-fab-icon wa-fab-icon--logo">' + waIcon() + '</span>' +
        '<span class="wa-fab-icon wa-fab-icon--close" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></span>' +
        '<span class="wa-badge" id="wa-badge" aria-hidden="true" hidden>1</span>' +
      '</button>';
  }

  /* ---------- Behaviour ---------- */
  function el(id) { return doc.getElementById(id); }
  function isOpen() { return widget.classList.contains('is-open'); }

  function updateStatus() {
    var s = el('wa-status');
    if (!s || !cfg) return;
    var a = availability();
    s.textContent = a.label;
    widget.classList.toggle('is-online', a.online === true);
    widget.classList.toggle('is-away', a.online === false);
  }

  function hideTeaser(remember) {
    var t = el('wa-teaser');
    if (t) t.hidden = true;
    var b = el('wa-badge');
    if (b) b.hidden = true;
    if (remember) storage(false, '1');
  }

  function open() {
    if (isOpen()) return;
    hideTeaser(true);
    widget.classList.add('is-open');
    el('wa-panel').hidden = false;
    el('wa-fab').setAttribute('aria-expanded', 'true');
    el('wa-fab').setAttribute('aria-label', 'Close WhatsApp chat');
    updateStatus();
    statusTimer = setInterval(updateStatus, 30000);
    var first = widget.querySelector('.wa-chip') || el('wa-input');
    if (first) first.focus({ preventScroll: true });
  }

  function close(returnFocus) {
    if (!isOpen()) return;
    widget.classList.remove('is-open');
    el('wa-panel').hidden = true;
    el('wa-fab').setAttribute('aria-expanded', 'false');
    el('wa-fab').setAttribute('aria-label', 'Chat on WhatsApp');
    clearInterval(statusTimer);
    if (returnFocus) el('wa-fab').focus();
  }

  function send() {
    var input = el('wa-input');
    var text = str(input && input.value) || (cfg.messages[0] && cfg.messages[0].text) || '';
    var url = 'https://wa.me/' + cfg.number + (text ? '?text=' + encodeURIComponent(text) : '');
    // No 'noopener' feature: with it window.open() always returns null, which made the
    // fallback below navigate this tab away too. Detach the opener manually instead.
    var win = window.open(url, '_blank');
    if (win) { try { win.opener = null; } catch (e) { /* ignore */ } }
    else window.location.href = url;   // popup blocked
    if (input) { input.value = ''; input.style.height = ''; }
    close(false);
  }

  function onClick(e) {
    var chip = e.target.closest('.wa-chip');
    if (chip) {
      var msg = cfg.messages[Number(chip.getAttribute('data-msg'))];
      var input = el('wa-input');
      if (msg && input) {
        input.value = msg.text;
        autoGrow(input);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
      return;
    }
    var action = e.target.closest('[data-wa]');
    if (!action) return;
    switch (action.getAttribute('data-wa')) {
      case 'toggle': if (isOpen()) close(true); else open(); break;
      case 'open': open(); break;
      case 'close': close(true); break;
      case 'dismiss': hideTeaser(true); break;
    }
  }

  /** Grow the textarea with its content (CSS caps it with max-height). */
  function autoGrow(input) {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 2 + 'px';
  }

  function onKeydown(e) {
    if (e.key === 'Escape' && isOpen()) { close(true); return; }
    // Enter sends, Shift+Enter adds a new line
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.target.id === 'wa-input') {   // not during IME composition
      e.preventDefault();
      send();
    }
  }

  function onDocPointer(e) {
    if (widget && isOpen() && !widget.contains(e.target)) close(false);
  }

  function bindOnce() {
    if (widget.__waBound) return;
    widget.__waBound = true;
    widget.addEventListener('click', onClick);
    widget.addEventListener('keydown', onKeydown);
    widget.addEventListener('submit', function (e) { e.preventDefault(); send(); });
    widget.addEventListener('input', function (e) { if (e.target.id === 'wa-input') autoGrow(e.target); });
    doc.addEventListener('pointerdown', onDocPointer);
    // Esc also closes when focus has moved out of the (non-modal) panel
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && widget && isOpen() && !widget.contains(e.target)) close(false);
    });
  }

  function scheduleTeaser() {
    clearTimeout(teaserTimer);
    if (!cfg.teaser || !(cfg.teaserDelay > 0) || storage(true)) return;
    teaserTimer = setTimeout(function () {
      if (isOpen()) return;
      el('wa-teaser').hidden = false;
      el('wa-badge').hidden = false;
    }, cfg.teaserDelay * 1000);
  }

  /* ---------- Render ---------- */
  function render(data) {
    widget = el('wa-widget');
    if (!widget) return;
    // Re-render (Portfolio.render): keep open state / focus, and don't replay the FAB entrance
    var wasOpen = isOpen();
    var hadFocus = widget.contains(doc.activeElement);
    if (cfg) widget.classList.add('is-ready');
    clearInterval(statusTimer);
    clearTimeout(teaserTimer);
    widget.classList.remove('is-open', 'is-online', 'is-away');

    cfg = readConfig(data || window.PORTFOLIO_DATA);
    widget.hidden = !cfg;
    root.classList.toggle('has-wa', !!cfg);
    if (!cfg) { widget.innerHTML = ''; return; }

    widget.innerHTML = template();
    bindOnce();
    updateStatus();
    if (wasOpen) open();
    else {
      if (hadFocus) el('wa-fab').focus({ preventScroll: true });
      scheduleTeaser();
    }
  }

  doc.addEventListener('portfolio:rendered', function (e) {
    render(e.detail && e.detail.data);
  });
  if (window.__portfolioRendered) render();
})();

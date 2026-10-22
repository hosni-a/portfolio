/*
 * render.js — turns window.PORTFOLIO_DATA (js/data.js) into page content.
 * Plain script (no modules) so it works on file:// as well as on a server.
 *
 * Public API:  window.Portfolio.render(data?)  // defaults to window.PORTFOLIO_DATA
 * Event:       document 'portfolio:rendered'   (also sets window.__portfolioRendered = true)
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  var HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };

  function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"'`]/g, function (ch) { return HTML_ESCAPES[ch]; });
  }

  /**
   * Returns the URL if it is http(s)://, mailto:, tel: or a relative path; otherwise null.
   * Rejects javascript:, data:, vbscript:, protocol-relative (//host) and any other scheme.
   */
  function safeUrl(url) {
    if (typeof url !== 'string') return null;
    var trimmed = url.trim();
    if (!trimmed) return null;
    // Browsers ignore control chars / whitespace inside schemes ("java\tscript:") — check a cleaned copy.
    var probe = trimmed.replace(/[\u0000- \u007F-\u009F]/g, '').toLowerCase();
    if (/^(https?:\/\/|mailto:|tel:)/.test(probe)) return trimmed;
    if (/^[a-z][a-z0-9+.\-]*:/.test(probe)) return null;   // some other scheme
    if (probe.indexOf('//') === 0 || probe.indexOf('\\\\') === 0 || probe.indexOf('/\\') === 0) return null;
    return trimmed;                                          // relative path, #anchor, ?query
  }

  function isExternal(url) {
    return /^https?:\/\//i.test(url);
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function str(value) {
    return (typeof value === 'string' || typeof value === 'number') ? String(value).trim() : '';
  }

  var warned = {};
  function warnOnce(key, message) {
    if (warned[key]) return;
    warned[key] = true;
    if (window.console && console.warn) console.warn('[portfolio] ' + message);
  }

  function $(id) {
    var el = document.getElementById(id);
    if (!el) warnOnce('mount:' + id, 'Mount point #' + id + ' not found in index.html — skipped.');
    return el;
  }

  function setSectionHidden(sectionId, hidden) {
    var section = document.getElementById(sectionId);
    if (section) section.hidden = !!hidden;
  }

  function setHTML(id, html) {
    var el = $(id);
    if (el) el.innerHTML = html;
    return el;
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
    return el;
  }

  /* ------------------------------------------------------------------ *
   * Icons (inline SVG, stroke = currentColor)
   * ------------------------------------------------------------------ */

  var ICON_PATHS = {
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
    email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    // Brand glyph is a filled shape, so the path overrides the stroke style set on <svg>.
    whatsapp: '<path fill="currentColor" stroke="none" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>',
    twitter: '<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>',
    website: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
    plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    translate: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    graduation: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    location: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    link: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'
  };

  var ICON_ALIASES = {
    mail: 'email', globe: 'website', web: 'website', x: 'twitter', map: 'location', pin: 'location',
    education: 'graduation', certificate: 'award', certification: 'award', work: 'briefcase',
    migration: 'refresh', shipping: 'truck', analytics: 'chart', integration: 'plug', ecommerce: 'cart',
    language: 'translate', languages: 'translate', ai: 'cpu', team: 'users', security: 'shield'
  };

  var DEFAULT_ICON = 'box';
  var has = Object.prototype.hasOwnProperty;

  function icon(name) {
    var key = str(name).toLowerCase();
    if (has.call(ICON_ALIASES, key)) key = ICON_ALIASES[key];
    if (!has.call(ICON_PATHS, key)) key = DEFAULT_ICON;
    return '<svg class="icon icon-' + key + '" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      ICON_PATHS[key] + '</svg>';
  }

  /* ------------------------------------------------------------------ *
   * Dates
   * ------------------------------------------------------------------ */

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /** "2024-09" -> {y: 2024, m: 9}; "2021" -> {y: 2021, m: null}; invalid -> null */
  function parseYM(value) {
    var match = /^(\d{4})(?:-(\d{1,2}))?/.exec(str(value));
    if (!match) return null;
    var m = match[2] ? parseInt(match[2], 10) : null;
    if (m !== null && (m < 1 || m > 12)) m = null;
    return { y: parseInt(match[1], 10), m: m };
  }

  function formatYM(value) {
    var d = parseYM(value);
    if (!d) return str(value);
    return d.m ? MONTHS[d.m - 1] + ' ' + d.y : String(d.y);
  }

  function formatRange(start, end) {
    var s = formatYM(start);
    var e = end ? formatYM(end) : 'Present';
    if (!s) return e === 'Present' ? '' : e;
    return s + ' — ' + e;
  }

  /** LinkedIn-style inclusive duration: 2024-09 → 2026-04 = "1 yr 8 mos"; same month = "1 mo". */
  function formatDuration(start, end) {
    var s = parseYM(start);
    if (!s) return '';
    var e;
    if (end) {
      e = parseYM(end);
      if (!e) return '';
    } else {
      var now = new Date();
      e = { y: now.getFullYear(), m: now.getMonth() + 1 };
    }
    var months = (e.y - s.y) * 12 + ((e.m || 12) - (s.m || 1)) + 1;
    if (months < 1) months = 1;
    var years = Math.floor(months / 12);
    var rest = months % 12;
    var parts = [];
    if (years) parts.push(years + (years === 1 ? ' yr' : ' yrs'));
    if (rest) parts.push(rest + (rest === 1 ? ' mo' : ' mos'));
    return parts.join(' ');
  }

  /* ------------------------------------------------------------------ *
   * Section renderers
   * ------------------------------------------------------------------ */

  function initials(profile) {
    var first = str(profile.firstName);
    var last = str(profile.lastName);
    if (!first && !last) {
      var parts = str(profile.name).split(/\s+/).filter(Boolean);
      first = parts[0] || '';
      last = parts.length > 1 ? parts[parts.length - 1] : '';
    }
    return ((first.charAt(0) || '') + (last.charAt(0) || '')).toUpperCase() || '?';
  }

  function renderMeta(data) {
    var meta = data.meta || {};
    var profile = data.profile || {};
    var title = str(meta.title) || str(profile.name);
    if (title) document.title = title;
    var description = str(meta.description);
    if (description) {
      var tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }

  function renderHero(data) {
    var profile = data.profile || {};
    setText('hero-name', str(profile.name));
    setText('hero-headline', str(profile.headline));

    var loc = setText('hero-location', str(profile.location));
    if (loc) loc.hidden = !str(profile.location);
    var avail = setText('hero-availability', str(profile.availability));
    if (avail) avail.hidden = !str(profile.availability);

    var avatar = $('hero-avatar');
    if (avatar) {
      var initialsHTML = '<span class="hero-initials">' + escapeHTML(initials(profile)) + '</span>';
      var photo = safeUrl(profile.photo);
      avatar.removeAttribute('role');
      avatar.removeAttribute('aria-label');
      if (photo) {
        avatar.innerHTML = '<img src="' + escapeHTML(photo) + '" alt="' + escapeHTML(str(profile.name) || 'Profile photo') + '" decoding="async">';
        var img = avatar.querySelector('img');
        img.addEventListener('error', function () {
          avatar.innerHTML = initialsHTML;
          avatar.setAttribute('role', 'img');
          avatar.setAttribute('aria-label', str(profile.name));
        }, { once: true });
      } else {
        avatar.innerHTML = initialsHTML;
        avatar.setAttribute('role', 'img');
        avatar.setAttribute('aria-label', str(profile.name));
      }
    }

    var cv = $('cv-link');
    if (cv) {
      var cvUrl = safeUrl(profile.cvUrl);
      if (cvUrl) {
        cv.setAttribute('href', cvUrl);
        cv.hidden = false;
        if (isExternal(cvUrl)) {
          cv.setAttribute('target', '_blank');
          cv.setAttribute('rel', 'noopener noreferrer');
        }
      } else {
        cv.removeAttribute('href');
        cv.hidden = true;
      }
    }
  }

  function socialLinkHTML(social) {
    var url = safeUrl(social && social.url);
    if (!url) return '';
    var name = str(social.name) || str(social.icon) || 'Link';
    var external = isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<a class="social-link" href="' + escapeHTML(url) + '"' + external +
      ' aria-label="' + escapeHTML(name) + '" title="' + escapeHTML(name) + '">' + icon(social.icon) + '</a>';
  }

  function renderSocials(data) {
    var html = arr(data.socials).map(socialLinkHTML).join('');
    ['hero-socials', 'footer-socials'].forEach(function (id) {
      var el = setHTML(id, html);
      if (el) el.hidden = !html;
    });
  }

  function renderAbout(data) {
    var paragraphs = arr(data.about && data.about.paragraphs).map(str).filter(Boolean);
    setHTML('about-text', paragraphs.map(function (p) { return '<p>' + escapeHTML(p) + '</p>'; }).join(''));

    var stats = arr(data.stats).filter(function (s) { return s && str(s.label); });
    var statsEl = setHTML('stats-list', stats.map(function (s, i) {
      var value = Number(s.value);
      if (!isFinite(value)) value = 0;
      return '<div class="stat reveal" style="--i:' + i + '">' +
        '<span class="stat-value" data-count="' + escapeHTML(value) + '" data-suffix="' + escapeHTML(str(s.suffix)) + '">' +
          // final value as fallback text (animations.js counts up from 0 when revealed)
          escapeHTML(value + str(s.suffix)) + '</span>' +
        '<span class="stat-label">' + escapeHTML(str(s.label)) + '</span></div>';
    }).join(''));
    if (statsEl) statsEl.hidden = !stats.length;

    setSectionHidden('about', !paragraphs.length && !stats.length);
  }

  function clampLevel(level) {
    var n = Math.round(Number(level));
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function renderSkills(data) {
    var groups = arr(data.skills).filter(function (g) { return g && (str(g.category) || arr(g.items).length); });
    setHTML('skills-grid', groups.map(function (group, i) {
      var items = arr(group.items).filter(function (it) { return it && str(it.name); }).map(function (it) {
        var level = clampLevel(it.level);
        return '<li class="skill"><div class="skill-row"><span class="skill-name">' + escapeHTML(str(it.name)) +
          '</span><span class="skill-pct">' + level + '%</span></div>' +
          '<div class="skill-bar" role="progressbar" aria-label="' + escapeHTML(str(it.name)) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + level + '">' +
          '<span class="skill-fill" style="--level:' + level + '%"></span></div></li>';
      }).join('');
      return '<div class="skill-card reveal tilt" style="--i:' + i + '"><div class="skill-card-head"><span class="skill-icon">' +
        icon(group.icon || 'code') + '</span><h3>' + escapeHTML(str(group.category)) + '</h3></div>' +
        '<ul class="skill-list">' + items + '</ul></div>';
    }).join(''));
    setSectionHidden('skills', !groups.length);
  }

  function tagsHTML(tags) {
    var list = arr(tags).map(str).filter(Boolean);
    if (!list.length) return '';
    return '<div class="tag-list">' + list.map(function (t) {
      return '<span class="tag">' + escapeHTML(t) + '</span>';
    }).join('') + '</div>';
  }

  var VISIBLE_HIGHLIGHTS = 3;

  function renderExperience(data) {
    var jobs = arr(data.experience).filter(function (j) { return j && (str(j.role) || str(j.company)); });
    setHTML('experience-timeline', jobs.map(function (job, i) {
      var current = !job.end;
      var highlights = arr(job.highlights).filter(function (h) { return h && (str(h.text) || str(h.title)); });
      var listId = 'exp-highlights-' + i;
      var hl = highlights.map(function (h, idx) {
        var title = str(h.title);
        if (title && !/[:.!?—-]$/.test(title)) title += ':';
        return '<li' + (idx >= VISIBLE_HIGHLIGHTS ? ' class="extra"' : '') + '>' +
          (title ? '<strong>' + escapeHTML(title) + '</strong> ' : '') + escapeHTML(str(h.text)) + '</li>';
      }).join('');
      var duration = formatDuration(job.start, job.end);
      var location = str(job.location);
      var summary = str(job.summary);
      var extraCount = highlights.length - VISIBLE_HIGHLIGHTS;

      return '<article class="timeline-item reveal' + (current ? ' is-current' : '') + '" style="--i:' + i + '">' +
        '<div class="timeline-dot"></div><div class="timeline-card">' +
        '<header class="timeline-head"><div>' +
          '<h3 class="timeline-role">' + escapeHTML(str(job.role)) + '</h3>' +
          '<p class="timeline-company">' + escapeHTML(str(job.company)) + '</p>' +
        '</div><div class="timeline-meta">' +
          '<span class="timeline-date">' + escapeHTML(formatRange(job.start, job.end)) + '</span>' +
          (duration ? '<span class="timeline-duration">' + escapeHTML(duration) + '</span>' : '') +
          (location ? '<span class="timeline-location">' + escapeHTML(location) + '</span>' : '') +
        '</div></header>' +
        (summary ? '<p class="timeline-summary">' + escapeHTML(summary) + '</p>' : '') +
        (hl ? '<ul class="timeline-highlights" id="' + listId + '">' + hl + '</ul>' : '') +
        (extraCount > 0
          ? '<button type="button" class="timeline-toggle" aria-expanded="false" aria-controls="' + listId + '" data-more="' + extraCount + '">Show more (' + extraCount + ')</button>'
          : '') +
        tagsHTML(job.tags) +
        '</div></article>';
    }).join(''));
    setSectionHidden('experience', !jobs.length);
  }

  function onTimelineClick(event) {
    var btn = event.target && event.target.closest ? event.target.closest('.timeline-toggle') : null;
    if (!btn || !this.contains(btn)) return;
    var card = btn.closest('.timeline-card');
    var item = btn.closest('.timeline-item');
    var expanded = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    var more = btn.getAttribute('data-more');
    btn.textContent = expanded ? 'Show less' : 'Show more' + (more ? ' (' + more + ')' : '');
    if (card) card.classList.toggle('is-expanded', expanded);
    if (item) item.classList.toggle('is-expanded', expanded);
  }

  /** Top N tags by frequency (ties keep first-seen order). */
  function topTags(projects, limit) {
    var counts = {};
    var order = [];
    projects.forEach(function (p) {
      var seen = {};
      arr(p.tags).map(str).filter(Boolean).forEach(function (t) {
        var key = t.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        if (!has.call(counts, key)) { counts[key] = { label: t, n: 0, first: order.length }; order.push(key); }
        counts[key].n++;
      });
    });
    return order.map(function (k) { return counts[k]; })
      .sort(function (a, b) { return (b.n - a.n) || (a.first - b.first); })
      .slice(0, limit);
  }

  function renderProjects(data) {
    var projects = arr(data.projects).filter(function (p) { return p && str(p.title); });
    setHTML('projects-grid', projects.map(function (p, i) {
      var url = safeUrl(p.url);
      var tagKeys = arr(p.tags).map(str).filter(Boolean).map(function (t) { return t.toLowerCase(); }).join('|');
      var context = str(p.context);
      var description = str(p.description);
      return '<article class="project-card reveal tilt" style="--i:' + i + '" data-tags="' + escapeHTML(tagKeys) + '">' +
        '<div class="project-icon">' + icon(p.icon) + '</div>' +
        (context ? '<p class="project-context">' + escapeHTML(context) + '</p>' : '') +
        '<h3 class="project-title">' + escapeHTML(str(p.title)) + '</h3>' +
        (description ? '<p class="project-desc">' + escapeHTML(description) + '</p>' : '') +
        tagsHTML(p.tags) +
        (url ? '<a class="project-link" href="' + escapeHTML(url) + '"' +
          (isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '') +
          ' aria-label="View ' + escapeHTML(str(p.title)) + '">View →</a>' : '') +
        '</article>';
    }).join(''));

    var filters = $('project-filters');
    if (filters) {
      var tags = topTags(projects, 6);
      if (projects.length > 1 && tags.length) {
        filters.setAttribute('role', 'group');
        if (!filters.hasAttribute('aria-label')) filters.setAttribute('aria-label', 'Filter projects by technology');
        filters.innerHTML = '<button type="button" class="filter-btn is-active" data-filter="all" aria-pressed="true">All</button>' +
          tags.map(function (t) {
            return '<button type="button" class="filter-btn" data-filter="' + escapeHTML(t.label.toLowerCase()) + '" aria-pressed="false">' +
              escapeHTML(t.label) + '</button>';
          }).join('');
        filters.hidden = false;
      } else {
        filters.innerHTML = '';
        filters.hidden = true;
      }
    }
    setSectionHidden('projects', !projects.length);
  }

  function applyProjectFilter(value) {
    var grid = document.getElementById('projects-grid');
    if (!grid) return;
    var cards = grid.querySelectorAll('.project-card');
    for (var i = 0; i < cards.length; i++) {
      var tags = (cards[i].getAttribute('data-tags') || '').split('|');
      var show = value === 'all' || tags.indexOf(value) !== -1;
      cards[i].classList.toggle('is-hidden', !show);
      if (show) cards[i].removeAttribute('aria-hidden');
      else cards[i].setAttribute('aria-hidden', 'true');
    }
  }

  function onFilterClick(event) {
    var btn = event.target && event.target.closest ? event.target.closest('.filter-btn') : null;
    if (!btn || !this.contains(btn)) return;
    var buttons = this.querySelectorAll('.filter-btn');
    for (var i = 0; i < buttons.length; i++) {
      var active = buttons[i] === btn;
      buttons[i].classList.toggle('is-active', active);
      buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    applyProjectFilter(btn.getAttribute('data-filter') || 'all');
  }

  /** Arrow keys / Home / End move focus between filter buttons (Enter/Space work natively). */
  function onFilterKeydown(event) {
    var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: 'first', End: 'last' };
    if (!has.call(keys, event.key)) return;
    var buttons = Array.prototype.slice.call(this.querySelectorAll('.filter-btn'));
    var index = buttons.indexOf(document.activeElement);
    if (index === -1 || !buttons.length) return;
    event.preventDefault();
    var step = keys[event.key];
    var next = step === 'first' ? 0 : step === 'last' ? buttons.length - 1 : (index + step + buttons.length) % buttons.length;
    buttons[next].focus();
  }

  function credCard(i, iconName, title, sub, url) {
    var heading = escapeHTML(title);
    if (url) {
      heading = '<a href="' + escapeHTML(url) + '"' + (isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + heading + '</a>';
    }
    return '<div class="cred-card reveal" style="--i:' + i + '"><span class="cred-icon">' + icon(iconName) + '</span>' +
      '<div><h4>' + heading + '</h4>' + (sub ? '<p>' + escapeHTML(sub) + '</p>' : '') + '</div></div>';
  }

  function renderCredentials(data) {
    var certs = arr(data.certifications).filter(function (c) { return c && str(c.name); });
    var certEl = setHTML('certifications-list', certs.map(function (c, i) {
      var sub = [str(c.issuer), str(c.year)].filter(Boolean).join(' · ');
      return credCard(i, 'award', str(c.name), sub, safeUrl(c.url));
    }).join(''));
    if (certEl) certEl.hidden = !certs.length;

    var edu = arr(data.education).filter(function (e) { return e && (str(e.school) || str(e.degree)); });
    var eduEl = setHTML('education-list', edu.map(function (e, i) {
      var degree = [str(e.degree), str(e.field)].filter(Boolean).join(' — ');
      var years = [str(e.start), str(e.end)].filter(Boolean).join(' – ');
      var sub = [degree, years].filter(Boolean).join(' · ');
      return credCard(i + certs.length, 'graduation', str(e.school) || str(e.degree), sub, null);
    }).join(''));
    if (eduEl) eduEl.hidden = !edu.length;

    setSectionHidden('credentials', !certs.length && !edu.length);
  }

  function contactItem(i, iconName, label, value, href) {
    var url = safeUrl(href);
    var inner = '<span class="contact-icon">' + icon(iconName) + '</span><span><small>' + escapeHTML(label) + '</small>' + escapeHTML(value) + '</span>';
    if (!url) return '<div class="contact-item reveal" style="--i:' + i + '">' + inner + '</div>';
    return '<a class="contact-item reveal" style="--i:' + i + '" href="' + escapeHTML(url) + '"' +
      (isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + inner + '</a>';
  }

  /** Digits-only international number from data.whatsapp.number, or '' when unset/invalid. */
  function whatsappNumber(data) {
    // "00216…" (international dialling prefix) → "216…", which is what wa.me expects
    var digits = str(data.whatsapp && data.whatsapp.number).replace(/\D/g, '').replace(/^00/, '');
    return digits.length >= 8 ? digits : '';
  }

  function prettyUrl(url) {
    return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  }

  function renderContact(data) {
    var contact = data.contact || {};
    var items = [];
    var email = str(contact.email);
    var phone = str(contact.phone);
    var location = str(contact.location) || str(data.profile && data.profile.location);
    if (email) items.push(['email', 'Email', email, 'mailto:' + email]);
    if (phone) items.push(['phone', 'Phone', phone, 'tel:' + phone.replace(/[^\d+]/g, '')]);
    var waNumber = whatsappNumber(data);
    if (waNumber) items.push(['whatsapp', 'WhatsApp', 'Chat with me', 'https://wa.me/' + waNumber]);
    if (location) items.push(['location', 'Location', location, 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(location)]);
    arr(data.socials).forEach(function (s) {
      var iconName = str(s && s.icon).toLowerCase();
      var url = safeUrl(s && s.url);
      if (!url || !isExternal(url) || iconName === 'email' || iconName === 'phone') return;
      items.push([iconName, str(s.name) || 'Link', prettyUrl(url), url]);
    });
    setHTML('contact-info', items.map(function (it, i) {
      return contactItem(i, it[0], it[1], it[2], it[3]);
    }).join(''));
  }

  function renderFooter(data) {
    setText('footer-name', str(data.profile && data.profile.name));
    setText('footer-year', String(new Date().getFullYear()));
  }

  /* ------------------------------------------------------------------ *
   * Event wiring (once per stable mount point — survives re-renders)
   * ------------------------------------------------------------------ */

  function bindOnce(id, type, handler) {
    var el = document.getElementById(id);
    if (!el) return;
    el.__portfolioBound = el.__portfolioBound || {};
    if (el.__portfolioBound[type]) return;
    el.__portfolioBound[type] = true;
    el.addEventListener(type, handler);
  }

  function bindEvents() {
    bindOnce('experience-timeline', 'click', onTimelineClick);
    bindOnce('project-filters', 'click', onFilterClick);
    bindOnce('project-filters', 'keydown', onFilterKeydown);
  }

  /* ------------------------------------------------------------------ *
   * Main
   * ------------------------------------------------------------------ */

  var STEPS = [renderMeta, renderHero, renderSocials, renderAbout, renderSkills,
    renderExperience, renderProjects, renderCredentials, renderContact, renderFooter];

  function render(data) {
    data = data || window.PORTFOLIO_DATA;
    if (!data || typeof data !== 'object') {
      if (window.console) {
        console.error('[portfolio] window.PORTFOLIO_DATA is missing or invalid. ' +
          'Check that js/data.js is loaded before js/render.js and has no syntax errors (open the browser console).');
      }
      return false;
    }
    STEPS.forEach(function (step) {
      try {
        step(data);
      } catch (err) {
        if (window.console) console.error('[portfolio] ' + (step.name || 'render step') + ' failed:', err);
      }
    });
    bindEvents();

    window.__portfolioRendered = true;
    var evt;
    try {
      evt = new CustomEvent('portfolio:rendered', { detail: { data: data } });
    } catch (e) {
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('portfolio:rendered', false, false, { data: data });
    }
    document.dispatchEvent(evt);
    return true;
  }

  window.Portfolio = {
    render: render,
    // Exposed for animations.js / debugging; not required by the contract.
    utils: { escapeHTML: escapeHTML, safeUrl: safeUrl, formatDuration: formatDuration, formatRange: formatRange, icon: icon,
      whatsappNumber: whatsappNumber }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { render(); });
  } else {
    render();
  }
})();

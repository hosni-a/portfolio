# QA Report — Hosni Ben Ammar portfolio

QA: Collaborator 3 · Date: 2026-10-22 · Build tested: working tree (index.html, css/style.css, js/*.js, README.md)

## Verdict

**Ready to ship once the owner confirms the content points below.** Everything in the test plan works over both `file://` and `http://`, with no console errors or warnings. Editing `js/data.js` is robust: adding, removing and emptying items works, optional fields can be left out, all strings are HTML-escaped, and unsafe URLs are dropped. I found 7 bugs (2 medium, 5 low) and fixed all of them; the fixes are listed below. Nothing blocking is left open. What remains is a few content claims in `data.js` that are not in the LinkedIn PDF; the owner needs to confirm or remove them (see [Data fidelity](#data-fidelity-vs-profilepdf)).

## How it was tested

- Headless Chrome driven over CDP. The scripts extend Collaborator 1's `cdp.mjs` and live in the session scratchpad (`…/scratchpad/qa/`): `lib.mjs`, `t1_functional.mjs`, `t2_data.mjs`, `t3_resp_a11y.mjs`, `crops.mjs`. Screenshots are in `out*/`.
- For the data-editing tests, a local Node static server served a **modified copy** of `data.js` in place of the real one. That copy was built by `JSON.parse` on the real file, which also confirms the file is valid JSON as the README claims. The real `js/data.js` was never changed for testing.
- I reviewed every screenshot by eye. Contrast ratios were computed in the page from computed colours, compositing translucent backgrounds; text on gradients was checked by hand against each gradient stop.
- Every test was run again after the fixes, and all passed.

## Test matrix

| # | Area | Check | file:// | http:// |
|---|---|---|---|---|
| 1 | Functional | All 7 sections render (7 jobs, 6 projects, 5 skill groups / 32 skills, 4 stats, 1 cert, 1 education, 4 contact items) | PASS | PASS |
| 1 | | No console errors or warnings | PASS | PASS (only the server's favicon 404) |
| 1 | | Nav links scroll to their section (section top lands 84 px below the viewport top, clear of the fixed header) | PASS | PASS |
| 1 | | Active-link highlight and `aria-current` follow the scroll position | PASS | PASS |
| 1 | | Mobile menu: open, focus moves to first link, link click closes and scrolls, Esc closes and returns focus, Tab out of the header closes it | PASS | PASS |
| 1 | | Theme toggle, aria-label update, `localStorage` persistence across reload; default follows the system theme | PASS | PASS |
| 1 | | Typewriter cycles through roles; screen-reader copy holds the full list | PASS | PASS |
| 1 | | Counters end on the right values (5+, 6, 4, 1) | PASS | PASS |
| 1 | | Skill bars fill to `--level` | PASS | PASS |
| 1 | | Timeline toggle: 3 → 10 → 3 visible items, `aria-expanded` and `aria-controls` valid, label "Show more (n)" / "Show less" | PASS | PASS |
| 1 | | Project filters: correct counts per tag, one `is-active` button, `aria-pressed` set, arrow-key navigation | PASS | PASS |
| 1 | | Copy-email toast appears and hides after 2.6 s | PASS | PASS |
| 1 | | Back-to-top shows after the first screen, scrolls to the top and moves focus to the brand link | PASS | PASS |
| 1 | | Loader disappears (`hidden`) | PASS | PASS |
| 2 | Data editing | Add a job (current), project (with URL, relative URL, unknown icon), skill group and skill, stats (including a decimal), socials (GitHub, website), certification with URL | PASS | |
| 2 | | Remove jobs, projects, skills, stats, socials, all certifications | PASS | |
| 2 | | Every array empty → its section **and** nav link hidden; Credentials hidden only when both lists are empty; contact panel still renders | PASS (after fix B3) | |
| 2 | | Whole keys missing (`socials`, `stats`, `experience`, …) → same as empty, no errors | PASS | |
| 2 | | Optional fields: `location: null` or missing, no `tags`/`summary`/`highlights`, highlight without title, year-only dates, missing `end` (= Present), no `meta` (title falls back to name), no phone, cert with year + URL, education without field | PASS | |
| 2 | | `photo` set to a working image shows `<img alt=name>`; a broken path falls back to initials; `cvUrl` relative or https shows the CV button | PASS | |
| 2 | | Skill `level` out of range (160, −5) is clamped; a string `"40"` is accepted | PASS | |
| 2 | | Duplicate or mixed-case tags (`Docker`, `docker`) counted once per project in the filters | PASS | |
| 2 | | HTML injection (`<img src=x onerror=…>`) in every text field, the attribute-breakout payload `"><img…>`, and a malicious icon name: all rendered as text, 0 executions | PASS | |
| 2 | | `javascript:` URL variants (mixed case, leading spaces, `java\tscript:`, `java\nscript:`), `data:`, `vbscript:`, `//host`, `\\host`, non-string URLs: all rejected. A literal `javascript&colon;…` stays a harmless relative link | PASS | |
| 2 | | Syntax error in data.js → clear console message, page does not crash | PASS (see open item O2) | |
| 2 | | Trailing comma (valid JavaScript, invalid JSON) still renders | PASS | |
| 2 | | `Portfolio.render()` run 5× and 20×: no duplicate name letters, typewriter, listeners (+0) or IntersectionObservers (+0); toggle and filter fire once per click; DOM node count back to baseline after GC | PASS | |
| 2 | | `Portfolio.render(newData)`: name, brand, roles, copy-email address, hidden sections and nav all follow the new data, and then the original data again | PASS (after fix B1) | |
| 3 | Responsive | 360 / 414 / 768 / 1024 / 1280 / 1440 / 1920, dark and light: no horizontal scroll (`scrollWidth == clientWidth`), no clipped text, typewriter never truncated, hero readable (h1 41.6 px at 360) | PASS | |
| 4 | Accessibility | Tab order: skip link → brand → nav → theme → CTAs → socials → scroll cue → timeline toggles → filters → copy email → contact → footer → back-to-top; 2 px focus outline on every stop | PASS | |
| 4 | | Icon-only links and buttons all have accessible names; no duplicate ids; `lang="en"`; one each of main, nav, header and footer | PASS | |
| 4 | | Heading order h1 → h2 → h3 → h4 with no skipped levels | PASS | |
| 4 | | Contrast ≥ 4.5:1 for all body and small text in **dark** (lowest: `.timeline-duration` 4.65) | PASS | |
| 4 | | Contrast in **light** (lowest after fix: `--faint` text 4.99; teal text 5.08; white on gradient ≥ 5.55) | PASS (after fix B2) | |
| 4 | | `prefers-reduced-motion`: every `.reveal` at opacity 1, no letter split, typewriter static, stats and bars final, canvas hidden, custom cursor off, 0 running animations | PASS | |
| 5 | Performance | Canvas: about 60 fps while the hero is visible, **0** draws when the hero is off-screen or the tab is hidden, resumes afterwards | PASS | |
| 5 | | Scroll stress test (264 programmatic scroll steps): 0 long tasks, worst frame 19 ms; one passive scroll listener batched into rAF, reads before writes, geometry cached | PASS | |
| 5 | | Layout shift: CLS 0.10, all at about 450 ms behind the loader (see O1) | INFO | |
| 6 | Code review | Generated classes vs. CSS: every class render.js emits is styled except `.icon`, `.icon-*` and `.timeline-location`, which inherit their parent's style on purpose. No CSS rules left for markup that no longer exists | PASS | |
| 7 | README | Every editing recipe followed literally (add/update/remove job, project, skill, stat, social, photo, CV, icons, `availability: ""`, security note) works as written | PASS (after fix B7) | |

## Bugs found

| ID | Severity | File:line (after fix) | Description | Status |
|---|---|---|---|---|
| B1 | Medium | js/animations.js:33-35, 874-877 | `animations.js` always read `window.PORTFOLIO_DATA`, so after `Portfolio.render(newData)` the brand text, typewriter roles and **copied email** still came from the old data. This contradicts the contract's `render(data?)` API. | **Fixed.** The data from the `portfolio:rendered` event (`e.detail.data`) is stored and preferred, with `window.PORTFOLIO_DATA` as the fallback. |
| B2 | Medium (a11y) | css/style.css:88, 108 | In light theme, `--accent-2: #0a8f86` gave 3.64:1 on the page background. It is used for small text: section kickers, "Hello, I'm", "Show more", project context, the View link. White text over the teal end of the button and filter gradients was 3.97:1. | **Fixed.** Changed to `#067570`: 5.08:1 on `--bg`, 4.67:1 on `--bg-2`, white on it 5.55:1. Same hue, slightly darker. The no-JS fallback block was updated too. |
| B3 | Low | js/animations.js:237-244 | When `projects` or `about`/`stats` are empty, the "View my work" CTA and the "Scroll" cue still pointed at the hidden section, so clicking did nothing. | **Fixed.** `syncNavVisibility()` now also hides hero CTAs and the scroll cue whose target section is hidden. |
| B4 | Low | index.html:119 | `#cv-link` started visible with `href="#"`. If `data.js` has a syntax error and render never runs, a dead "Download CV" button appeared. | **Fixed.** Added the `hidden` attribute; render.js already sets `hidden = false` when `cvUrl` is valid. |
| B5 | Low | js/render.js:289-291 | Stat values were rendered as the text `0`. If animations.js fails (the `no-anim` failsafe) or for non-JS readers and crawlers, every stat read "0". | **Fixed.** The final value (`5+`) is emitted as the text; the count-up still starts from 0 when the stat is revealed, which was verified. |
| B6 | Low | js/animations.js:598-607 | When `navigator.clipboard.writeText` rejected (permission denied, document not focused), the user got the error toast instead of a working copy. | **Fixed.** A rejection now falls back to the `execCommand('copy')` path. |
| B7 | Low (docs) | README.md:48, js/data.js:7-8 | Said to paste "everything after `window.PORTFOLIO_DATA = `" into a JSON validator. That text includes the final `;`, which makes every validator report an error. | **Fixed.** Wording now says "without the final `;`". This is a comment-only change in data.js; no content changed. |

### Open items (not fixed — minor or need a decision)

| ID | Severity | Where | Note |
|---|---|---|---|
| O1 | Info | render timing | CLS is 0.10 because the hero grows when content is injected and the web fonts swap (about 450 ms). This happens under the opaque loader, so users never see it. Lighthouse will still report it. Optional fix: give `.hero-inner` a `min-height`. |
| O2 | Low | render.js `render()` | If `data.js` fails to parse, render logs a clear error but leaves every section with its heading and an empty body. That is acceptable, since the owner will see the problem immediately and the README troubleshooting covers it. Hiding the sections in that case is optional. |
| O3 | Info | data / render | Aftercode has 4 highlights, so it gets a "Show more (1)" button for a single item, and its dates show as "Apr 2021 — Apr 2021". Optional polish: raise the toggle threshold to ≥2 extras and collapse identical start/end months. |
| O4 | Info | index.html contact copy | "My inbox is always open" is static text. It still shows if `contact.email` is emptied. |

## Data fidelity vs Profile.pdf

**Correct, checked line by line:**
- Name, headline (verbatim) and location "Sfax, Tunisia".
- Email `hosni.ben.ammar@hotmail.com`, phone `+21658996930`, LinkedIn `linkedin.com/in/hosnibenammar`.
- All three About paragraphs (verbatim).
- All 7 positions: company, title, start/end month and location match. The rendered durations match LinkedIn exactly: 6 mos, 1 yr 8 mos, 1 yr 7 mos, 8 mos, 10 mos, 4 mos, 1 mo.
- Certification "Odoo 19 Functional Certification", issuer Odoo, no year (none given in the PDF).
- Education: school, degree, field, 2017–2021.
- Highlights are faithful paraphrases of the PDF bullets, changed to past tense. A few repetitive bullets were merged or dropped for Alfa Print 2022, Mansour Modern School and Aftercode. Nothing was added.
- Tags and skills all come from the PDF "Skills" lines and bullets.
- "6 Companies" is correct (DarbTech, Alfa Print, Campion-Tech, SlneeIT, Mansour Modern School, Aftercode).

**Not in the PDF. The owner should confirm or remove these** (no change made):
1. `profile.availability`: "Open to freelance & collaborations" is a claim about the owner's availability that the PDF does not make. Set it to `""` to hide the badge.
2. `stats`: "4 Markets served" is an inference (France, Switzerland, Middle East, Tunisia?) and is not stated anywhere.
3. `skills[].items[].level`: all percentages (55–95 %) are invented. The PDF has no proficiency levels. The owner should set real values or accept them as self-assessment.
4. `profile.roles`: "ERP Architect" and "Integration Specialist" are derived from the headline ("Specialist in Customization, Integration…") rather than job titles. "Tech Lead" matches the Alfa Print title.
5. `projects`: these are curated from the experience bullets, which is fine. Two small additions: "Odoo 15 → 17 Migration" says "porting custom modules and data", while the PDF only says "transitioning systems … ensuring seamless integration"; and its context "ERP version upgrades" names no employer.
6. DarbTech highlight titles ("Implementation Audits", "End-to-End Delivery", "Engineering Standards") are editorial headings; the PDF bullets have no titles. They are harmless.
7. The PDF's "Top Skills" (Design, Web Applications, Mission Critical) are not shown anywhere. This is an omission, not an error.
8. Static copy in index.html ("Turning business processes into elegant software", "Let's build something great together", the `import odoo` decorative chips) is marketing tone and makes no factual claims.

## Suggestions (subjective — not applied)

- **Hero headline:** the full LinkedIn headline repeats the typewriter role and wraps to 3 lines on desktop. A shorter one-line headline could live in `profile.headline`, leaving the LinkedIn version in `meta.description`.
- **Back-to-top button:** on 360–414 px it overlaps the bottom-right of cards while scrolling. Consider moving it up slightly or giving it some transparency.
- **1024 px:** the `{ REST: 200 }` chip overlaps the avatar ring. It is decorative but looks a bit crowded.
- **Contact panel:** when socials and contact are empty, the panel leaves a large empty block (see the empty-data screenshot). Adding `min-height: auto` behaviour or a short fallback line would help.
- **Theme toggle:** consider `aria-pressed` alongside the changing label. This is optional; the label already conveys the state.
- **Re-render observers:** the reveal IntersectionObserver keeps watching removed nodes until GC. No measurable leak was found (node count returns to baseline), but calling `revealIO.unobserve` on old nodes before re-render would be cleaner if live editing is ever built on `Portfolio.render`.

## Fix log

| Fix | File | Change |
|---|---|---|
| B1 | js/animations.js | `renderedData` variable; `getData()` prefers it; the `portfolio:rendered` listener stores `e.detail.data`. |
| B2 | css/style.css | Light `--accent-2` changed `#0a8f86` → `#067570` (2 places). |
| B3 | js/animations.js | `syncNavVisibility()` hides `.hero-ctas a[href^="#"]` and `.scroll-indicator` when the target section is hidden. |
| B4 | index.html | `hidden` attribute added on `#cv-link`. |
| B5 | js/render.js | `.stat-value` initial text is the final value instead of `0`. |
| B6 | js/animations.js | `copyText()` falls back to `legacyCopy()` when the Clipboard API rejects. |
| B7 | README.md, js/data.js (comment only) | JSON-validator instruction now mentions dropping the final `;`. |

---

# WhatsApp button

The lead added this feature after the main report above. Scope: `js/whatsapp.js`, the `whatsapp` block in `js/data.js`, `whatsappNumber()` and the contact item in `js/render.js`, CSS section 17b, and the README section.

## Verdict (WhatsApp)

**Ship it with the fixes below.** I found one high-severity bug: clicking **Send** opened WhatsApp in a new tab **and** navigated the portfolio tab itself to WhatsApp. This happened on both `file://` and `http://`. The lead's smoke test missed it because it replaced `window.open` with a stub that returns an object. Real Chrome returns `null` whenever the `'noopener'` feature is passed, so the "popup blocked" fallback always ran.

I found 14 issues in total: 1 high, 3 medium, 9 low and 1 docs. All 14 are fixed and re-tested. The lead's own smoke test (`t_whatsapp.mjs`) and my functional suite (`t1_functional.mjs`) still pass after the fixes, with no console errors.

Open items needing the owner (details under "Open items"):
- The brand-green button fails non-text contrast for its white icon.
- Pressing Send with an empty box sends the first quick topic's text.
- The WhatsApp content (number, working hours, reply-time promise, teaser and messages) needs confirming.

## How it was tested

The test script is `…/scratchpad/qa/t_wa_qa.mjs`; screenshots are in `out_waqa3/`. It runs:
- A real, unstubbed `window.open`, with tab counting over CDP.
- A keyboard-only flow driven by CDP key events.
- In-page contrast checks in both themes.
- Reduced motion.
- `Portfolio.render()` while the button is focused and while the panel is open.
- Geometry at 740×360, 360×640, 414×896 and 1440×900, with the site header visible, a toast showing, and the mobile menu open.
- 13 edge-case `data.js` variants, served over http.
- A frozen clock (`Date` patched before load) to test the time and day boundaries.

## Test matrix (WhatsApp)

| Area | Check | Result |
|---|---|---|
| Send | file:// and http:// with real `window.open`: exactly one new tab (`api.whatsapp.com/send?phone=21658996930&text=…`); the portfolio tab stays put | **FAIL → fixed (W1)**, then PASS |
| Send | Chip prefill, Enter sends, Shift+Enter adds a new line, URL encoding, panel closes after sending | PASS |
| Keyboard | Shift+Tab from the top of the page reaches the button first. Enter opens the panel and focus moves to the first chip. Tab order: chips → textarea → send → button (now "Close WhatsApp chat") → back to the page. Shift+Tab leaves through the close button into the page. Esc returns focus to the button. | PASS |
| Keyboard | Esc while focus has moved outside the open panel closes it | **FAIL → fixed (W6)** |
| Keyboard | IME composition: Enter that confirms a composition must not send | **FAIL → fixed (W7)** (code review) |
| Screen reader | Panel has `role=dialog`, `aria-modal=false` and is labelled by the owner's name. The button has `aria-expanded`/`aria-controls` and its label switches between "Chat on WhatsApp" and "Close WhatsApp chat". Chips are in a group labelled "Quick topics"; the textarea has a hidden `<label>`; icons are `aria-hidden`; the badge is `aria-hidden` | PASS (see O-W6) |
| Focus visibility | Close button focus ring on the green header | **FAIL → fixed (W3)**: was the theme teal on green (≈1.1:1 light, under 3:1 dark); now white, 4.4:1 |
| Contrast | Header title, white on #075e54–#128c7e: 7.7 / 5.6:1 | PASS |
| Contrast | Status line (12.5 px) white at 90% opacity on #128c7e: **3.66:1** | **FAIL → fixed (W4)**: now 100% opacity on a darker end stop, ≥5.7:1 |
| Contrast | Badge "1": white on #e53935, 4.23:1 | **FAIL → fixed (W12)**: #d32f2f, 4.98:1 |
| Contrast | Textarea placeholder (UA default), 4.2:1 | **FAIL → fixed (W12)**: `var(--faint)`, 5.84 dark / 4.99 light |
| Contrast | Chips, bubble, teaser, input text (≥15:1); "replies within…" and teaser × (5.4:1); send icon (4.1:1, non-text) | PASS |
| Contrast | Button icon, white on the #25d366 → #128c7e gradient: 1.98:1 at the light end, 2.8:1 in the middle (needs 3:1 as a non-text graphic) | **OPEN (O-W1)**, brand colour |
| Reduced motion | Button, panel, bubble and chips all at full opacity immediately; 0 running animations; pulse plays once | PASS |
| Re-render | `Portfolio.render()` replayed the button's entrance animation (invisible for about 1.4–2 s), dropped focus to `<body>` and closed an open panel | **FAIL → fixed (W2)**: no replay, focus kept, open state kept |
| Re-render | 10× re-render: no duplicate listeners (also covered by the lead's test) | PASS |
| Layout | 740×360 landscape with the header visible: panel top was 30 px, under the 62 px fixed header, so the close button was partly covered | **FAIL → fixed (W5)**: panel top now 70 px; the body scrolls |
| Layout | ≤600 px: the toast (z-index 1300) covered the button | **FAIL → fixed (W13)**: toast lifted above the button when the widget is present |
| Layout | Back-to-top stacks above the button (88 px / 84 px) and drops back to 20 px when there is no WhatsApp block. Panel width stays within the viewport; no horizontal scroll at any size | PASS |
| Layout | Mobile menu open: the menu covers the button and teaser (`elementFromPoint` hits `.nav-menu`), with no stray clicks | PASS |
| Data | Very long greeting, name, reply time and teaser wrap. Long message: the textarea grows to 120 px, then scrolls | PASS |
| Data | Long unbroken chip label | **FAIL → fixed (W11)**: overflowed the panel; now wraps |
| Data | Number formats: `"+216 58-996-930"` and the integer `21658996930` work; under 8 digits or text hide the widget and the contact item | PASS |
| Data | Number with `"00216…"` produced the broken link `wa.me/0021658996930` | **FAIL → fixed (W8)** |
| Data | `hours.days` as strings (`["1","2"]`) showed "Away" permanently; `"9:99"` was accepted as 10:39 | **FAIL → fixed (W9)** |
| Data | Invalid timezone: no warning, and the visitor's own clock was labelled "in Sfax". Invalid or overnight hours were ignored silently | **FAIL → fixed (W10)**: console warning, city label dropped |
| Data | `hours: null`, `messages: []` (focus goes to the textarea), `teaserDelay: "1"` (string), teaser dismiss persists in `sessionStorage`, whatsapp block removed | PASS |
| Time logic | All checked with Mon–Sat 09:00–18:00, Africa/Tunis: Sat 08:59 → "back today at 09:00"; 09:00 → Online; 17:59 → Online; 18:00 → "back Monday"; Sun 12:00 and 23:59 → "back tomorrow"; Mon 00:00 → "back today"; Sat 23:30 with days=[Fri] → "back Friday"; `days: []` → Away with no promise; `end "24:00"` at 23:59 → Online; timezone Asia/Tokyo uses Tokyo's clock | PASS |
| README | Every bullet in "WhatsApp chat button" matches the behaviour | PASS after doc fix (W14) |

## Bugs (WhatsApp)

| ID | Severity | File:line (after fix) | Description | Fix |
|---|---|---|---|---|
| W1 | **High** | js/whatsapp.js:233-237 | `window.open(url, '_blank', 'noopener')` always returns `null`, so the "popup blocked" fallback `location.href = url` always ran. The visitor got WhatsApp in a new tab **and** lost the portfolio page. | Open without the feature string, then set `win.opener = null`. The fallback now runs only when the popup really is blocked. |
| W2 | Medium | js/whatsapp.js:311-331, css/style.css:1492-1493 | Every `portfolio:rendered` rebuilt the button with its 1.4 s-delayed entrance animation, so the button vanished and popped back in. Focus fell to `<body>` and an open panel closed. | Re-renders add `.is-ready`, which disables the entrance animation; focus and open state are restored. |
| W3 | Medium (a11y) | css/style.css:1614-1615 | The global focus ring (teal `--accent-2`) on the close button sits on the green header: about 1.1:1 in the light theme. | `.wa-head :focus-visible { outline-color: #fff }`. |
| W4 | Medium (a11y) | css/style.css:1577-1578, `.wa-status` | Status text was white at 90% opacity on #128c7e: 3.66:1 at 12.5 px. | Full opacity; gradient end stop #0b7366 (5.74:1). |
| W5 | Low | css/style.css:1561-1562 | `max-height: 100dvh - 120px` ignored the fixed header. On landscape phones the panel's top 32 px, including the close button, sat under the header. | `max-height` now subtracts `--nav-h`, the button's space and the safe areas. |
| W6 | Low | js/whatsapp.js:292-296 | Esc only worked while focus was inside the widget. After tabbing out, the open, non-modal panel stayed over the content and couldn't be dismissed by keyboard without tabbing back. | Document-level Esc closes the panel when focus is outside it; focus is left where it is. |
| W7 | Low | js/whatsapp.js:274 | Enter used to confirm an IME composition (for example Arabic input) sent the half-typed message. | `!e.isComposing` guard. |
| W8 | Low | js/render.js:520-521 | The number `"00216 …"` became `wa.me/00216…`, which is invalid. | Strip a leading `00`. |
| W9 | Low | js/whatsapp.js:46-50, 110-112 | `days: ["1","2"]` never matched, so the status was always Away. Minutes over 59 were accepted. | Coerce days with `Number`; reject `mm > 59` and times after 24:00. |
| W10 | Low | js/whatsapp.js:39-44, 62-64, 89, 113-118 | Invalid timezone, invalid hours and overnight ranges failed silently. With a bad timezone the visitor's own clock was shown as "it's HH:MM in Sfax". | Console warning (`[portfolio] …`) once each; city label dropped when falling back to the local clock. |
| W11 | Low | css/style.css:1649, `.wa-head-text strong…` | Long unbroken chip labels or names overflowed the panel. | `overflow-wrap: anywhere` on chips, name, bubble and teaser. |
| W12 | Low (a11y) | css/style.css:1527, 1681 | Badge 4.23:1; placeholder about 4.2:1. | Badge #d32f2f (4.98:1); placeholder `var(--faint)` at full opacity. |
| W13 | Low | css/style.css:1698-1699 | At ≤600 px the full-width toast (z-index 1300) sat over the button. | `.has-wa .toast` lifted to 88 px on small screens. |
| W14 | Docs | README.md "WhatsApp chat button" | Didn't say that hours need `end` after `start`, that overnight ranges are unsupported, that `"24:00"` is allowed, or how the `00` prefix and short numbers are handled. | Bullets updated. |

## Open items (WhatsApp — need the owner or a designer)

| ID | Severity | Note |
|---|---|---|
| O-W1 | Low (a11y) | The button's white icon on #25d366 is 1.98:1 (WCAG 1.4.11 asks for 3:1). This is WhatsApp's own brand green, so it is a brand-versus-accessibility call. Starting the gradient at #128c7e would give about 4.1:1. Not changed. |
| O-W2 | Owner decision | Send with an empty textarea sends `messages[0].text` ("…discuss an Odoo project…"). A visitor who just presses Send may not expect that text. Alternatives: open WhatsApp with no text, or disable Send while the box is empty. |
| O-W3 | Low | On landscape phones (740×360) the chat body shows about 43 px, roughly one line of the greeting; the chips need scrolling. It is usable. A compact header or a hidden greeting on short viewports would help. |
| O-W4 | Info | `Portfolio.render()` while the visitor is typing rebuilds the panel and the typed text is lost. Only reachable through the developer API. |
| O-W5 | Info | Overnight working hours (for example 22:00–02:00) are unsupported. This is now documented and warned in the console. |
| O-W6 | Info | The dialog's accessible name is just "Hosni Ben Ammar". Adding `aria-describedby="wa-status"` would also announce Online/Away. The teaser is deliberately not announced. |
| O-W7 | Content | Owner to confirm: the WhatsApp number 21658996930 (it matches the PDF phone; is WhatsApp active on it?), the working hours Mon–Sat 09:00–18:00 Tunis time, "Typically replies within a few hours", the teaser "Need an Odoo expert? Let's chat 💬", and the four prefilled messages. None of this is in the PDF. |

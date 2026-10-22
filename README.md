# Hosni Ben Ammar — Portfolio

Personal portfolio website for **Hosni Ben Ammar**, Senior Odoo Developer (Sfax, Tunisia).

It is a plain static site: vanilla HTML, CSS and JavaScript with no frameworks, no build step and no npm dependencies. All of the content (profile, experience, projects, skills…) is kept in **one data file**, so you can update the site without touching any HTML.

## Running it

- **Quickest:** double-click `index.html`. It works straight from the file system (`file://`).
- **Local server (optional):**
  ```bash
  npx serve .
  # or
  python -m http.server 8000
  ```
  Then open the URL it prints (for example http://localhost:3000).
- **Deploying:** upload the whole folder to any static host (GitHub Pages, Netlify, Vercel, an Apache/Nginx server, etc.).

## File structure

```
portfolio/
├── index.html          # Page layout and section mount points
├── css/
│   └── style.css       # Styles, light/dark themes, responsive layout
├── js/
│   ├── data.js         # ← ALL CONTENT LIVES HERE (the only file you need to edit)
│   ├── render.js       # Builds the page from data.js
│   ├── animations.js   # Scroll reveals, counters, typewriter, theme toggle
│   └── whatsapp.js     # Floating WhatsApp chat button
└── README.md
```

Scripts load in this order: `data.js` → `render.js` → `animations.js` → `whatsapp.js`.

---

## Editing your content

Open **`js/data.js`**. It holds a single object, `window.PORTFOLIO_DATA = { ... }`, written in **JSON format**:

- Keys and text go in **double quotes**: `"role": "Odoo Developer"`.
- Items in a list are separated by **commas**, but there is **no comma after the last item**.
- Numbers go without quotes: `"level": 90`.
- Use `null` (no quotes) for "nothing", e.g. `"url": null`.
- Dates are `"YYYY-MM"`, e.g. `"2024-09"`. For a current job, set `"end": null` and the site shows "Present".
- Text is shown exactly as written. HTML tags are **not** interpreted, so you can type `<`, `&` and quotes safely.

Because the content is pure JSON, you can paste everything after `window.PORTFOLIO_DATA = ` (without the final `;`) into a JSON validator (such as jsonlint.com) to check for a missing comma or quote.

> **Empty lists hide their section.** For example, `"projects": []` removes the Projects section from the page. Credentials is hidden only when both `certifications` and `education` are empty.

Save the file and refresh the browser to see your changes.

### Experience

Jobs are listed **newest first**, in the order you write them. Durations ("1 yr 8 mos") are calculated automatically.

**Add a job** by putting a new block at the top of the `"experience"` list:

```json
"experience": [
  {
    "company": "New Company",
    "role": "Lead Odoo Architect",
    "location": "Tunis, Tunisia",
    "start": "2027-01",
    "end": null,
    "summary": "One-sentence overview of the role (or null).",
    "highlights": [
      { "title": "Architecture", "text": "Designed the multi-company Odoo setup." },
      { "title": null, "text": "A bullet point without a bold title." }
    ],
    "tags": ["Odoo", "Python", "PostgreSQL"]
  },
  { "company": "DarbTech", ... }
]
```

- The first 3 highlights are always visible. Any extras sit behind a **Show more** button.
- `title` is shown in bold before the text. A colon is added automatically.
- `location` and `summary` can be `null`.

**Update a job** by editing its fields. For example, when you leave DarbTech, change `"end": null` to `"end": "2027-01"`.

**Remove a job** by deleting its whole `{ ... }` block, including the comma that separates it from its neighbour.

### Projects

```json
{
  "title": "Odoo Helpdesk Automation",
  "context": "DarbTech",
  "description": "Short description of what was built and why it mattered.",
  "tags": ["Odoo", "Python", "Automation"],
  "icon": "cpu",
  "url": "https://example.com/case-study"
}
```

- `url` can be `null`. If you add one, a **View →** link appears on the card.
- The filter buttons above the projects are generated from the **6 most-used tags**, so a new tag you use often becomes a filter automatically.
- Remove a project by deleting its `{ ... }` block.

### Skills

Skills are grouped into categories. `level` is a number from 0 to 100 and sets the length of the bar.

```json
{
  "category": "Cloud",
  "icon": "server",
  "items": [
    { "name": "Docker", "level": 75 },
    { "name": "AWS", "level": 60 }
  ]
}
```

To add a single skill, add `{ "name": "...", "level": 80 }` to an existing category's `items`. To remove one, delete that line.

### Stats (animated counters)

```json
"stats": [
  { "value": 5, "suffix": "+", "label": "Years of experience" },
  { "value": 20, "suffix": "+", "label": "Odoo modules delivered" }
]
```

`value` must be a number. `suffix` is any text shown after it (`"+"`, `"%"`, or `""` for none).

### Socials

```json
"socials": [
  { "name": "LinkedIn", "url": "https://www.linkedin.com/in/hosnibenammar", "icon": "linkedin" },
  { "name": "GitHub",   "url": "https://github.com/your-username",         "icon": "github" }
]
```

- Supported `icon` values: `linkedin`, `github`, `email`, `phone`, `twitter`, `website`.
- For email use `"mailto:you@example.com"`. For phone use `"tel:+21600000000"`.
- Socials appear in the hero and the footer. Web links (`https://…`) also appear in the Contact section.

### Certifications and education

```json
"certifications": [
  { "name": "Odoo 19 Functional Certification", "issuer": "Odoo", "year": null, "url": null }
],
"education": [
  { "school": "Higher Institute of Technological Studies of Nabeul", "degree": "Bachelor of Technology",
    "field": "Information Technology – Development of Information Systems", "start": "2017", "end": "2021" }
]
```

### Profile, about and contact

- `profile.roles` lists the rotating words in the hero typewriter.
- `profile.availability` is the small status badge. Set it to `""` to hide it.
- `about.paragraphs` is a list of paragraphs.
- `contact` holds the email, phone and location shown in the Contact section.
- `meta.title` and `meta.description` set the browser tab title and the search-engine description.

### WhatsApp chat button

The floating green button (bottom-right) opens a small chat panel. Visitors pick a topic or type a message, and it opens in WhatsApp (the app on phones, WhatsApp Web on desktop) with the message already filled in. A "WhatsApp" entry is also added to the Contact section.

```json
"whatsapp": {
  "number": "21658996930",
  "displayName": "Hosni Ben Ammar",
  "replyTime": "Typically replies within a few hours",
  "greeting": "Hi there 👋 …",
  "timezone": "Africa/Tunis",
  "cityLabel": "Sfax",
  "hours": { "days": [1, 2, 3, 4, 5, 6], "start": "09:00", "end": "18:00" },
  "teaser": "Need an Odoo expert? Let's chat 💬",
  "teaserDelay": 12,
  "messages": [
    { "label": "Discuss an Odoo project", "text": "Hi Hosni, I'd like to discuss an Odoo project with you." }
  ]
}
```

- `number`: international format, country code first. Spaces, `+`, dashes and a leading `00` are ignored. A number with fewer than 8 digits is treated as missing. **Remove the whole `whatsapp` block to hide the button.**
- `hours`: when you're shown as **Online** (green dot) or **Away** (amber dot, with "back tomorrow at 09:00"). `days` uses 0 = Sunday … 6 = Saturday; times are in `timezone` (an IANA name such as `"Africa/Tunis"`). Use `"HH:MM"` 24-hour times with `end` after `start` (`"24:00"` is allowed as the end of the day); overnight ranges such as 22:00–02:00 are not supported and are ignored, with a warning in the browser console. Set `"hours": null` to show only the local time.
- `messages`: the quick-topic buttons. `label` is the button text, and `text` is the message that gets pre-filled (the visitor can still edit it). Use `[]` for no buttons.
- `teaser`: the small speech bubble that pops up once per visit after `teaserDelay` seconds. Set `teaserDelay` to `0` or `teaser` to `""` to turn it off.

### Changing the photo

1. Put the image in the project, for example `assets/hosni.jpg`. A square image of at least 400×400 px works best.
2. In `data.js`, set `"photo": "assets/hosni.jpg"`.

With `"photo": null` the site shows your initials (**HB**) instead. If the image fails to load, the initials appear automatically.

### Adding a CV download

1. Put the PDF in the project, for example `assets/Hosni-Ben-Ammar-CV.pdf`.
2. Set `"cvUrl": "assets/Hosni-Ben-Ammar-CV.pdf"`. A full `https://…` link also works.

With `"cvUrl": null` the CV button is hidden.

### Icons

Icons are built-in SVGs. Values you can use for `icon` on skills and projects:

`code`, `database`, `server`, `layers`, `globe`, `shield`, `users`, `cpu`, `plug`, `cart`, `translate`, `camera`, `award`, `graduation`, `briefcase`, `refresh`, `truck`, `chart`, `monitor`, `location`, `link`, `box`

An unknown name falls back to a generic icon, so a typo never breaks the page.

### Security note

Links are only accepted if they start with `https://`, `http://`, `mailto:`, `tel:`, or are relative paths such as `assets/cv.pdf`. Any other link, such as `javascript:`, is ignored.

## Troubleshooting

If the page shows up empty after an edit, `data.js` most likely has a syntax error, usually a missing or extra comma or quote. Open the browser console (F12). It will point to the line, and render.js logs `window.PORTFOLIO_DATA is missing or invalid` when the data could not be loaded.

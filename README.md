# Next Millionaire Co-operative — website

Public website for **Next Millionaire Co-operative** — <https://nextmillionaireqr.com>

It is a plain website: HTML, CSS and a little JavaScript. There is **no build step, no framework and nothing to install** to edit it. Every change is a change to a normal text file.

Available in **English, বাংলা and العربية** (Arabic is right-to-left), with a light and a dark theme.

---

## Contents

1. [What is in the project](#1-what-is-in-the-project)
2. [See your changes on your computer](#2-see-your-changes-on-your-computer)
3. [Everyday edits (no coding)](#3-everyday-edits-no-coding)
4. [Publishing the website](#4-publishing-the-website)
5. [The Member Portal — read this](#5-the-member-portal--read-this)
6. [Rules the project follows](#6-rules-the-project-follows)
7. [Open items for the owner](#7-open-items-for-the-owner)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. What is in the project

```
/
├── index.html  about.html  team.html  fleet.html  contact.html   ← public pages
├── portal.html                          ← Member Portal (password screen + dashboard)
├── privacy.html  terms.html             ← legal pages (draft — see section 7)
├── 404.html                             ← shown for addresses that do not exist
│
├── css/
│   ├── styles.css                       ← all styling, with a table of contents at the top
│   └── portal.css                       ← styling for the Member Portal only
├── js/                                  ← small scripts; each file starts with a comment saying what it does
│   ├── config.js                        ← site-wide settings (driver form link, hero video, data paths)
│   ├── i18n.js                          ← language switcher
│   ├── fleet.js  team.js                ← build the car and member cards from the data files
│   ├── portal.js                        ← portal password (see section 5)
│   └── theme-init.js  theme-toggle.js  nav.js  main.js
├── data/
│   ├── fleet-status.json                ← the cars (edit this when a car is booked or freed)
│   └── team.json                        ← the people on the Team page
├── locales/
│   ├── en.json  bn.json  ar.json        ← every translated sentence
├── images/                              ← logos, icons, member photos, gallery/ and fleet/ photos
├── docs/                                ← PDF files linked from the Member Portal
│
├── _headers                             ← security rules sent with every page (Cloudflare)
├── robots.txt  sitemap.xml  site.webmanifest   ← search engines and "install to phone"
├── wrangler.jsonc  .assetsignore        ← publishing settings (rarely edited)
├── package.json                         ← shortcuts: "npm run dev" and "npm run check"
├── scripts/
│   ├── check-site.mjs                   ← automatic health check (section 2)
│   ├── dev-server.mjs                   ← preview server (section 2)
│   └── generate-pdfs.py                 ← makes SAMPLE portal PDFs (see section 7)
└── CHANGELOG.md                         ← what changed in this version and why
```

Web addresses are "clean": `/about`, `/team`, `/fleet`, `/contact`, `/portal`, `/privacy`, `/terms`. Always link to those, never to `about.html`.

---

## 2. See your changes on your computer

You need [Node.js](https://nodejs.org) (version 18 or newer). Nothing else.

```bash
npm run dev       # preview the site at http://localhost:8080  (Ctrl+C to stop)
npm run check     # health check — run this before every publish
```

(Without npm: `node scripts/dev-server.mjs` and `node scripts/check-site.mjs`.)

Why a preview server? The pages load translations and the car/member lists with JavaScript, and browsers refuse to do that when you simply double-click an `.html` file.

**`npm run check` is your safety net.** In plain English it tells you about: broken links and missing images, pages whose menu/footer/contact details differ from the others, missing or wrong translations, the wrong alphabet inside a translation, mistakes in the car and team files, missing page descriptions, and anything that would break the website's security rules. When it ends with *"✓ All … checks passed"* you are good to publish.

---

## 3. Everyday edits (no coding)

### A car was booked or became available
Open `data/fleet-status.json` and change that car's `"status"` to `"booked"` or `"available"`. Save. That is all: the Fleet page, the 3-car preview on the home page and the "12 cars strong" sentence update themselves.

*Add a car:* copy one line, give it the next `"num"`, and put its photo in `images/fleet/` (e.g. `car-13.jpg`) with `"image": "/images/fleet/car-13.jpg"`. Keep the commas between lines exactly as in the others.

### Add or change a team member
Open `data/team.json` and copy one line:

```json
{ "name": "Jane Doe", "role": "member", "bio": "member", "group": "members", "image": "/images/jane-doe.jpg", "email": "jane@nextmillionaireqr.com" }
```

| field | allowed values |
|---|---|
| `role` | `exec`, `coexec`, `it`, `member` (shown as the label above the bio) |
| `bio` | `leader`, `ops`, `finance`, `it`, `member` (short sentence under the name) |
| `group` | `management` (top section; the first 6 are also on the home page) or `members` |
| `image` | optional. Put the photo in `images/` and write its path. Without it, the person's initials are shown. |
| `email` | optional |

Tip: square photos at least 136 × 136 px look best.

### Change a bio sentence or any other wording
Every sentence on the site lives twice: in the page's HTML (English) and in `locales/en.json` (and its translations in `bn.json` and `ar.json`). Change it **in both the HTML and `en.json`**, then update `bn.json` and `ar.json`. `npm run check` tells you if the two English versions differ or a translation is missing.

Bios are the exception: they are in `locales/*.json` under `"bio.…"` only.

### Add a new sentence that can be translated
1. In the HTML element add `data-i18n="section.key"` and write the English inside it.
2. Add `"section.key": "…"` to the right part of `en.json`, `bn.json` and `ar.json`. Parts: `common` (used on many pages) or the page's own part (`home`, `about`, `team`, `fleet`, `contact`, `portal`, …).
3. Run `npm run check`.

### Change phone numbers, e-mail addresses, address or office hours
Contact details are written in several places (the check script flags any that disagree):

| Where | File |
|---|---|
| Contact cards on the home page | `index.html` (section `#contact`), plus the `"address"` and `"email"` in the `<script type="application/ld+json">` block near the top |
| Contact cards on the Contact page | `contact.html` |
| Footer of **every** page (e-mail + first phone number) | all `.html` files |
| Privacy / Terms e-mail | `privacy.html`, `terms.html` |
| Portal "Feedback" and "My Profile" buttons | `portal.html` |

### Change the menu or the footer
The menu and footer are repeated in every page (this is what keeps the project free of build tools). Make the **same edit in every `.html` file**. `npm run check` verifies they are still identical.

### Change the "Register as a Driver" form
Edit `driverFormUrl` in `js/config.js` **and** the same link in `index.html` and `fleet.html` (the check script confirms they match).

### Change the hero (top) background video
Edit `heroVideoUrl` in `js/config.js`. *Recommended:* download the video, save it as `media/hero.mp4` in the project and set `heroVideoUrl: '/media/hero.mp4'` — then the site no longer depends on an outside server. If you keep an outside address, it must also be allowed in the `media-src` part of `_headers`.

### Replace the Member Portal PDFs
Overwrite the files in `docs/` keeping the same file names (or change the links in `portal.html`).

### Add social-media links
The old icons pointed nowhere, so they were removed. When you have the real profile addresses, add lines like this inside `<div class="footer-contact-list">` in the footer of every page:

```html
<a href="https://www.facebook.com/YOUR-PAGE" target="_blank" rel="noopener">Facebook</a>
```

---

## 4. Publishing the website

The site is hosted on **Cloudflare** (static assets, see `wrangler.jsonc`).

* If the GitHub repository is connected to Cloudflare (Workers & Pages → *nextmillionaireqr* → Settings → Builds), **every change pushed to `main` is published automatically** within a minute or two.
* Otherwise publish by hand from this folder: `npx wrangler deploy` (you will be asked to log in to Cloudflare once).

Before publishing: run `npm run check`.

What gets published: everything except the files listed in `.assetsignore` (README, scripts, settings). The security rules in `_headers` are applied automatically.

**Custom domain:** the domain `nextmillionaireqr.com` is attached in the Cloudflare dashboard (*Workers & Pages → nextmillionaireqr → Settings → Domains & Routes*). Confirm it is attached there. If the domain ever changes, search the project for `nextmillionaireqr.com` and update `js/config.js`, `robots.txt`, `sitemap.xml`, the `<link rel="canonical">` / `og:` tags in every page, `scripts/check-site.mjs` (`SITE_URL`), and the JSON-LD block in `index.html`.

**New outside services** (analytics, maps, chat widgets): the browser will refuse them until their address is added to the `Content-Security-Policy` line in `_headers`.

---

## 5. The Member Portal — read this

`/portal` shows a password screen, then a dashboard of documents. **This is a convenience screen, not real security.**

* The password is stored in `js/portal.js` (`PORTAL_PASSWORD`). Anyone who looks at the page's source code can read it.
* The PDF files in `docs/` can be opened by anyone who knows or guesses their web address.

So: **do not put confidential documents there** unless you add real protection. The page is marked "do not index", so search engines will not list it.

**To change the password:** edit `PORTAL_PASSWORD` in `js/portal.js`, save, publish, and tell the members.

**To make it really private (recommended before real financial files go in):** use **Cloudflare Access** (Zero Trust) — it is free for up to 50 users, needs no code changes and lets members sign in with an e-mail code:
1. Cloudflare dashboard → Zero Trust → Access → Applications → *Add an application* → Self-hosted.
2. Add two paths on `nextmillionaireqr.com`: `/portal` and `/docs/*`.
3. Add a policy that allows the members' e-mail addresses (or a whole domain).
4. Optionally delete the password screen afterwards.

---

## 6. Rules the project follows

Keeping to these is what makes the project easy to maintain. `npm run check` enforces most of them.

* **Names:** CSS classes are `kebab-case`, written `block` or `block-element` (`fleet-card`, `fleet-card-title`); modifiers use `--` (`content-section--brand`); JavaScript-controlled states use `is-` (`is-open`, `is-active`). IDs are `kebab-case`. Scripts find elements through `data-…` attributes, so styling names can be changed freely.
* **Paths:** always start with `/` (`/images/…`, `/about`). Never write `about.html` in a link.
* **No inline code:** no `<script>…</script>`, no `<style>`, no `style="…"` or `onclick="…"` inside HTML. This is what lets the security policy (`_headers`) block injected code. Put CSS in `css/`, JavaScript in `js/`.
* **Images:** always `alt="…"` (empty `alt=""` only for decoration) and `width`/`height`.
* **Headings:** one `<h1>` per page and no skipped levels (h1 → h2 → h3).
* **Translations:** English in the HTML, all three languages in `locales/`; never hard-code a sentence in JavaScript — use `NM.t('key')`.
* **Accessibility built in:** skip-to-content link, keyboard-operable menu (Esc closes it), labelled buttons and form fields, visible focus outlines, `aria-current` on the current page, language and direction set on `<html>`, and animations that stop for people who ask their device for reduced motion.
* **Storage keys** used in the browser (only on the visitor's own device): `nm-theme`, `nmq_lang`, `nmq_portal`.

---

## 7. Open items for the owner

These are decisions or facts only the co-operative can supply. Nothing was invented.

| # | Item | Why it matters |
|---|---|---|
| 1 | **Blue sections have low text contrast.** White text on the brand blue `#54C2FE` scores about 2:1; the accessibility standard (WCAG AA) asks for 4.5:1. It affects the footer, the *Programs & Impact Gallery* and *Driver* sections and the blue buttons. | Hard to read for many people, especially on phones in sunlight. Fix options: dark navy text on the blue, or a deeper blue background. It changes the brand look, so it was left as designed. |
| 2 | **Registration No. CO-4471/2010** (footer) versus **"Est. 2026"** (hero, About page stats). | They contradict each other. Confirm the true registration number and founding year. |
| 3 | **Phone numbers** `+880 1912-142028` and `+880 1812-345678`, and the **Doha address**, with `+880` (Bangladesh) numbers. | The second number looks like a placeholder. Confirm which numbers and which office address are correct. |
| 4 | **Statistics:** *98 % member satisfaction, 50+ members, ৳10M annual turnover, 32 villages.* | Claims on a public site should be true and sourced. Confirm or remove. |
| 5 | **Member Portal documents** in `docs/`: most are **sample files** that `scripts/generate-pdfs.py` can produce; `financial-report-july-2026.pdf` is not made by that script, so check whether it is the real report. `tshirt-sizes.pdf` is not linked anywhere. | Replace with real documents before members rely on the portal. |
| 6 | **Portal announcement** ("general meeting on 15 August 2026") is out of date. | Edit the text in `portal.html` and `locales/*.json` (`portal.announceText`). |
| 7 | **12 members have no photo** (initials are shown): Farzana Akter, Ayesha Rahman, Md. Abu Bakkar, Sumaiya Chowdhury, Fuad Bin Abdul Alim, Hamad Bin Abdul Alim, Tasnim Binte Abdul Alim, Prottasha Parvez, Sadia Afrose, Sahil Hossain Safwan, Ruksana Sultana Any, Mrs. Lovely Islam Ranu. | Add photos (section 3). |
| 8 | **Bios** are generic one-line placeholders by role. | Replace with real bios if wanted (text lives in `locales/*.json` under `bio.*`). |
| 9 | **Hero video and the About-section photo** load from outside servers (CloudFront, Unsplash). | If those servers remove the files, the pictures disappear. Self-host them (section 3). |
| 10 | **Translations were reviewed by AI, not a native speaker.** Several new sentences (404 page, portal buttons, error messages, fleet labels) are AI-drafted in Bengali and Arabic. | Have a native speaker read `locales/bn.json` and `locales/ar.json`. |
| 11 | **Privacy Policy and Terms of Service are plain-language drafts** and exist in English only. | Have them reviewed for the co-operative's legal requirements (Qatar / Bangladesh) before relying on them. |
| 12 | **Social-media icons** were removed (they linked nowhere). | Send the real profile addresses; see section 3. |
| 13 | **Portal password** `nm@2026` is in the source code. | Change it, and see section 5 for real protection. |

---

## 8. Troubleshooting

| Problem | What to do |
|---|---|
| The preview shows a blank page or no cars / members | Use `npm run dev` and open `http://localhost:8080` — do not double-click the file. |
| `npm run check` says a translation is missing | Add the same key to `bn.json` and `ar.json` (it tells you which). |
| `JSON` error in the check | A comma or quote is missing in the data file you edited. Compare with the line above it. |
| Cars or members do not appear after a data edit | The JSON file has a typo. `npm run check` names the file and the problem. |
| A new outside image / video / widget does not show on the live site | Add its address to `_headers` (section 4). |
| A change is not visible after publishing | Hard-refresh the browser (Ctrl+Shift+R). Pages are re-checked on every visit, but your browser may keep an old copy briefly. |
| Visitors cannot unlock the portal | The password is in `js/portal.js`. It is case-sensitive. |

Questions about how a specific file works: every file in `js/` and the top of `css/styles.css` start with a plain-English comment.

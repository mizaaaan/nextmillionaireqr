# Changelog

## 1.0.0 — 10 November 2026 · Production-ready handover

A full clean-up of the site for handover. The design, content and features are the same; the code underneath was reorganised so it is correct, consistent and easy to maintain. Every item below was checked in a real browser (light/dark, desktop/phone, three languages).

### Bugs fixed

**Things visitors could see**
- **Invisible headline text on the About, Team, Fleet and Contact pages.** The sub-heading and buttons in the top banner were stuck at zero opacity. They now show on every page.
- **White-on-white text** (a heading and a button in the Fleet section) and **hard-to-read "Booked" badges** in grey on grey. Fixed in light and dark mode (all small grey labels now meet the 4.5:1 contrast standard).
- **Car count disagreed with itself:** the home page said "10 cars", the Fleet page "12". The number now comes from `data/fleet-status.json`, so every place always agrees (it is also written correctly in Bengali digits).
- **Wrong "Team" heading:** the Team page called every member "Our Management Team". It now has two sections, *Our Management Team* and *Our Members*.
- **12 missing member photos produced broken images** (12 failed requests per visit). The cards now show the person's initials, and a broken photo file falls back to initials automatically.
- **Inconsistent member names and bios** between the home page and the Team page ("Md" / "Md." / "Md. …"; different bios for the same person). One source (`data/team.json`) now feeds both pages, with generic role-based bios (the old home-page bios contained specific claims such as "CPA" and "15 districts" that were not on the Team page).
- **About page said "1 Years of Service".** Now shows *Established 2026*, translated in all languages.
- **The footer copyright year was empty on the home page** (no script filled it in). Now filled in automatically on every page.
- **Malformed photo address** in the home page About section (stray `2150w,` text pasted at the end of the image link). Cleaned up.
- **Dead links:** social-media icons and other links pointing to `#` were removed or given real destinations; footer "Privacy Policy" and "Terms of Service" now lead to real pages (`/privacy`, `/terms`).
- **Member Portal:** every card said just "View". Each card now has its own label (View Reports, View Minutes …); "Edit Profile" (which did nothing) became "Request an Update" (opens an e-mail); mail links no longer open a blank new tab; the password error message now follows the selected language and is announced to screen readers.
- **Bengali and Arabic mistakes:** a Hebrew word inside an Arabic sentence ("עסקי" → "التجاري"); a wrongly spelled verb in the Arabic "Rent a car. Drive your way…" headline (three places); the Bengali fleet note still showed the English words "Apply to Rent" / "Booked"; the Arabic fleet note used a different button wording from the button itself; missing Arabic "Connect" heading; unused, partly wrong "values" translations removed; "company" replaced by "co-operative" in the portal welcome line; the portal announcement's last sentence was missing in Bengali and Arabic.
- **Spelling:** "cooperative" and "co-operative" were mixed; now "co-operative" everywhere.
- **Flash of the wrong language / direction** on Arabic pages and **flash of the wrong theme** on dark mode: the saved choices are now applied before the page first paints.

**Things search engines and sharing saw**
- Canonical addresses, social-share (Open Graph / Twitter) addresses, `robots.txt` and `sitemap.xml` all pointed at `mizaaaan.github.io/...` and `.html` pages. All now use **https://nextmillionaireqr.com** with clean addresses (`/about`, not `/about.html`).
- Added structured data (Organization) on the home page, page-specific titles and descriptions, share-image descriptions, a web app manifest, and a sitemap that lists only public pages.
- The Member Portal is marked "noindex" (page tag **and** `X-Robots-Tag` header, also for `/docs/*`).

**Things that were wrong in the code**
- Navigation, footer and language scripts were copied into every page (7 copies) and six translation dictionaries were embedded in the pages. Replaced by shared files (`js/`, `locales/`) — one fix now fixes every page.
- Page styles were embedded inside each page and relied on fragile `nth-of-type` rules and repeated dark-mode overrides. Replaced by one stylesheet built on "section contexts" (colour variables), plus `css/portal.css` for the portal.
- Font weight Inter 700 was used but never loaded (browser faked bold). Loaded now.
- Images had no size information, so the page jumped while loading. All images now have `width`/`height`, and the car and team lists reserve space while loading.
- `wrangler.jsonc` had an unneeded Node compatibility flag and no 404 handling; now serves `404.html` with a true 404 status.
- `scripts/generate-pdfs.py` documentation listed the wrong file names.
- The README was a two-line stub.

### Added
- **404 page**, **Privacy Policy** and **Terms of Service** pages (plain-language drafts; need legal review).
- **`data/team.json`** — the whole team in one editable file (44 people).
- **`locales/en.json`, `bn.json`, `ar.json`** — all translations in three files, with a *common* part and one part per page; only the chosen language is downloaded.
- **`scripts/check-site.mjs`** — automatic health check (≈4,800 checks): links and files, anchors, identical menu/footer/contact details, translation completeness and quality, fleet/team data, SEO basics, accessibility basics, security-policy rules.
- **`scripts/dev-server.mjs`** — zero-install preview server that behaves like the real site.
- **`_headers`** — security headers (Content-Security-Policy, clickjacking and MIME protection, HSTS, referrer and permissions policies), noindex for the portal, one-day cache for images.
- **`.assetsignore`** — keeps README, scripts and settings files off the public website.
- **`package.json`** — `npm run dev`, `npm run check`, `npm run deploy` (no dependencies).
- Footer: tap-to-call phone number and tap-to-write e-mail address.
- Full **README** and this changelog.

### Accessibility
- Skip-to-content link; one `<h1>` per page and a proper heading order; labelled language, theme and menu buttons with `aria-pressed` / `aria-expanded`; `aria-current` on the current page; labelled password field and an announced error message; keyboard support (Esc closes the menu; focus moves to the portal heading after unlocking); visible focus outlines; `lang`/`dir` kept correct for English, Bengali and right-to-left Arabic; animations switch off for visitors who ask for reduced motion; the hero video is skipped for reduced motion and data-saver mode.
- Automated scan (axe-core) on every page in light, dark and all three languages: the only remaining finding is the brand-blue contrast item in README section 7.

### Security
- No inline scripts or styles anywhere, so a strict Content-Security-Policy can be (and is) enforced with no violations. Dynamic content is built with safe DOM calls, never by pasting data into HTML.
- External links opened in a new tab carry `rel="noopener"`.
- The Member Portal password is a convenience gate only. It is now isolated in one clearly marked constant, and the limits plus the upgrade path (Cloudflare Access) are documented in the README. **Unchanged by design:** the password is still readable in the page source.

### Changed
- Clean web addresses and root-relative file paths throughout.
- Naming made consistent: kebab-case classes and IDs (`block-element`, `--modifier`, `is-state`), `data-*` attributes for JavaScript hooks, readable file names.
- Contact cards show all four items (address, phone, e-mail, office hours) in one row on desktop.

### Removed
- Unused social-media icons (dead links), unused translations and unused CSS.

### Not changed (needs the owner's decision — see README section 7)
Brand-blue text contrast, registration number versus "Est. 2026", placeholder-looking phone number, statistics, sample PDFs, out-of-date portal announcement, missing member photos, generic bios, outside-hosted hero video and photo, native-speaker review of translations, legal review of the new legal pages, social-media links.

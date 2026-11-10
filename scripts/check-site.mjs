#!/usr/bin/env node
/*
 * check-site.mjs — automatic health check for the website.
 *
 *   node scripts/check-site.mjs        (or: npm run check)
 *
 * Run it after every edit, before you publish. It needs only Node.js and
 * changes nothing. It prints a plain-English list of anything that is wrong:
 *
 *   - broken links, missing images / files, links that point to a missing section
 *   - pages whose menu, footer or contact details differ from the other pages
 *   - missing or mismatched translations (English / বাংলা / العربية)
 *   - wrong-language characters inside a translation
 *   - fleet / team data mistakes (bad status, missing photo file, wrong car count)
 *   - accessibility basics (image descriptions, one main heading per page, heading order)
 *   - search-engine basics (page title, description, canonical address, sitemap)
 *   - rules our security policy depends on (no inline scripts or styles)
 *
 * Exit code: 0 = all good, 1 = something to fix (so it can also run in automation).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

/* ---------- settings (edit here if the project rules change) ---------- */
const SITE_URL = 'https://nextmillionaireqr.com';
const ROLES = ['exec', 'coexec', 'it', 'member'];
const GROUPS = ['management', 'members'];
const FLEET_STATUS = ['booked', 'available'];
const MEMBER_ONLY_EMAILS = ['feedback@nextmillionaireqr.com'];   // used on the portal, not listed on the contact page
const ALLOWED_LATIN_IN_TRANSLATIONS = ['ICA'];       // words that may stay in English inside bn/ar
const LANGS = ['en', 'bn', 'ar'];

/* ---------- tiny reporting helpers ---------- */
const problems = [];
const notes = [];
let checks = 0;
const fail = (where, msg) => problems.push({ where, msg });
const note = (where, msg) => notes.push({ where, msg });
const check = (cond, where, msg) => { checks++; if (!cond) fail(where, msg); return cond; };

/* ---------- reading the project ---------- */
const pageFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();
const pages = {};   // file -> html
for (const f of pageFiles) pages[f] = read(f);
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attr = (tag, name) => { const m = tag.match(new RegExp('(?:^|\\s)' + name + '="([^"]*)"')); return m ? decode(m[1]) : null; };
const urlOf = (file) => (file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, ''));
const fileOfUrl = (u) => (u === '/' ? 'index.html' : u.replace(/^\//, '') + '.html');

// Collect every opening tag of a given name: returns array of tag strings.
const tagsOf = (html, name) => html.match(new RegExp('<' + name + '(?=[\\s>/])[^>]*>', 'gi')) || [];
const idsOf = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

/* data-i18n extraction (text + attribute keys), same rules as js/i18n.js */
function extractI18n(html) {
  const text = [], attrs = [];
  const openRe = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)>/g;
  let m;
  while ((m = openRe.exec(html))) {
    const [, tag, attrStr] = m;
    for (const a of attrStr.matchAll(/data-i18n-(aria-label|placeholder|title)="([^"]*)"/g)) {
      attrs.push({ key: a[2], value: attr(attrStr, a[1]) ?? '', attr: a[1] });
    }
    const km = attrStr.match(/(?:^|\s)data-i18n="([^"]+)"/);
    if (!km) continue;
    const re = new RegExp('<(/?)' + tag + '(?=[\\s>/])[^>]*>', 'g');
    re.lastIndex = openRe.lastIndex;
    let depth = 1, n;
    while ((n = re.exec(html))) {
      if (n[1]) depth--; else if (!/\/>$/.test(n[0])) depth++;
      if (depth === 0) break;
    }
    if (!n) { text.push({ key: km[1], html: null, tag }); continue; }
    text.push({ key: km[1], html: html.slice(openRe.lastIndex, n.index), tag });
  }
  return { text, attrs };
}

/* =====================================================================
 * 1. EVERY PAGE: structure, SEO, accessibility, security rules, links
 * ===================================================================== */
const idCache = {};
for (const f of pageFiles) idCache[f] = new Set(idsOf(pages[f]));

for (const f of pageFiles) {
  const html = pages[f];
  const here = f;

  check(/^<!DOCTYPE html>/i.test(html), here, 'Missing <!DOCTYPE html> on the first line.');
  check(/<html lang="en" dir="ltr">/.test(html), here, '<html> must be written exactly as <html lang="en" dir="ltr"> (the language switcher changes it).');
  const charsetAt = html.indexOf('<meta charset="utf-8">'), titleAt = html.indexOf('<title>');
  check(charsetAt > -1 && charsetAt < titleAt, here, 'The <meta charset="utf-8"> line must come before <title>.');
  check(/<meta name="viewport" content="width=device-width, initial-scale=1">/.test(html), here, 'Missing the viewport meta tag (needed for phones).');

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  check(title && title.length >= 10 && title.length <= 70, here, `Page title should be 10–70 characters (now: "${title || ''}").`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  check(desc && desc.length >= 50 && desc.length <= 200, here, `Meta description should be 50–200 characters (now ${desc ? desc.length : 0}).`);

  const noindex = /<meta name="robots" content="noindex/.test(html);
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const expected = SITE_URL + (f === '404.html' ? '/404' : urlOf(f));
  check(canonical === expected, here, `Canonical address should be ${expected} (now: ${canonical}).`);
  if (!noindex) {
    for (const p of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
      check(new RegExp(`<meta property="${p}" content="[^"]+"`).test(html), here, `Missing <meta property="${p}">.`);
    }
    check((html.match(/<meta property="og:url" content="([^"]*)"/) || [])[1] === expected, here, `og:url should be ${expected}.`);
  }

  // body + page name for translations
  const body = (html.match(/<body[^>]*>/) || [''])[0];
  check(/data-page="[a-z]+"/.test(body), here, '<body> needs data-page="…" (it selects the translation section).');

  // headings
  const headings = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  check(headings.filter((h) => h === 1).length === 1, here, `Each page needs exactly one <h1> (found ${headings.filter((h) => h === 1).length}).`);
  let prev = 0, ok = true;
  for (const h of headings) { if (prev && h > prev + 1) ok = false; prev = h; }
  check(ok, here, `Headings skip a level (order found: h${headings.join(' h')}). Go h1 → h2 → h3 without gaps.`);

  // security-policy rules
  const inlineScripts = (html.match(/<script(?![^>]*\ssrc=)(?![^>]*type="application\/ld\+json")[^>]*>/g) || []);
  check(inlineScripts.length === 0, here, 'Inline <script> found. Put the code in a file under js/ (the security policy blocks inline scripts).');
  check(!/<style[\s>]/.test(html), here, 'A <style> block was found. Put the CSS in css/styles.css (the security policy blocks inline styles).');
  check(!/\sstyle="/.test(html), here, 'A style="…" attribute was found. Use a CSS class instead.');
  check(!/\son[a-z]+="/.test(html), here, 'An onclick/onload-style attribute was found. Use a file under js/ instead.');

  // images
  for (const img of tagsOf(html, 'img')) {
    const src = attr(img, 'src') || '';
    check(attr(img, 'alt') !== null, here, `Image without an alt="" description: ${src}`);
    check(attr(img, 'width') && attr(img, 'height'), here, `Image without width/height (causes the page to jump while loading): ${src}`);
  }

  // duplicate ids
  const ids = idsOf(html);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  check(dup.length === 0, here, `Duplicate id: ${[...new Set(dup)].join(', ')}`);

  // label/for + aria-controls targets
  for (const m of html.matchAll(/\s(?:for|aria-controls)="([^"]+)"/g)) {
    check(idCache[f].has(m[1]), here, `References id "${m[1]}" but nothing on the page has that id.`);
  }

  // links and files
  const refs = [];
  for (const t of tagsOf(html, 'a')) refs.push(['link', attr(t, 'href'), t]);
  for (const t of tagsOf(html, 'img')) refs.push(['file', attr(t, 'src'), t]);
  for (const t of tagsOf(html, 'script')) if (attr(t, 'src')) refs.push(['file', attr(t, 'src'), t]);
  for (const t of tagsOf(html, 'link')) if (attr(t, 'href')) refs.push(['file', attr(t, 'href'), t]);
  for (const t of tagsOf(html, 'a')) {
    if (attr(t, 'target') === '_blank') check(/rel="[^"]*noopener/.test(t), here, `External link without rel="noopener": ${attr(t, 'href')}`);
  }
  for (const [kind, href, tag] of refs) {
    if (href === null || href === '') { fail(here, `Empty ${kind}: ${tag.slice(0, 80)}`); continue; }
    if (href === '#') { fail(here, 'A link goes to "#" (nowhere). Give it a real address or remove it.'); continue; }
    if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;
    if (!/^[/#]/.test(href)) { fail(here, `Use a root address starting with "/" instead of "${href}".`); continue; }
    const [pathPart, hash] = href.split('#');
    const clean = pathPart.split('?')[0];
    checks++;
    if (clean === '') {
      if (hash && !idCache[f].has(hash)) fail(here, `Link "${href}" points to a section that does not exist on this page.`);
      continue;
    }
    if (/\.html$/.test(clean)) { fail(here, `Link "${href}" should use the clean address without .html.`); continue; }
    if (/\.[a-z0-9]+$/i.test(clean)) {
      if (!exists(clean.slice(1))) fail(here, `File not found: ${clean}`);
      continue;
    }
    const target = fileOfUrl(clean);
    if (!pageFiles.includes(target)) { fail(here, `Link "${href}" points to a page that does not exist.`); continue; }
    if (hash && !idCache[target].has(hash)) fail(here, `Link "${href}": the page has no section with id "${hash}".`);
  }
}

/* =====================================================================
 * 2. SAME MENU / FOOTER / CONTACT DETAILS EVERYWHERE
 * ===================================================================== */
{
  const blockOf = (html, open, close) => { const a = html.indexOf(open); if (a < 0) return null; const b = html.indexOf(close, a); return html.slice(a, b + close.length); };
  const norm = (s) => s && s.replace(/\saria-current="page"/g, '').replace(/<span data-year>[^<]*<\/span>/g, '<span data-year></span>');
  for (const [label, open, close] of [
    ['top menu', '<nav class="navbar', '</nav>'],
    ['phone menu', '<nav class="mobile-menu"', '</nav>'],
    ['footer', '<footer', '</footer>'],
  ]) {
    const blocks = pageFiles.map((f) => [f, norm(blockOf(pages[f], open, close))]);
    const first = blocks[0];
    for (const [f, b] of blocks) check(b !== null && b === first[1], f, `The ${label} differs from ${first[0]}. It must be identical on every page.`);
  }

  const grid = (f) => { const b = blockOf(pages[f], '<div class="contact-grid">', '<a '); return b && b.replace(/\s+/g, ' '); };
  if (pages['index.html'] && pages['contact.html']) {
    check(grid('index.html') === grid('contact.html'), 'index.html / contact.html', 'The contact details (address, phones, emails, hours) differ between the home page and the contact page.');
  }
  // footer contact must use one of the phones/emails listed on the contact page
  const contactTels = new Set((pages['contact.html'] || '').match(/tel:[+\d]+/g) || []);
  const contactMails = new Set((pages['contact.html'] || '').match(/mailto:[^"?]+/g) || []);
  for (const f of pageFiles) {
    for (const t of pages[f].match(/tel:[+\d]+/g) || []) check(contactTels.has(t), f, `Phone ${t} is not listed on the contact page.`);
    for (const t of pages[f].match(/mailto:[^"?]+/g) || []) check(contactMails.has(t) || MEMBER_ONLY_EMAILS.includes(t.slice(7)), f, `Email ${t.slice(7)} is not listed on the contact page.`);
  }
}

/* =====================================================================
 * 3. TRANSLATIONS
 * ===================================================================== */
const locales = {};
for (const l of LANGS) {
  try { locales[l] = JSON.parse(read(`locales/${l}.json`)); }
  catch (e) { fail(`locales/${l}.json`, 'Cannot be read as valid JSON: ' + e.message); }
}
if (LANGS.every((l) => locales[l])) {
  const flat = (obj) => { const o = {}; for (const s of Object.keys(obj)) for (const k of Object.keys(obj[s])) o[s + '|' + k] = obj[s][k]; return o; };
  const F = Object.fromEntries(LANGS.map((l) => [l, flat(locales[l])]));

  // same sections and keys in all three files
  for (const l of ['bn', 'ar']) {
    for (const k of Object.keys(F.en)) check(k in F[l], `locales/${l}.json`, `Missing translation: ${k.replace('|', ' › ')}`);
    for (const k of Object.keys(F[l])) check(k in F.en, `locales/${l}.json`, `Extra key not in en.json: ${k.replace('|', ' › ')}`);
  }

  // what the HTML and JavaScript use
  const used = new Set();         // "section|key" (resolved)
  const jsKeys = new Set(), jsPrefixes = [];
  for (const f of fs.readdirSync(path.join(ROOT, 'js'))) {
    const code = read('js/' + f);
    for (const m of code.matchAll(/NM\.t\(\s*'([^']+)'\s*(\+)?/g)) {
      if (m[2]) jsPrefixes.push(m[1]);       // NM.t('role.' + member.role)  -> every role.* key is in use
      else jsKeys.add(m[1]);
    }
    // keys chosen with a condition: NM.t(booked ? 'fleetcard.booked' : 'fleetcard.available')
    for (const m of code.matchAll(/\?\s*'((?:[a-z]+\.)[A-Za-z]+)'\s*:\s*'((?:[a-z]+\.)[A-Za-z]+)'/g)) { jsKeys.add(m[1]); jsKeys.add(m[2]); }
  }

  for (const f of pageFiles) {
    const page = (pages[f].match(/<body[^>]*data-page="([a-z]+)"/) || [])[1];
    if (!page) continue;
    check(!!locales.en[page], f, `en.json has no "${page}" section.`);
    const { text, attrs } = extractI18n(pages[f]);
    const lookup = (l, key) => (locales[l][page] && locales[l][page][key] != null ? ['page', locales[l][page][key]] : locales[l].common && locales[l].common[key] != null ? ['common', locales[l].common[key]] : null);

    for (const { key, html, tag } of text) {
      if (html === null) { fail(f, `Could not find the closing </${tag}> for data-i18n="${key}".`); continue; }
      const r = lookup('en', key);
      if (!check(!!r, f, `Translation key "${key}" is missing from en.json.`)) continue;
      used.add((r[0] === 'page' ? page : 'common') + '|' + key);
      check(r[1] === html, f, `The English text for "${key}" in the page differs from en.json.\n      page : ${html.slice(0, 90)}\n      json : ${r[1].slice(0, 90)}`);
      for (const l of ['bn', 'ar']) check(!!lookup(l, key), f, `"${key}" has no ${l} translation.`);
    }
    for (const { key, value } of attrs) {
      const r = lookup('en', key);
      if (!check(!!r, f, `Translation key "${key}" is missing from en.json.`)) continue;
      used.add((r[0] === 'page' ? page : 'common') + '|' + key);
      check(r[1] === value, f, `The English attribute text for "${key}" differs from en.json ("${value}" vs "${r[1]}").`);
    }
  }
  for (const k of Object.keys(F.en)) {
    const key = k.split('|')[1];
    if (used.has(k) || jsKeys.has(key) || jsPrefixes.some((p) => key.startsWith(p))) continue;
    check(false, 'locales/en.json', `Unused translation (nothing on any page or script uses it): ${k.replace('|', ' › ')}`);
  }

  // quality of bn / ar strings
  const tagSeq = (s) => (s.match(/<\/?[a-z][^>]*>/gi) || []).join('');
  for (const l of ['bn', 'ar']) {
    for (const [k, v] of Object.entries(F[l])) {
      const text = v.replace(/<[^>]*>/g, '');
      const where = `locales/${l}.json`;
      const label = k.replace('|', ' › ');
      check(!/[֐-׿Ѐ-ӿ぀-ヿ一-鿿]/.test(text), where, `${label}: contains characters from a different writing system (Hebrew/Cyrillic/CJK): ${text.slice(0, 60)}`);
      if (l === 'bn') check(!/[؀-ۿ]/.test(text), where, `${label}: contains Arabic letters inside Bengali text.`);
      if (l === 'ar') check(!/[ঀ-৿]/.test(text), where, `${label}: contains Bengali letters inside Arabic text.`);
      const latin = (text.match(/[A-Za-z]{3,}/g) || []).filter((w) => !ALLOWED_LATIN_IN_TRANSLATIONS.includes(w));
      check(latin.length === 0, where, `${label}: left an English word in the translation: ${latin.join(', ')}`);
      check(tagSeq(v) === tagSeq(F.en[k] || ''), where, `${label}: HTML tags differ from the English version (keep <span>/<br> exactly as in en.json).`);
      check(v !== F.en[k] || !/[A-Za-z]/.test(F.en[k]), where, `${label}: identical to English (not translated).`);
    }
  }
}

/* =====================================================================
 * 4. DATA FILES (fleet + team)
 * ===================================================================== */
let fleetCount = null;
try {
  const fleet = JSON.parse(read('data/fleet-status.json'));
  check(Array.isArray(fleet.cars) && fleet.cars.length > 0, 'data/fleet-status.json', 'Needs a non-empty "cars" list.');
  fleetCount = (fleet.cars || []).length;
  const nums = new Set();
  for (const c of fleet.cars || []) {
    check(Number.isInteger(c.num) && c.num > 0, 'data/fleet-status.json', `Car number must be a positive whole number (got ${JSON.stringify(c.num)}).`);
    check(!nums.has(c.num), 'data/fleet-status.json', `Car number ${c.num} is used twice.`); nums.add(c.num);
    check(FLEET_STATUS.includes(c.status), 'data/fleet-status.json', `Car ${c.num}: status must be "booked" or "available" (got ${JSON.stringify(c.status)}).`);
    check(typeof c.image === 'string' && c.image.startsWith('/') && exists(c.image.slice(1)), 'data/fleet-status.json', `Car ${c.num}: photo file not found (${c.image}). Paths start with "/images/…".`);
  }
} catch (e) { fail('data/fleet-status.json', 'Cannot be read as valid JSON: ' + e.message); }

if (fleetCount !== null) {
  for (const f of pageFiles) {
    for (const m of pages[f].matchAll(/<span data-fleet-count>([^<]*)<\/span>/g)) {
      check(Number(m[1]) === fleetCount, f, `The car count written in the page text (${m[1]}) should match the number of cars in data/fleet-status.json (${fleetCount}). It is replaced automatically in the browser, but search engines and visitors without JavaScript see this number.`);
    }
  }
  for (const l of LANGS) {
    for (const [s, obj] of Object.entries(locales[l] || {})) for (const [k, v] of Object.entries(obj)) {
      const m = v.match(/<span data-fleet-count>([^<]*)<\/span>/);
      if (m && l === 'en') check(Number(m[1]) === fleetCount, `locales/en.json`, `${s} › ${k}: car count ${m[1]} should be ${fleetCount}.`);
    }
  }
}

try {
  const team = JSON.parse(read('data/team.json'));
  const bios = Object.keys(locales.en?.common || {}).filter((k) => k.startsWith('bio.')).map((k) => k.slice(4));
  check(Array.isArray(team.members) && team.members.length > 0, 'data/team.json', 'Needs a non-empty "members" list.');
  let noPhoto = [];
  for (const m of team.members || []) {
    const who = m.name || '(no name)';
    check(typeof m.name === 'string' && m.name.trim() !== '', 'data/team.json', 'A member has no name.');
    check(ROLES.includes(m.role), 'data/team.json', `${who}: role must be one of ${ROLES.join(', ')} (got ${JSON.stringify(m.role)}).`);
    check(bios.includes(m.bio), 'data/team.json', `${who}: bio "${m.bio}" is not a bio.* key in locales (available: ${bios.join(', ')}).`);
    check(GROUPS.includes(m.group), 'data/team.json', `${who}: group must be one of ${GROUPS.join(', ')}.`);
    check(!m.email || /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(m.email), 'data/team.json', `${who}: email looks invalid (${m.email}).`);
    if (m.image) check(m.image.startsWith('/') && exists(m.image.slice(1)), 'data/team.json', `${who}: photo file not found (${m.image}).`);
    else noPhoto.push(who);
  }
  if (noPhoto.length) note('data/team.json', `${noPhoto.length} member(s) have no photo and show initials instead: ${noPhoto.join(', ')}`);
  const mgmt = (team.members || []).filter((m) => m.group === 'management').length;
  const homeLimit = Number((pages['index.html'].match(/data-group="management" data-limit="(\d+)"/) || [])[1]);
  if (homeLimit && mgmt < homeLimit) note('data/team.json', `Home page shows ${homeLimit} management members but only ${mgmt} exist.`);
} catch (e) { fail('data/team.json', 'Cannot be read as valid JSON: ' + e.message); }

/* =====================================================================
 * 5. SETTINGS FILES: config.js, robots, sitemap, manifest, headers
 * ===================================================================== */
{
  const cfg = read('js/config.js');
  const formUrl = (cfg.match(/driverFormUrl:\s*'([^']+)'/) || [])[1];
  const siteUrl = (cfg.match(/siteUrl:\s*'([^']+)'/) || [])[1];
  const heroVideo = (cfg.match(/heroVideoUrl:\s*'([^']*)'/) || [])[1];
  check(siteUrl === SITE_URL, 'js/config.js', `siteUrl should be ${SITE_URL} (now ${siteUrl}).`);
  for (const f of pageFiles) {
    for (const m of pages[f].matchAll(/href="(https:\/\/(?:forms\.gle|docs\.google\.com\/forms)[^"]*)"/g)) {
      check(m[1] === formUrl, f, `Driver form link (${m[1]}) differs from js/config.js (${formUrl}).`);
    }
  }
  const robots = read('robots.txt');
  check(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), 'robots.txt', `Should contain "Sitemap: ${SITE_URL}/sitemap.xml".`);
  check(!/^\s*Disallow:\s*\/\S/m.test(robots), 'robots.txt', 'Do not block pages here: search engines must be able to read the "noindex" tag on the portal page.');

  const sitemap = read('sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const f of pageFiles) {
    if (f === '404.html') continue;
    const noindex = /<meta name="robots" content="noindex/.test(pages[f]);
    const u = SITE_URL + urlOf(f);
    if (noindex) check(!locs.includes(u), 'sitemap.xml', `${u} is "noindex" and should not be listed.`);
    else check(locs.includes(u), 'sitemap.xml', `${u} is missing from the sitemap.`);
  }
  for (const u of locs) check(u.startsWith(SITE_URL) && (u === SITE_URL + '/' || pageFiles.includes(fileOfUrl(u.slice(SITE_URL.length)))), 'sitemap.xml', `${u} does not match a page.`);

  try {
    const man = JSON.parse(read('site.webmanifest'));
    for (const i of man.icons || []) check(exists(i.src.replace(/^\//, '')), 'site.webmanifest', `Icon file not found: ${i.src}`);
  } catch (e) { fail('site.webmanifest', 'Invalid JSON: ' + e.message); }

  // every outside host the site uses must be allowed by the security policy
  const headers = read('_headers');
  const csp = (headers.match(/^\s+Content-Security-Policy:\s*(.+)$/m) || [])[1] || '';
  const directive = (name) => (csp.match(new RegExp(name + '\\s+([^;]+)')) || [])[1] || '';
  const hostOf = (u) => { try { return new URL(u).origin; } catch (e) { return null; } };
  const allowedIn = (name, origin) => directive(name).split(/\s+/).includes(origin);
  check(!!csp, '_headers', 'No Content-Security-Policy line found.');
  const needs = [];
  for (const f of pageFiles) {
    for (const t of tagsOf(pages[f], 'img')) { const o = hostOf(attr(t, 'src') || ''); if (o) needs.push([f, 'img-src', o]); }
    for (const t of tagsOf(pages[f], 'link')) if (attr(t, 'rel') === 'stylesheet') { const o = hostOf(attr(t, 'href') || ''); if (o) needs.push([f, 'style-src', o]); }
    for (const t of tagsOf(pages[f], 'script')) { const o = hostOf(attr(t, 'src') || ''); if (o) needs.push([f, 'script-src', o]); }
  }
  if (heroVideo) needs.push(['js/config.js', 'media-src', hostOf(heroVideo)]);
  for (const [where, dir, origin] of needs) check(allowedIn(dir, origin), where, `${origin} is used here but is not allowed in the ${dir} part of _headers.`);
  check(allowedIn('font-src', 'https://fonts.gstatic.com'), '_headers', 'font-src must allow https://fonts.gstatic.com (Google Fonts).');
  check(!/'unsafe-inline'|'unsafe-eval'/.test(csp), '_headers', "The security policy must not use 'unsafe-inline' or 'unsafe-eval'.");
}

/* =====================================================================
 * 6. MEMBER PORTAL
 * ===================================================================== */
{
  const js = read('js/portal.js');
  check(/var PORTAL_PASSWORD = '[^']+';/.test(js), 'js/portal.js', 'PORTAL_PASSWORD line not found (README explains how to change it).');
  check(/<meta name="robots" content="noindex, nofollow">/.test(pages['portal.html'] || ''), 'portal.html', 'The portal page must stay marked noindex.');
  check(/\/portal\s*\n\s*X-Robots-Tag: noindex/.test(read('_headers')), '_headers', 'The /portal rule with X-Robots-Tag is missing.');
  for (const m of (pages['portal.html'] || '').matchAll(/href="(\/docs\/[^"]+)"/g)) check(exists(m[1].slice(1)), 'portal.html', `Document not found: ${m[1]}`);
  const unlinked = fs.readdirSync(path.join(ROOT, 'docs')).filter((d) => d.endsWith('.pdf') && !(pages['portal.html'] || '').includes('/docs/' + d));
  if (unlinked.length) note('docs/', `Not linked from the portal: ${unlinked.join(', ')}`);
}

/* =====================================================================
 * REPORT
 * ===================================================================== */
const line = '─'.repeat(64);
console.log(`\nNext Millionaire — site check\n${line}`);
if (notes.length) {
  console.log('\nFor your information (not errors):');
  for (const n of notes) console.log(`  • ${n.where}: ${n.msg}`);
}
if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s) to fix:\n`);
  const grouped = {};
  for (const p of problems) (grouped[p.where] = grouped[p.where] || []).push(p.msg);
  for (const [where, msgs] of Object.entries(grouped)) {
    console.log(`  ${where}`);
    for (const m of [...new Set(msgs)]) console.log(`    - ${m}`);
  }
  console.log(`\n${checks} checks run.\n`);
  process.exit(1);
}
console.log(`\n✓ All ${checks} checks passed. The site is ready to publish.\n`);

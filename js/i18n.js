/*
 * i18n.js — language switcher (English / বাংলা / العربية), shared by every page.
 *
 * HOW IT WORKS
 *   - English is written directly in each page's HTML (good for SEO and for
 *     visitors without JavaScript).
 *   - Every translatable element carries data-i18n="some.key".
 *   - Translations live in /locales/en.json, bn.json and ar.json. Each file has
 *     a "common" section (navigation, footer, shared cards) and one section per
 *     page ("home", "about", "team", "fleet", "contact", "portal", ...). A page
 *     declares its section with <body data-page="home">.
 *   - Only the selected language file is downloaded (plus en.json as fallback).
 *
 * HOW TO ADD A TRANSLATABLE STRING
 *   1. Add data-i18n="section.key" to the HTML element and write the English text inside it.
 *   2. Add the same key to the right section of en.json, bn.json and ar.json.
 *   3. Run `node scripts/check-site.mjs` — it verifies all three files match the HTML.
 *
 * ATTRIBUTES: use data-i18n-aria-label / data-i18n-placeholder / data-i18n-title
 * to translate those attributes instead of the element text.
 *
 * FOR OTHER SCRIPTS (window.NM)
 *   NM.t(key)            -> translated string for the current language
 *   NM.lang              -> current language code
 *   NM.onLanguage(fn)    -> fn(lang) runs now (if ready) and after every language change
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'nmq_lang';
  var DIRECTIONS = { en: 'ltr', bn: 'ltr', ar: 'rtl' };
  var ATTRS = ['aria-label', 'placeholder', 'title'];

  var NM = (window.NM = window.NM || {});
  var cfg = window.NM_CONFIG || {};
  var base = cfg.localesPath || '/locales/';

  var dictionaries = {};   // lang -> parsed JSON
  var hooks = [];
  var current = 'en';
  var ready = false;
  var requestId = 0;
  var firstApply = true;

  /* ---------- storage ---------- */
  function savedLanguage() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return DIRECTIONS[v] ? v : 'en';
    } catch (e) { return 'en'; }
  }
  function saveLanguage(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  /* ---------- lookup ---------- */
  function pageName() {
    return (document.body && document.body.getAttribute('data-page')) || '';
  }
  function lookup(lang, key) {
    var d = dictionaries[lang];
    if (!d) return null;
    var page = d[pageName()];
    if (page && page[key] != null) return page[key];
    if (d.common && d.common[key] != null) return d.common[key];
    return null;
  }
  function translate(lang, key) {
    var v = lookup(lang, key);
    if (v == null) v = lookup('en', key);   // fall back to English
    return v;
  }

  NM.t = function (key) {
    var v = translate(current, key);
    return v == null ? key : v;
  };
  NM.onLanguage = function (fn) {
    hooks.push(fn);
    if (ready) fn(current);
  };

  /* ---------- loading ---------- */
  function load(lang) {
    if (dictionaries[lang]) return Promise.resolve(dictionaries[lang]);
    return fetch(base + lang + '.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) { dictionaries[lang] = json; return json; });
  }

  /* ---------- applying ---------- */
  function applyToDom(lang) {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var v = translate(lang, nodes[i].getAttribute('data-i18n'));
      if (v != null) nodes[i].innerHTML = v;   // strings come from our own JSON files
    }
    ATTRS.forEach(function (attr) {
      var els = document.querySelectorAll('[data-i18n-' + attr + ']');
      for (var j = 0; j < els.length; j++) {
        var val = translate(lang, els[j].getAttribute('data-i18n-' + attr));
        if (val != null) els[j].setAttribute(attr, val);
      }
    });
  }

  function apply(lang) {
    var root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', DIRECTIONS[lang]);
    document.body.classList.remove('lang-en', 'lang-bn', 'lang-ar');
    document.body.classList.add('lang-' + lang);

    // The HTML is already English, so the very first English render can skip the rewrite.
    if (!(firstApply && lang === 'en')) applyToDom(lang);
    firstApply = false;

    var buttons = document.querySelectorAll('[data-lang-btn]');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-lang-btn') === lang;
      buttons[i].classList.toggle('is-active', on);
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    current = lang;
    NM.lang = lang;
    ready = true;
    hooks.forEach(function (fn) { fn(lang); });
  }

  function setLanguage(lang, persist) {
    if (!DIRECTIONS[lang]) lang = 'en';
    var id = ++requestId;
    var wanted = lang === 'en' ? [load('en')] : [load('en'), load(lang)];

    return Promise.all(wanted)
      .then(function () {
        if (id !== requestId) return;          // a newer click superseded this one
        if (persist) saveLanguage(lang);
        apply(lang);
      })
      .catch(function () {
        if (id !== requestId) return;
        apply('en');                            // translation file unavailable: stay in English
      })
      .then(function () {
        document.documentElement.classList.remove('i18n-pending');
      });
  }
  NM.setLanguage = function (lang) { return setLanguage(lang, true); };

  function init() {
    var buttons = document.querySelectorAll('[data-lang-btn]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        NM.setLanguage(e.currentTarget.getAttribute('data-lang-btn'));
      });
    }
    setLanguage(savedLanguage(), false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

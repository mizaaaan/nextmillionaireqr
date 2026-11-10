/*
 * theme-init.js — runs synchronously in <head>, before the page paints.
 *
 * 1. Marks the page as JS-enabled (class "js") so CSS can safely hide content
 *    that JS will animate in.
 * 2. Applies the saved colour theme (or the visitor's OS preference) so the
 *    page never flashes the wrong theme.
 * 3. Applies the saved language's <html lang/dir> immediately so Arabic pages
 *    do not flash left-to-right, and holds first paint until the translation
 *    file arrives (js/i18n.js removes the "i18n-pending" class).
 *
 * Storage keys (shared with theme-toggle.js and i18n.js):
 *   nm-theme  -> "light" | "dark"
 *   nmq_lang  -> "en" | "bn" | "ar"
 */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var theme = 'light';
  try {
    var saved = localStorage.getItem('nm-theme');
    if (saved === 'dark' || saved === 'light') {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch (e) { /* storage blocked: fall back to light */ }
  root.setAttribute('data-theme', theme);

  try {
    var lang = localStorage.getItem('nmq_lang');
    if (lang === 'bn' || lang === 'ar') {
      root.setAttribute('lang', lang);
      root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      root.classList.add('i18n-pending');
      // Safety net: never keep the page hidden for more than 2 seconds.
      setTimeout(function () { root.classList.remove('i18n-pending'); }, 2000);
    }
  } catch (e) { /* ignore */ }
})();

// ============================================================================
// Next Millionaire — language switcher engine (shared by every page)
//
// Each page defines its own `const translations = { en: {...}, bn: {...}, ar: {...} }`
// object (in an inline <script> before this file loads) mapping data-i18n keys
// to text for each language. This file just applies whichever language is
// selected/saved.
//
// HOW TO ADD A NEW TRANSLATABLE STRING:
//   1. Add data-i18n="some.key" to the HTML element.
//   2. Add "some.key": "..." under en / bn / ar in that page's `translations` object.
// ============================================================================

(function () {
  var STORAGE_KEY = "nmq_lang";
  var DEFAULT_LANG = "en";

  function getSavedLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore (private browsing etc.) */
    }
  }

  function t(dict, lang, key) {
    if (dict[lang] && dict[lang][key] != null) return dict[lang][key];
    if (dict.en && dict.en[key] != null) return dict.en[key]; // fallback to English
    return null;
  }

  function applyLanguage(lang) {
    var dict = window.translations || { en: {} };
    if (!dict[lang]) lang = "en";

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    document.body.classList.remove("lang-en", "lang-bn", "lang-ar");
    document.body.classList.add("lang-" + lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(dict, lang, key);
      if (val != null) el.innerHTML = val;
    });

    // Special case: index.html's animated hero heading (built from a lines array)
    if (typeof window.setHeroHeading === "function") {
      window.setHeroHeading(lang);
    }

    // Re-render the fleet grid if it exists on this page (labels are language-aware)
    if (typeof window.renderFleet === "function") {
      window.renderFleet(lang);
    }

    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === lang);
    });

    saveLang(lang);
  }

  function initI18n() {
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLanguage(btn.getAttribute("data-lang-btn"));
      });
    });
    applyLanguage(getSavedLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }

  window.applyLanguage = applyLanguage;
})();

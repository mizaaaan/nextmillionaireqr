/*
 * nav.js — mobile menu (hamburger) behaviour, shared by every page.
 * Closes on: link click, click outside the nav, Escape key, widening the window.
 */
(function () {
  'use strict';

  function init() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    function isOpen() { return menu.classList.contains('is-open'); }

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (isOpen() && !e.target.closest('.nav-wrap')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 769px)');
      var onChange = function (m) { if (m.matches) setOpen(false); };
      if (wide.addEventListener) wide.addEventListener('change', onChange);
      else if (wide.addListener) wide.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/*
 * theme-toggle.js — dark / light mode buttons (.theme-toggle).
 * The initial theme is applied by theme-init.js; this file wires the buttons,
 * keeps their aria state in sync, and syncs the choice across open tabs.
 */
(function () {
  'use strict';
  var STORAGE_KEY = 'nm-theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function reflect() {
    var pressed = current() === 'dark' ? 'true' : 'false';
    var buttons = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('aria-pressed', pressed);
  }

  function set(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* storage unavailable */ }
    reflect();
  }

  function init() {
    var buttons = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        set(current() === 'dark' ? 'light' : 'dark');
      });
    }
    reflect();
  }

  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
      root.setAttribute('data-theme', e.newValue);
      reflect();
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

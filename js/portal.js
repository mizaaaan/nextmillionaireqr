/*
 * portal.js — Member Portal sign-in screen.
 *
 * IMPORTANT — READ BEFORE RELYING ON THIS
 *   This is a convenience gate, NOT real security. The password below is
 *   visible to anyone who views the page source, and the PDF files in /docs
 *   can be opened directly by anyone who knows their web address.
 *   Do not publish confidential material here. See README.md, section
 *   "Member Portal", for how to upgrade to real protection (Cloudflare Access).
 *
 * TO CHANGE THE PASSWORD: edit PORTAL_PASSWORD below, then tell the members.
 */
(function () {
  'use strict';

  var PORTAL_PASSWORD = 'nm@2026';
  var SESSION_KEY = 'nmq_portal';

  var loginScreen = document.getElementById('login-screen');
  var dashboard = document.getElementById('dashboard');
  var form = document.getElementById('login-form');
  var input = document.getElementById('portal-pass');
  var errorBox = document.getElementById('login-error');
  var logoutBtn = document.getElementById('logout-btn');
  if (!loginScreen || !dashboard || !form || !input) return;

  var errorShown = false;

  function isUnlocked() {
    try { return sessionStorage.getItem(SESSION_KEY) === 'true'; } catch (e) { return false; }
  }
  function setUnlocked(value) {
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, 'true');
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (e) { /* private mode: unlock lasts until reload */ }
  }

  function showError() {
    errorShown = true;
    errorBox.textContent = NM.t('portal.error');
  }
  function clearError() {
    errorShown = false;
    errorBox.textContent = '';
  }

  function show(unlocked) {
    loginScreen.hidden = unlocked;
    dashboard.hidden = !unlocked;
    input.value = '';
    clearError();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value.trim() === PORTAL_PASSWORD) {
      setUnlocked(true);
      show(true);
      var heading = dashboard.querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    } else {
      showError();
      input.value = '';
      input.focus();
    }
  });

  logoutBtn.addEventListener('click', function () {
    setUnlocked(false);
    show(false);
    input.focus();
  });

  // Keep the error message in the selected language.
  NM.onLanguage(function () { if (errorShown) showError(); });

  show(isUnlocked());
})();

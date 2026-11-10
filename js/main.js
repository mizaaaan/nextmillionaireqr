/*
 * main.js — small behaviours shared by every page:
 *   - footer copyright year            ([data-year])
 *   - hero background video            (<video data-hero-video>, URL from config.js)
 *   - hero headline word animation     (<h1 data-hero-words>, home page)
 *   - back-to-top button               (.back-to-top)
 *   - fade-in on scroll                (.reveal)
 */
(function () {
  'use strict';

  var cfg = window.NM_CONFIG || {};
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- footer year ---------- */
  function initYear() {
    var year = String(new Date().getFullYear());
    var els = document.querySelectorAll('[data-year]');
    for (var i = 0; i < els.length; i++) els[i].textContent = year;
  }

  /* ---------- hero video ---------- */
  function initVideo() {
    var video = document.querySelector('video[data-hero-video]');
    if (!video || !cfg.heroVideoUrl) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reducedMotion || saveData) return;       // keep the plain brand background
    video.muted = true;
    video.src = cfg.heroVideoUrl;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: poster/background stays */ });
  }

  /* ---------- hero headline: split into words and animate ---------- */
  function splitHeadline() {
    var h1 = document.querySelector('h1[data-hero-words]');
    if (!h1) return;
    var index = 0;
    var lines = h1.querySelectorAll('.hero-line');
    for (var i = 0; i < lines.length; i++) {
      var words = lines[i].textContent.trim().split(/\s+/);
      lines[i].textContent = '';
      for (var w = 0; w < words.length; w++) {
        var span = document.createElement('span');
        span.className = 'hero-word';
        span.style.setProperty('--delay', 200 + index * 80 + 'ms');
        span.textContent = words[w];
        lines[i].appendChild(span);
        if (w < words.length - 1) lines[i].appendChild(document.createTextNode(' '));
        index++;
      }
    }
    h1.classList.add('is-split');
  }

  /* ---------- back to top ---------- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    var ticking = false;
    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 400);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('is-visible');
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    for (var j = 0; j < els.length; j++) observer.observe(els[j]);
  }

  function init() {
    initYear();
    initVideo();
    initBackToTop();
    initReveal();
    if (window.NM && NM.onLanguage) NM.onLanguage(splitHeadline);
    else splitHeadline();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

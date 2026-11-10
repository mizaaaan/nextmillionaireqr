/*
 * fleet.js — renders the fleet cards from /data/fleet-status.json.
 *
 * HOW TO UPDATE THE FLEET (no code changes needed)
 *   Edit data/fleet-status.json:
 *     - change "status" to "booked" or "available"
 *     - add a car: copy a line, give it the next "num" and its photo path
 *   The home page (3-car preview) and the fleet page (all cars) both read the
 *   same file, and "{N} cars" in the intro text updates automatically.
 *
 * MARKUP HOOKS
 *   <div data-fleet-grid data-variant="feature|compact" data-limit="3">
 *   <span data-fleet-count>12</span>
 */
(function () {
  'use strict';

  var cfg = window.NM_CONFIG || {};
  var carsPromise = null;

  function loadCars() {
    if (!carsPromise) {
      carsPromise = fetch(cfg.fleetDataUrl, { cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (json) { return Array.isArray(json.cars) ? json.cars : []; });
    }
    return carsPromise;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function applyLink(className, label) {
    var a = el('a', className, label);
    a.href = cfg.driverFormUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }

  function photo(car, label) {
    var img = document.createElement('img');
    img.src = car.image;
    img.alt = label;
    img.loading = 'lazy';
    img.decoding = 'async';
    return img;
  }

  /* ---- large card (home page preview) ---- */
  function featureCard(car) {
    var booked = car.status !== 'available';
    var label = NM.t('fleetcard.car') + ' ' + car.num;

    var pill = el('span', 'fleet-pill ' + (booked ? 'is-booked' : 'is-available'));
    if (!booked) pill.appendChild(el('span', 'fleet-pill-dot'));
    pill.appendChild(document.createTextNode(NM.t(booked ? 'fleetcard.booked' : 'fleetcard.available')));

    var imgBox = el('div', 'fleet-feature-photo');
    imgBox.appendChild(photo(car, label));
    imgBox.appendChild(pill);

    var action = booked
      ? el('span', 'fleet-feature-btn is-booked', NM.t('fleetcard.booked'))
      : applyLink('fleet-feature-btn', NM.t('fleetcard.apply'));

    var foot = el('div', 'fleet-feature-foot');
    foot.appendChild(el('span', 'fleet-feature-label', NM.t(booked ? 'fleetcard.currentlyLeased' : 'fleetcard.monthlyLease')));
    foot.appendChild(action);

    var body = el('div', 'fleet-feature-body');
    body.appendChild(el('h4', 'fleet-feature-title', label));
    body.appendChild(el('p', 'fleet-feature-desc', NM.t(booked ? 'fleetcard.descBooked' : 'fleetcard.descAvailable')));
    body.appendChild(el('div', 'fleet-feature-divider'));
    body.appendChild(foot);

    var card = el('article', 'fleet-feature');
    card.appendChild(imgBox);
    card.appendChild(body);
    return card;
  }

  /* ---- compact card (fleet page) ---- */
  function compactCard(car) {
    var booked = car.status !== 'available';
    var label = NM.t('fleetcard.car') + ' ' + car.num;

    var photoBox = el('div', 'fleet-photo');
    photoBox.appendChild(photo(car, label));

    var action = booked
      ? el('span', 'fleet-status is-booked', NM.t('fleetcard.booked'))
      : applyLink('fleet-status is-available', NM.t('fleetcard.apply'));

    var info = el('div', 'fleet-info');
    info.appendChild(el('span', 'fleet-label', label));
    info.appendChild(action);

    var card = el('article', 'fleet-card');
    card.appendChild(photoBox);
    card.appendChild(info);
    return card;
  }

  function message(text) {
    return el('p', 'fleet-message muted', text);
  }

  function formatCount(n) {
    try {
      return new Intl.NumberFormat(NM.lang === 'bn' ? 'bn-BD' : 'en').format(n);
    } catch (e) { return String(n); }
  }

  function render() {
    var grids = document.querySelectorAll('[data-fleet-grid]');
    var counters = document.querySelectorAll('[data-fleet-count]');
    if (!grids.length && !counters.length) return;

    loadCars().then(function (cars) {
      for (var c = 0; c < counters.length; c++) counters[c].textContent = formatCount(cars.length);

      grids.forEach(function (grid) {
        var limit = parseInt(grid.getAttribute('data-limit'), 10);
        var list = limit > 0 ? cars.slice(0, limit) : cars;
        var build = grid.getAttribute('data-variant') === 'feature' ? featureCard : compactCard;
        grid.textContent = '';
        if (!list.length) { grid.appendChild(message(NM.t('fleetcard.empty'))); return; }
        list.forEach(function (car) { grid.appendChild(build(car)); });
      });
    }).catch(function () {
      grids.forEach(function (grid) {
        grid.textContent = '';
        grid.appendChild(message(NM.t('fleetcard.error')));
      });
    });
  }

  // Re-render whenever the language changes (labels are translated).
  // The counter spans are re-queried inside render() because i18n replaces them.
  NM.onLanguage(render);
})();

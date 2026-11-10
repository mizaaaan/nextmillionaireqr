/*
 * team.js — renders member cards from /data/team.json.
 *
 * HOW TO EDIT THE TEAM (no code changes needed)
 *   Edit data/team.json. Each person has:
 *     name   – shown as written
 *     role   – "exec" | "coexec" | "it" | "member"   (labels live in locales/*.json: role.*)
 *     bio    – key of a short bio in locales/*.json (bio.leader, bio.ops, bio.member, ...)
 *     image  – photo path, e.g. "/images/team/jane-doe.jpg"  (optional; initials are shown if missing)
 *     email  – shown as a mailto: link
 *     group  – "management" (home + team page top section) or "members" (team page list)
 *
 * MARKUP HOOK
 *   <div data-team-grid data-group="management" data-limit="6">
 */
(function () {
  'use strict';

  var cfg = window.NM_CONFIG || {};
  var promise = null;

  function loadMembers() {
    if (!promise) {
      promise = fetch(cfg.teamDataUrl, { cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (json) { return Array.isArray(json.members) ? json.members : []; });
    }
    return promise;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) {
      return w.charAt(0);
    }).join('').toUpperCase();
  }

  function card(member) {
    var avatar = el('div', 'avatar');
    avatar.appendChild(el('span', 'avatar-initials', initials(member.name)));
    if (member.image) {
      var img = document.createElement('img');
      img.alt = member.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 68;
      img.height = 68;
      // If the photo file is missing, drop the <img> so the initials show.
      img.addEventListener('error', function () { img.remove(); });
      img.src = member.image;
      avatar.appendChild(img);
    }

    var article = el('article', 'member-card');
    article.appendChild(avatar);
    article.appendChild(el('h3', 'member-name', member.name));
    article.appendChild(el('div', 'member-role', NM.t('role.' + member.role)));
    article.appendChild(el('p', 'muted', NM.t('bio.' + member.bio)));
    if (member.email) {
      var mail = el('a', 'member-contact', member.email);
      mail.href = 'mailto:' + member.email;
      article.appendChild(mail);
    }
    return article;
  }

  function render() {
    var grids = document.querySelectorAll('[data-team-grid]');
    if (!grids.length) return;

    loadMembers().then(function (members) {
      grids.forEach(function (grid) {
        var group = grid.getAttribute('data-group');
        var limit = parseInt(grid.getAttribute('data-limit'), 10);
        var list = members.filter(function (m) { return !group || m.group === group; });
        if (limit > 0) list = list.slice(0, limit);
        grid.textContent = '';
        list.forEach(function (m) { grid.appendChild(card(m)); });
      });
    }).catch(function () {
      grids.forEach(function (grid) {
        grid.textContent = '';
        grid.appendChild(el('p', 'team-message muted', NM.t('team.error')));
      });
    });
  }

  NM.onLanguage(render);
})();

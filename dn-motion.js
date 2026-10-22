/**
 * Motion design partagé — Digital Numérique
 * Barre de progression, transition entre les pages, apparition au défilement,
 * effet 3D sur les cartes photo et indicateur de défilement du héros.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Barre de progression de lecture ----------
  var progress = document.createElement('div');
  progress.className = 'dn-progress';
  document.body.appendChild(progress);

  var ticking = false;
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  // ---------- Indicateur de défilement du héros ----------
  var hero = document.querySelector('.hero');
  if (hero && !hero.querySelector('.dn-scroll-cue')) {
    var cue = document.createElement('span');
    cue.className = 'dn-scroll-cue';
    cue.setAttribute('aria-hidden', 'true');
    hero.appendChild(cue);
  }

  // ---------- Apparition au défilement (éléments [data-reveal]) ----------
  var revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if (reduced) return;

  // ---------- Transition entre les pages ----------
  var main = document.querySelector('main');
  if (main) main.classList.add('dn-page-enter');

  var curtain = document.createElement('div');
  curtain.className = 'dn-curtain';
  document.body.appendChild(curtain);

  // Retour arrière depuis le cache du navigateur : on retire le rideau.
  window.addEventListener('pageshow', function () { curtain.classList.remove('is-leaving'); });

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target === '_blank' || link.hasAttribute('download') || link.classList.contains('glightbox')) return;

    var url = new URL(link.href, location.href);
    var samePage = url.pathname === location.pathname && url.search === location.search;
    if (url.origin !== location.origin || samePage || !/^https?:$/.test(url.protocol)) return;
    if (/\.(jpe?g|png|webp|gif|mp3|pdf)$/i.test(url.pathname)) return;

    e.preventDefault();
    curtain.classList.add('is-leaving');
    setTimeout(function () { location.href = url.href; }, 420);
  });

  // ---------- Navigation fluide entre les sections (menu, boutons, liens #) ----------
  var root = document.documentElement;
  var scrollAnim = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function stopScroll() {
    if (!scrollAnim) return;
    cancelAnimationFrame(scrollAnim.frame);
    scrollAnim.target.classList.remove('dn-arriving');
    root.style.scrollBehavior = '';
    scrollAnim = null;
  }

  function smoothScrollTo(target) {
    stopScroll();
    var margin = parseInt(getComputedStyle(target).scrollMarginTop, 10) || 0;
    var start = window.scrollY;
    var end = Math.max(0, Math.min(
      target.getBoundingClientRect().top + start - margin,
      root.scrollHeight - window.innerHeight
    ));
    var distance = end - start;
    if (Math.abs(distance) < 2) return;

    // Plus la section est loin, plus le trajet dure (sans jamais traîner).
    var duration = Math.min(1500, Math.max(700, 450 + Math.abs(distance) * 0.25));
    var t0 = null;

    root.style.scrollBehavior = 'auto'; // sinon le CSS « smooth » freine chaque étape
    if (Math.abs(distance) > window.innerHeight * 0.6) target.classList.add('dn-arriving');
    scrollAnim = { target: target, frame: 0 };

    (function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min((now - t0) / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(p));
      // La section d'arrivée se dévoile pendant le dernier tiers du trajet.
      if (p > 0.66) target.classList.remove('dn-arriving');
      if (p < 1) {
        scrollAnim.frame = requestAnimationFrame(step);
      } else {
        stopScroll();
      }
    })(performance.now());
  }

  // L'utilisateur reprend la main (molette, doigt, clavier) : on arrête l'animation.
  ['wheel', 'touchstart', 'keydown'].forEach(function (type) {
    window.addEventListener(type, stopScroll, { passive: true });
  });

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="#"]');
    if (!link || e.defaultPrevented || link.hasAttribute('data-bs-toggle') || link.getAttribute('role') === 'button') return;
    var url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || url.search !== location.search || url.hash.length < 2) return;

    var target;
    try { target = document.querySelector(url.hash); } catch (err) { return; }
    if (!target) return;

    e.preventDefault();
    smoothScrollTo(target);
    if (history.pushState) history.pushState(null, '', url.hash);
  });

  // ---------- Titre du héros : lettre par lettre ----------
  var heroTitle = document.querySelector('.hero h2, .breadcrumb-area .page-title');
  if (heroTitle) {
    var charIndex = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) { split(child); return; }
        if (child.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        child.textContent.split('').forEach(function (ch) {
          if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
          var span = document.createElement('span');
          span.className = 'dn-char';
          span.textContent = ch;
          span.style.animationDelay = (0.35 + charIndex++ * 0.05) + 's';
          frag.appendChild(span);
        });
        node.replaceChild(frag, child);
      });
    })(heroTitle);
    heroTitle.setAttribute('aria-label', heroTitle.textContent);
  }

  // ---------- Révélations au défilement : photos du portfolio, ligne « Notre méthode » ----------
  if ('IntersectionObserver' in window) {
    var clipObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        clipObserver.unobserve(el);
        if (el.classList.contains('process-steps')) { el.classList.add('is-drawn'); return; }
        el.classList.add('is-revealed');
        // Une fois dévoilée, la photo retrouve son effet de survol d'origine.
        setTimeout(function () { el.classList.remove('dn-clip', 'is-revealed'); }, 1500);
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.portfolio .portfolio-content').forEach(function (el) {
      el.classList.add('dn-clip');
      clipObserver.observe(el);
    });
    var steps = document.querySelector('.process-steps');
    if (steps) clipObserver.observe(steps);
  }

  // ---------- Effet 3D, curseur et boutons aimantés (souris uniquement) ----------
  if (!finePointer) return;

  var cursor = document.createElement('div');
  cursor.className = 'dn-cursor';
  document.body.appendChild(cursor);
  var mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    cursor.classList.add('is-active');
    cursor.classList.toggle('is-hover', !!e.target.closest('a, button, label, .portfolio-content, .single-portfolio-content'));
  });
  document.addEventListener('mouseleave', function () { cursor.classList.remove('is-active'); });
  (function follow() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll('.btn-cta, .btn-send, .dn-btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.25;
      var y = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });

  function enableTilt(card) {
    if (card.dataset.dnTilt) return;
    card.dataset.dnTilt = '1';
    card.classList.add('dn-tilt');
    var glare = document.createElement('span');
    glare.className = 'dn-tilt-glare';
    card.appendChild(glare);

    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 8).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 8).toFixed(2) + 'deg)';
      card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  }

  var TILT_SELECTOR = '.portfolio .portfolio-content, .album-teaser-stack, .dn-album-item .single-portfolio-content';
  document.querySelectorAll(TILT_SELECTOR).forEach(enableTilt);

  // L'album photo ajoute ses cartes après coup (filtres, « Voir plus »).
  var albumGrid = document.getElementById('dnAlbumGrid');
  if (albumGrid && 'MutationObserver' in window) {
    new MutationObserver(function () {
      albumGrid.querySelectorAll('.single-portfolio-content').forEach(enableTilt);
    }).observe(albumGrid, { childList: true });
  }
})();

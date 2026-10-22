/**
 * Contenu dynamique piloté par le back-office (backend-admin/) : logo,
 * bannière d'événement et photos de galerie ajoutées par l'admin.
 *
 * Le site GitHub Pages reste 100% statique : ce script ne fait que lire
 * des endpoints JSON publics en lecture seule (CORS) exposés par le
 * back-office PHP/MySQL, une fois son URL renseignée dans dn-config.js.
 * Tant qu'elle est vide, ou si l'API est injoignable, le site continue de
 * fonctionner tel quel avec son contenu statique par défaut.
 */
(function () {
  'use strict';

  const API_BASE = (window.DN_API_BASE_URL || '').replace(/\/+$/, '');
  if (!API_BASE) return;

  const GREETING_DISMISS_PREFIX = 'dnGreetingDismissed:';

  async function fetchJSON(path) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(API_BASE + path, { signal: controller.signal, credentials: 'omit' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /* ---------------------------------------------------------------
   * 1) Logo (toutes les pages)
   * ------------------------------------------------------------- */
  async function applyLogo() {
    const data = await fetchJSON('/api/settings.php');
    if (!data) return;

    if (data.logo_url) {
      const logoUrl = API_BASE + data.logo_url;
      document.querySelectorAll('.profile-img img').forEach((img) => {
        img.src = logoUrl;
      });
    }
    if (data.favicon_url) {
      const faviconUrl = API_BASE + data.favicon_url;
      document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
        link.href = faviconUrl;
      });
    }
  }

  /* ---------------------------------------------------------------
   * 2) Bannière d'événement (page d'accueil uniquement)
   * ------------------------------------------------------------- */
  async function applyGreeting() {
    const container = document.querySelector('body.index-page');
    if (!container) return;

    const data = await fetchJSON('/api/greeting.php');
    const greeting = data && data.greeting;
    if (!greeting || !greeting.greeting_message) return;

    const dismissKey = GREETING_DISMISS_PREFIX + greeting.event_name + ':' + greeting.greeting_message;
    try {
      if (sessionStorage.getItem(dismissKey) === '1') return;
    } catch (e) { /* sessionStorage indisponible : on affiche quand même */ }

    const theme = ['noel', 'ramadan', 'nouvel-an', 'paques'].includes(greeting.theme) ? greeting.theme : 'default';

    const banner = document.createElement('div');
    banner.className = 'event-banner event-banner-' + theme;
    banner.setAttribute('role', 'status');
    banner.innerHTML =
      '<span class="event-banner-message"></span>' +
      '<button type="button" class="event-banner-close" aria-label="Fermer ce message">&times;</button>';
    banner.querySelector('.event-banner-message').textContent = greeting.greeting_message;

    banner.querySelector('.event-banner-close').addEventListener('click', () => {
      banner.classList.add('is-closing');
      setTimeout(() => banner.remove(), 300);
      try { sessionStorage.setItem(dismissKey, '1'); } catch (e) { /* ignore */ }
    });

    document.body.insertBefore(banner, document.body.firstChild);
    requestAnimationFrame(() => banner.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------------
   * 3) Photos de galerie ajoutées via l'admin (page d'accueil uniquement)
   * ------------------------------------------------------------- */
  async function applyGalleryPhotos() {
    const container = document.querySelector('.isotope-container');
    if (!container) return;

    const data = await fetchJSON('/api/photos.php');
    const photos = data && Array.isArray(data.photos) ? data.photos : [];
    if (!photos.length) return;

    const validCategories = { photo: 'filter-photo', graphisme: 'filter-graphisme', web: 'filter-web' };

    photos.forEach((photo) => {
      const filterClass = validCategories[photo.category] || 'filter-photo';
      const imgUrl = API_BASE + photo.file_path;
      const title = photo.title || 'Photo';

      const item = document.createElement('div');
      item.className = 'col-6 col-lg-4 col-md-6 portfolio-item isotope-item ' + filterClass;
      item.innerHTML =
        '<div class="portfolio-content h-100">' +
        '<img loading="lazy" class="img-fluid" alt="">' +
        '<div class="portfolio-info">' +
        '<h4></h4>' +
        '<p></p>' +
        '<a data-gallery="portfolio-gallery-admin" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>' +
        '</div></div>';

      const img = item.querySelector('img');
      img.src = imgUrl;
      img.alt = title;
      item.querySelector('h4').textContent = title;
      item.querySelector('p').textContent = photo.description || '';
      const link = item.querySelector('a.preview-link');
      link.href = imgUrl;
      link.title = title;

      container.appendChild(item);
    });

    // Réintègre les nouveaux éléments dans la mise en page Isotope déjà
    // initialisée par main.js (Isotope.data() retrouve l'instance liée au
    // conteneur sans dépendre de sa portée interne). main.js ne crée cette
    // instance qu'une fois les images d'origine chargées (imagesLoaded),
    // ce qui peut survenir après notre propre événement : on patiente donc
    // un court instant si besoin.
    const reflowIsotope = (attemptsLeft) => {
      if (!window.Isotope || typeof window.Isotope.data !== 'function') return;
      const iso = window.Isotope.data(container);
      if (iso) {
        if (window.imagesLoaded) {
          window.imagesLoaded(container, () => iso.reloadItems().arrange());
        } else {
          iso.reloadItems();
          iso.arrange();
        }
      } else if (attemptsLeft > 0) {
        setTimeout(() => reflowIsotope(attemptsLeft - 1), 150);
      }
    };
    reflowIsotope(20);
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyLogo();
    applyGreeting();
  });
  window.addEventListener('load', applyGalleryPhotos);
})();

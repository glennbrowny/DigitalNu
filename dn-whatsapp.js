/**
 * WhatsApp — Digital Numérique
 *  1. Ajoute le bouton WhatsApp flottant (en bas à droite) sur la page.
 *  2. Branche les boutons « Envoyer via WhatsApp » des formulaires Contact et
 *     Réservation : le message s'ouvre pré-rempli dans WhatsApp, il ne reste
 *     qu'à l'envoyer. Aucun serveur nécessaire (compatible GitHub Pages).
 *
 * Numéro au format international, sans « + » ni espace (+241 06 73 89 76).
 */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = window.DN_WHATSAPP_NUMBER || '24106738976';
  var DEFAULT_MESSAGE = 'Bonjour Digital Numérique, je souhaite avoir des informations sur vos services.';

  function whatsappUrl(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  // ---------- Bouton flottant ----------
  if (!document.querySelector('.wa-float')) {
    var floatBtn = document.createElement('a');
    floatBtn.className = 'wa-float';
    floatBtn.href = whatsappUrl(DEFAULT_MESSAGE);
    floatBtn.target = '_blank';
    floatBtn.rel = 'noopener noreferrer';
    floatBtn.setAttribute('aria-label', 'Discuter avec nous sur WhatsApp');
    floatBtn.innerHTML =
      '<span class="wa-float-ring" aria-hidden="true"></span>' +
      '<span class="wa-float-ring wa-float-ring-2" aria-hidden="true"></span>' +
      '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.27-1.6a12.1 12.1 0 0 0 3.77.6C22.68 28 28 22.64 28 16.03 28 9.42 22.68 3 16.04 3Zm0 22.86c-1.2 0-2.38-.2-3.5-.6l-.5-.18-4.9.95.98-4.75-.2-.5a9.8 9.8 0 0 1-1.2-4.8c0-5.45 4.4-9.88 9.32-9.88 5.38 0 9.78 4.43 9.78 9.88 0 5.45-4.4 9.88-9.78 9.88Zm5.38-7.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.48.7.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>' +
      '<span class="wa-float-tip">Discutons sur WhatsApp</span>';
    document.body.appendChild(floatBtn);
  }

  // ---------- Formulaires ----------
  function value(form, selector) {
    var field = form.querySelector(selector);
    return field ? field.value.trim() : '';
  }

  // Valide uniquement les champs utiles au message WhatsApp (l'email n'y est pas obligatoire).
  function checkFields(form, selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var field = form.querySelector(selectors[i]);
      if (field && !field.reportValidity()) return false;
    }
    return true;
  }

  function line(label, text) {
    return text ? '\n*' + label + ' :* ' + text : '';
  }

  function openWhatsApp(text) {
    var link = document.createElement('a');
    link.href = whatsappUrl(text);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  }

  var contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    var contactBtn = contactForm.querySelector('[data-send="whatsapp"]');
    contactBtn && contactBtn.addEventListener('click', function () {
      if (!checkFields(contactForm, ['[name=name]', '[name=subject]', '[name=message]'])) return;

      openWhatsApp(
        'Bonjour Digital Numérique,' +
        line('Nom', value(contactForm, '[name=name]')) +
        line('Email', value(contactForm, '[name=email]')) +
        line('Sujet', value(contactForm, '[name=subject]')) +
        '\n\n' + value(contactForm, '[name=message]')
      );
    });
  }

  var reservationForm = document.querySelector('#reservation-form');
  if (reservationForm) {
    var reservationBtn = reservationForm.querySelector('[data-send="whatsapp"]');
    reservationBtn && reservationBtn.addEventListener('click', function () {
      if (!checkFields(reservationForm, ['[name=name]', '[name=service]', '[name=date]', '[name=time_start]', '[name=time_end]'])) return;

      // main.js désactive l'envoi quand la date ou le créneau est invalide (dimanche, date passée…).
      var emailBtn = reservationForm.querySelector('button[type=submit]');
      if (emailBtn && emailBtn.disabled) {
        reservationForm.querySelector('[name=date]').focus();
        return;
      }

      var service = reservationForm.querySelector('[name=service]:checked');
      var date = value(reservationForm, '[name=date]');
      var prettyDate = date ? new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

      openWhatsApp(
        'Bonjour Digital Numérique, je souhaite réserver un rendez-vous.' +
        line('Nom', value(reservationForm, '[name=name]')) +
        line('Email', value(reservationForm, '[name=email]')) +
        line('Téléphone', value(reservationForm, '[name=phone]')) +
        line('Service', service ? service.value : '') +
        line('Date', prettyDate) +
        line('Créneau', value(reservationForm, '[name=time_start]') + ' - ' + value(reservationForm, '[name=time_end]')) +
        (value(reservationForm, '[name=message]') ? '\n\n' + value(reservationForm, '[name=message]') : '')
      );
    });
  }
})();

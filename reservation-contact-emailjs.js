/**
 * Envoi des formulaires Contact et Réservation depuis un hébergement statique
 * (GitHub Pages) via EmailJS, puisqu'aucun serveur PHP n'est disponible pour
 * exécuter contact.php / reservation.php.
 *
 * À FAIRE AVANT QUE LES FORMULAIRES FONCTIONNENT : remplacer les 4 valeurs
 * ci-dessous par celles de votre compte sur https://www.emailjs.com/
 *   - publicKey       : Account > General > Public Key
 *   - serviceId       : Email Services > (votre service Gmail) > Service ID
 *   - templateNotify  : Email Templates > modèle envoyé à VOUS > Template ID
 *   - templateConfirm : Email Templates > modèle envoyé au CLIENT > Template ID
 */
(function () {
  "use strict";

  const EMAILJS_CONFIG = {
    publicKey: 'C_OcZR5IMzd3AghcF',
    serviceId: 'service_typ0quf',
    templateNotify: 'template_85988eb',
    templateConfirm: 'template_fwowc7i',
  };

  const BUSINESS_EMAIL = 'nzeglenn6@gmail.com';
  const PUBLIC_EMAIL = 'digital.num@gmail.com'; // adresse affichée sur le site
  const BUSINESS_NAME = 'Digital Numérique';
  const MIN_SECONDS_BETWEEN_SUBMITS = 30;

  const isConfigured = Object.values(EMAILJS_CONFIG).every(function (v) {
    return v && v.indexOf('VOTRE_') !== 0;
  });

  if (window.emailjs && isConfigured) {
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }

  function showLoading(form) {
    form.querySelector('.loading').classList.add('d-block');
    form.querySelector('.error-message').classList.remove('d-block');
    form.querySelector('.sent-message').classList.remove('d-block');
  }

  function showSuccess(form) {
    form.querySelector('.loading').classList.remove('d-block');
    form.querySelector('.sent-message').classList.add('d-block');
    form.reset();
  }

  function showError(form, message) {
    form.querySelector('.loading').classList.remove('d-block');
    const errorEl = form.querySelector('.error-message');
    errorEl.textContent = message;
    errorEl.classList.add('d-block');
  }

  function recentlySubmitted(storageKey) {
    const last = Number(localStorage.getItem(storageKey) || 0);
    return (Date.now() - last) < MIN_SECONDS_BETWEEN_SUBMITS * 1000;
  }

  function markSubmitted(storageKey) {
    localStorage.setItem(storageKey, String(Date.now()));
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Secours si EmailJS échoue : ouvre la messagerie du visiteur avec le message pré-rempli.
  function openMailto(subject, body) {
    window.location.href = 'mailto:' + PUBLIC_EMAIL +
      '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function sendEmails(paramsNotify, paramsConfirm) {
    return window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateNotify, paramsNotify)
      .then(function () {
        // Email de confirmation au client : best-effort, un échec ici ne doit pas
        // faire échouer la demande (le message principal est déjà parti).
        return window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateConfirm, paramsConfirm).catch(function () {});
      });
  }

  // --- Formulaire de contact ---
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!isConfigured) {
        showError(contactForm, "Le formulaire n'est pas encore configuré. Merci de nous contacter par téléphone.");
        return;
      }

      // Honeypot : les vrais visiteurs ne voient jamais ce champ.
      if (contactForm.querySelector('[name=website]').value.trim() !== '') {
        showSuccess(contactForm);
        return;
      }

      const name = contactForm.querySelector('[name=name]').value.trim();
      const email = contactForm.querySelector('[name=email]').value.trim();
      const subject = contactForm.querySelector('[name=subject]').value.trim();
      const message = contactForm.querySelector('[name=message]').value.trim();

      if (!name || !email || !subject || !message) {
        showError(contactForm, 'Veuillez remplir tous les champs obligatoires.');
        return;
      }
      if (!isValidEmail(email)) {
        showError(contactForm, "L'adresse email n'est pas valide.");
        return;
      }
      if (recentlySubmitted('dn_contact_last_submit')) {
        showError(contactForm, 'Merci de patienter quelques instants avant de renvoyer un message.');
        return;
      }

      showLoading(contactForm);

      const paramsNotify = {
        to_email: BUSINESS_EMAIL,
        from_name: name,
        from_email: email,
        reply_to: email,
        subject: subject,
        message: 'Nom : ' + name + '\nEmail : ' + email + '\nMessage :\n' + message,
      };
      const paramsConfirm = {
        to_email: email,
        to_name: name,
        reply_to: BUSINESS_EMAIL,
        subject: 'Nous avons bien reçu votre message - ' + BUSINESS_NAME,
        message: 'Bonjour ' + name + ',\n\nNous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.\n\nRécapitulatif :\nSujet : ' + subject + '\nMessage : ' + message + '\n\nÀ bientôt,\nL\'équipe ' + BUSINESS_NAME,
      };

      sendEmails(paramsNotify, paramsConfirm)
        .then(function () {
          markSubmitted('dn_contact_last_submit');
          showSuccess(contactForm);
        })
        .catch(function () {
          openMailto(subject, paramsNotify.message);
          showError(contactForm, "L'envoi automatique a échoué : votre messagerie s'ouvre avec le message pré-rempli. Vous pouvez aussi utiliser WhatsApp.");
        });
    });
  }

  // --- Formulaire de réservation ---
  const reservationForm = document.querySelector('#reservation-form');
  if (reservationForm) {
    reservationForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!isConfigured) {
        showError(reservationForm, "Le formulaire n'est pas encore configuré. Merci de nous contacter par téléphone.");
        return;
      }

      // Honeypot : les vrais visiteurs ne voient jamais ce champ.
      if (reservationForm.querySelector('[name=website]').value.trim() !== '') {
        showSuccess(reservationForm);
        return;
      }

      const name = reservationForm.querySelector('[name=name]').value.trim();
      const email = reservationForm.querySelector('[name=email]').value.trim();
      const phone = reservationForm.querySelector('[name=phone]').value.trim();
      const serviceField = reservationForm.querySelector('[name=service]:checked');
      const service = serviceField ? serviceField.value : '';
      const date = reservationForm.querySelector('[name=date]').value;
      const timeStart = reservationForm.querySelector('[name=time_start]').value;
      const timeEnd = reservationForm.querySelector('[name=time_end]').value;
      const message = reservationForm.querySelector('[name=message]').value.trim();

      if (!name || !email || !service || !date || !timeStart || !timeEnd) {
        showError(reservationForm, 'Veuillez remplir tous les champs obligatoires.');
        return;
      }
      if (!isValidEmail(email)) {
        showError(reservationForm, "L'adresse email n'est pas valide.");
        return;
      }
      if (timeEnd <= timeStart) {
        showError(reservationForm, "L'intervalle d'heure choisi n'est pas valide.");
        return;
      }
      if (recentlySubmitted('dn_reservation_last_submit')) {
        showError(reservationForm, 'Merci de patienter quelques instants avant de renvoyer une demande.');
        return;
      }

      showLoading(reservationForm);

      const recap = 'Nom : ' + name + '\nEmail : ' + email + '\nTéléphone : ' + phone +
        '\nService souhaité : ' + service + '\nDate souhaitée : ' + date +
        '\nCréneau souhaité : ' + timeStart + ' - ' + timeEnd + '\nDétails de la demande :\n' + message;

      const paramsNotify = {
        to_email: BUSINESS_EMAIL,
        from_name: name,
        from_email: email,
        reply_to: email,
        subject: 'Nouvelle réservation - ' + service,
        message: recap,
      };
      const paramsConfirm = {
        to_email: email,
        to_name: name,
        reply_to: BUSINESS_EMAIL,
        subject: 'Votre demande de réservation a bien été reçue - ' + BUSINESS_NAME,
        message: 'Bonjour ' + name + ',\n\nNous avons bien reçu votre demande de réservation. Notre équipe va l\'examiner et vous recontactera rapidement pour la confirmer.\n\nRécapitulatif de votre demande :\nService : ' + service + '\nDate souhaitée : ' + date + '\nCréneau souhaité : ' + timeStart + ' - ' + timeEnd + '\n\nCette demande n\'est pas encore confirmée : nous vous contacterons par email ou téléphone pour valider ce rendez-vous.\n\nÀ bientôt,\nL\'équipe ' + BUSINESS_NAME,
      };

      sendEmails(paramsNotify, paramsConfirm)
        .then(function () {
          markSubmitted('dn_reservation_last_submit');
          showSuccess(reservationForm);
        })
        .catch(function () {
          openMailto(paramsNotify.subject, recap);
          showError(reservationForm, "L'envoi automatique a échoué : votre messagerie s'ouvre avec la demande pré-remplie. Vous pouvez aussi utiliser WhatsApp.");
        });
    });
  }
})();

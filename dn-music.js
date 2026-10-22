/**
 * Musique de fond — partagée par toutes les pages (site principal + album photo).
 *
 * « Nuvole Bianche » tourne en boucle derrière un bouton fixe. Les navigateurs
 * bloquent le son automatique tant que le visiteur n'a pas cliqué : la lecture
 * démarre donc d'un clic sur le bouton, ou, si la musique jouait déjà, elle
 * reprend d'elle-même dès que le navigateur l'autorise (sinon au premier clic).
 *
 * D'une page à l'autre, le morceau reprend là où il s'était arrêté, avec un
 * léger fondu sonore. La préférence marche/arrêt est mémorisée (localStorage).
 */
(function () {
  'use strict';

  var PREF_KEY = 'dnMusicPlaying';
  var TIME_KEY = 'dnMusicTime';
  var script = document.currentScript;

  function store(type) {
    try { return window[type]; } catch (e) { return null; }
  }
  function read(type, key) {
    var s = store(type);
    try { return s ? s.getItem(key) : null; } catch (e) { return null; }
  }
  function write(type, key, value) {
    var s = store(type);
    try { if (s) s.setItem(key, value); } catch (e) { /* navigation privée : on ignore */ }
  }

  // ---------- Lecteur + bouton (créés s'ils n'existent pas, ex. album photo) ----------
  var bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) {
    bgMusic = document.createElement('audio');
    bgMusic.id = 'bgMusic';
    bgMusic.loop = true;
    bgMusic.preload = 'none';
    bgMusic.src = new URL('Ludovico Einaudi - Nuvole Bianche.mp3', script ? script.src : location.href).href;
    document.body.appendChild(bgMusic);
  }

  var musicToggle = document.getElementById('musicToggle');
  if (!musicToggle) {
    musicToggle = document.createElement('button');
    musicToggle.type = 'button';
    musicToggle.id = 'musicToggle';
    musicToggle.className = 'music-toggle';
    musicToggle.setAttribute('aria-pressed', 'false');
    musicToggle.setAttribute('aria-label', 'Activer la musique de fond');
    musicToggle.innerHTML =
      '<i class="bi bi-music-note-beamed music-icon-static"></i>' +
      '<span class="music-bars" aria-hidden="true"><span></span><span></span><span></span><span></span></span>';
    document.body.appendChild(musicToggle);
  }

  // ---------- État ----------
  function setMusicState(isPlaying) {
    musicToggle.classList.toggle('is-playing', isPlaying);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.setAttribute('aria-label', isPlaying ? 'Couper la musique de fond' : 'Activer la musique de fond');
  }

  // Reprise à la position de la page précédente.
  var savedTime = parseFloat(read('sessionStorage', TIME_KEY)) || 0;
  if (savedTime > 0) {
    bgMusic.addEventListener('loadedmetadata', function () {
      if (bgMusic.duration) bgMusic.currentTime = savedTime % bgMusic.duration;
    }, { once: true });
  }
  window.addEventListener('pagehide', function () {
    if (!bgMusic.paused) write('sessionStorage', TIME_KEY, String(bgMusic.currentTime));
  });

  // Fondu sonore à la reprise, pour une transition douce entre les pages.
  function fadeIn() {
    var start = null;
    (function step(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / 1200, 1);
      bgMusic.volume = p;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  function playMusic() {
    bgMusic.muted = false;
    bgMusic.volume = 0;
    return bgMusic.play().then(function () {
      setMusicState(true);
      write('localStorage', PREF_KEY, '1');
      fadeIn();
    }).catch(function () {
      setMusicState(false);
      throw new Error('blocked');
    });
  }

  function pauseMusic() {
    bgMusic.pause();
    setMusicState(false);
    write('localStorage', PREF_KEY, '0');
  }

  musicToggle.addEventListener('click', function () {
    if (bgMusic.paused) {
      playMusic().catch(function () {});
    } else {
      pauseMusic();
    }
  });

  bgMusic.addEventListener('play', function () { setMusicState(true); });
  bgMusic.addEventListener('pause', function () { setMusicState(false); });

  // ---------- La musique jouait déjà : on la relance ----------
  if (read('localStorage', PREF_KEY) === '1') {
    var resumeOnFirstGesture = function (event) {
      if (event.target && event.target.closest && event.target.closest('#musicToggle')) return;
      document.removeEventListener('click', resumeOnFirstGesture);
      document.removeEventListener('touchstart', resumeOnFirstGesture);
      if (bgMusic.paused) playMusic().catch(function () {});
    };

    // Certains navigateurs l'autorisent tout de suite (visiteur déjà actif sur le site) ;
    // sinon on attend son premier clic ou toucher.
    playMusic().catch(function () {
      document.addEventListener('click', resumeOnFirstGesture);
      document.addEventListener('touchstart', resumeOnFirstGesture, { passive: true });
    });
  }
})();

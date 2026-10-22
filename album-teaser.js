/**
 * Album photo teaser — affiche dans le bloc animé du portfolio
 * les 3 premières photos de l'album (album-photo/photos.js).
 * Sans album chargé, les photos par défaut du HTML restent en place.
 */
(function () {
  'use strict';

  var album = window.DN_ALBUM;
  if (!album || !album.photos) return;

  var cards = document.querySelectorAll('.album-teaser .album-card img');
  album.photos.slice(0, cards.length).forEach(function (photo, i) {
    if (photo && photo.src) cards[i].src = 'album-photo/' + photo.src;
  });
})();

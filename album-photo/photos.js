/**
 * ============================================================
 *  ALBUM PHOTO — Digital Numérique
 *  Liste des albums et des photos affichés sur album-photo/index.html
 * ============================================================
 *
 *  POUR AJOUTER UNE PHOTO :
 *    1. Copiez votre image dans le dossier  album-photo/img/bg-img/
 *       (nom SANS espace ni accent, ex. : 17.jpg ou mariage-nzeng-01.jpg,
 *        de préférence en .jpg, idéalement < 500 Ko, ~1600 px de large)
 *    2. Ajoutez une ligne dans la liste "photos" ci-dessous :
 *         { src: 'img/bg-img/17.jpg', title: 'Mariage Nzeng', album: 'mariages' },
 *    3. Envoyez (commit + push) sur GitHub : le site se met à jour tout seul.
 *
 *  POUR CRÉER UN NOUVEL ALBUM :
 *    Ajoutez une ligne dans "albums" (id en minuscules, sans espace),
 *    puis utilisez cet id dans le champ "album" des photos.
 *    Un album sans photo n'apparaît pas dans les filtres : vous pouvez
 *    donc préparer des albums à l'avance.
 *
 *  Les photos s'affichent dans l'ordre de la liste (mettez les plus
 *  récentes en haut). Les 3 premières apparaissent aussi dans le bloc
 *  animé « Album photo » de la page d'accueil.
 * ============================================================
 */
window.DN_ALBUM = {
  albums: [
    { id: 'portraits',  label: 'Portraits' },
    { id: 'beaute',     label: 'Beauté & Retouche' },
    { id: 'evenements', label: 'Événements & Traditions' },
    { id: 'exterieur',  label: 'Extérieur & Couchers de soleil' },
    { id: 'mariages',   label: 'Mariages' },
    { id: 'famille',    label: 'Famille & Maternité' }
  ],

  photos: [
    { src: 'img/bg-img/3.png',   title: 'Portrait au voile lilas',              album: 'portraits' },
    { src: 'img/bg-img/13.jpg',  title: 'Tenue traditionnelle — avant / après', album: 'evenements' },
    { src: 'img/bg-img/8.png',   title: 'Portrait au bord de l\'eau',           album: 'portraits' },
    { src: 'img/bg-img/4.jpg',   title: 'Beauté — avant / après retouche',      album: 'beaute' },
    { src: 'img/bg-img/16.jpg',  title: 'Coucher de soleil en duo',             album: 'exterieur' },
    { src: 'img/bg-img/9.jpg',   title: 'Portrait studio',                      album: 'portraits' },
    { src: 'img/bg-img/15.jpg',  title: 'Cérémonie traditionnelle — avant / après', album: 'evenements' },
    { src: 'img/bg-img/5.jpg',   title: 'Portrait au voile — avant / après retouche', album: 'beaute' },
    { src: 'img/bg-img/11.jpg',  title: 'Portrait urbain',                      album: 'portraits' },
    { src: 'img/bg-img/12.jpg',  title: 'Face à l\'océan — avant / après',      album: 'exterieur' },
    { src: 'img/bg-img/7.png',   title: 'Portrait en lumière naturelle',        album: 'portraits' },
    { src: 'img/bg-img/14.jpg',  title: 'Danse traditionnelle — avant / après', album: 'evenements' },
    { src: 'img/bg-img/1.jpg',   title: 'Peau naturelle — avant / après retouche', album: 'beaute' },
    { src: 'img/bg-img/10.jpg',  title: 'Portrait en extérieur',                album: 'portraits' },
    { src: 'img/bg-img/6.jpg',   title: 'Journée à la plage — avant / après',   album: 'exterieur' }
  ]
};

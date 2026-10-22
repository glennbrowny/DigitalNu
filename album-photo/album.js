/**
 * Album photo — Digital Numérique
 * Construit les filtres, la grille, la visionneuse et le diaporama
 * à partir de window.DN_ALBUM (fichier photos.js).
 */
(function ($) {
    'use strict';

    var PAGE_SIZE = 12;          // photos affichées avant « Voir plus »
    var SLIDE_DELAY = 4000;      // durée d'une photo en diaporama (ms)
    var LEAVE_DELAY = 260;       // durée de sortie des photos lors d'un changement d'album (ms)

    var data = window.DN_ALBUM || { albums: [], photos: [] };
    var albums = data.albums || [];
    var photos = (data.photos || []).filter(function (p) { return p && p.src; });

    var labels = {};
    albums.forEach(function (a) { labels[a.id] = a.label; });

    var $win = $(window);
    var $filters = $('#dnAlbumFilters');
    var $grid = $('#dnAlbumGrid');
    var $count = $('#dnAlbumCount');
    var $empty = $('#dnAlbumEmpty');
    var $more = $('#dnLoadMore');
    var $slideBtn = $('#dnSlideshowBtn');

    var current = '*';
    var shown = PAGE_SIZE;
    var slideTimer = null;
    var countValue = 0;

    // ---------- Template : préchargeur, menu, en-tête collant, parallaxe ----------
    $win.on('load', function () {
        $('#preloader').fadeOut(600, function () { $(this).remove(); });
    });
    if ($.fn.classyNav) { $('#alimeNav').classyNav(); }
    $win.on('scroll', function () {
        $('.main-header-area').toggleClass('sticky', $win.scrollTop() > 0);
    });
    if ($.fn.jarallax && !reducedMotion()) { $('.jarallax').jarallax({ speed: 0.5 }); }
    $('#dnYear').text(new Date().getFullYear());

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function filtered() {
        return current === '*' ? photos : photos.filter(function (p) { return p.album === current; });
    }

    function caption(p) {
        return [p.title, labels[p.album]].filter(Boolean).join(' · ');
    }

    // ---------- Filtres + pastille qui glisse sous le filtre actif ----------
    var $pill = $('<span class="dn-filter-pill" aria-hidden="true">');

    function renderFilters() {
        var counts = {};
        photos.forEach(function (p) { counts[p.album] = (counts[p.album] || 0) + 1; });

        var buttons = [{ id: '*', label: 'Tout', n: photos.length }].concat(
            albums.filter(function (a) { return counts[a.id]; })
                  .map(function (a) { return { id: a.id, label: a.label, n: counts[a.id] }; })
        );

        $filters.empty().append($pill);
        buttons.forEach(function (b) {
            $('<button type="button" class="btn">')
                .attr('data-filter', b.id)
                .text(b.label)
                .append($('<sup class="dn-filter-n">').text(b.n))
                .appendTo($filters);
        });
        markActive();
    }

    function markActive() {
        $filters.find('button').each(function () {
            var on = $(this).attr('data-filter') === current;
            $(this).toggleClass('active', on).attr('aria-pressed', on);
        });
        movePill();
    }

    function movePill() {
        var btn = $filters.find('button.active')[0];
        if (!btn) return;
        $pill.css({
            width: btn.offsetWidth + 24,
            height: btn.offsetHeight + 10,
            transform: 'translate(' + (btn.offsetLeft - 12) + 'px,' + (btn.offsetTop - 5) + 'px)'
        });
    }
    $win.on('resize load', movePill);

    $filters.on('click', 'button', function () {
        var next = $(this).attr('data-filter');
        if (next === current) return;
        current = next;
        shown = PAGE_SIZE;
        if (history.replaceState) { history.replaceState(null, '', current === '*' ? location.pathname : '#' + current); }
        markActive();

        // Les photos actuelles s'effacent avant que le nouvel album n'apparaisse.
        var $old = $grid.children();
        if (!$old.length || reducedMotion()) { renderGrid(); return; }
        $old.addClass('is-leaving');
        setTimeout(function () { renderGrid(); }, LEAVE_DELAY);
    });

    // ---------- Grille ----------
    function buildItem(p, i, delayIndex) {
        var $item = $('<figure class="dn-album-item">').css('animation-delay', delayIndex * 70 + 'ms');
        var $link = $('<a class="single-portfolio-content" href="">')
            .attr('href', p.src)
            .attr('data-index', i)
            .attr('aria-label', 'Agrandir : ' + (p.title || 'photo'));
        $('<img loading="lazy" decoding="async">').attr('src', p.src).attr('alt', p.title || '').appendTo($link);
        var $hover = $('<span class="hover-content"><span class="dn-zoom"><i class="bi bi-arrows-fullscreen"></i></span></span>');
        if (p.title) { $('<span class="dn-hover-title">').text(p.title).appendTo($hover); }
        $link.append($hover);
        $item.append($link);
        if (p.title || p.album) {
            $('<figcaption>').text(caption(p)).appendTo($item);
        }
        return $item;
    }

    // append = true : on ajoute seulement les nouvelles photos (« Voir plus »).
    function renderGrid(append) {
        var list = filtered();
        var from = append ? $grid.children().length : 0;
        if (!append) { $grid.empty(); }

        list.slice(from, shown).forEach(function (p, k) {
            $grid.append(buildItem(p, from + k, k));
        });

        countTo(list.length);
        $empty.prop('hidden', list.length > 0);
        $more.prop('hidden', shown >= list.length);
        $slideBtn.prop('disabled', list.length === 0);
    }

    // Compteur de photos qui défile jusqu'au nouveau total.
    function countTo(target) {
        var start = countValue;
        var t0 = null;
        countValue = target;
        function label(n) { return n + (n > 1 ? ' photos' : ' photo'); }
        if (reducedMotion() || start === target) { $count.text(label(target)); return; }
        (function step(now) {
            if (t0 === null) t0 = now;
            var p = Math.min((now - t0) / 700, 1);
            $count.text(label(Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)))));
            if (p < 1) requestAnimationFrame(step);
        })(performance.now());
    }

    $more.on('click', function () {
        shown += PAGE_SIZE;
        renderGrid(true);
    });

    // ---------- Visionneuse + diaporama ----------
    function restartProgress() {
        var bar = $('.dn-mfp-progress span')[0];
        if (!bar) return;
        bar.style.animation = 'none';
        void bar.offsetWidth; // relance l'animation CSS
        bar.style.animation = '';
    }

    function stopSlideshow() {
        clearInterval(slideTimer);
        slideTimer = null;
        $('.dn-mfp').removeClass('is-sliding');
        $('.dn-mfp-play').html('<i class="bi bi-play-fill"></i>').attr('aria-label', 'Lancer le diaporama');
    }

    function startSlideshow() {
        clearInterval(slideTimer);
        slideTimer = setInterval(function () { $.magnificPopup.instance.next(); }, SLIDE_DELAY);
        $('.dn-mfp').addClass('is-sliding');
        restartProgress();
        $('.dn-mfp-play').html('<i class="bi bi-pause-fill"></i>').attr('aria-label', 'Mettre en pause');
    }

    function openViewer(index, autoplay) {
        var list = filtered();
        if (!list.length) { return; }

        $.magnificPopup.open({
            type: 'image',
            items: list.map(function (p) { return { src: p.src, title: caption(p) }; }),
            gallery: { enabled: true, preload: [0, 2], navigateByImgClick: true, tPrev: 'Précédente', tNext: 'Suivante', tCounter: '%curr% / %total%' },
            image: { tError: 'Impossible de charger <a href="%url%">cette photo</a>.' },
            tClose: 'Fermer (Échap)',
            tLoading: 'Chargement…',
            mainClass: 'dn-mfp',
            removalDelay: reducedMotion() ? 0 : 350,
            closeOnContentClick: false,
            callbacks: {
                open: function () {
                    var $play = $('<button type="button" class="dn-mfp-play">').on('click', function () {
                        slideTimer ? stopSlideshow() : startSlideshow();
                    });
                    this.container.append($play, '<div class="dn-mfp-progress" aria-hidden="true"><span></span></div>');
                    autoplay ? startSlideshow() : stopSlideshow();
                },
                // Navigation manuelle pendant le diaporama : on repart pour un tour complet.
                change: function () { if (slideTimer) { startSlideshow(); } },
                close: stopSlideshow
            }
        }, index);
    }

    $grid.on('click', 'a.single-portfolio-content', function (e) {
        e.preventDefault();
        openViewer(parseInt($(this).attr('data-index'), 10), false);
    });

    $slideBtn.on('click', function () { openViewer(0, true); });

    // ---------- Démarrage ----------
    var fromHash = decodeURIComponent((location.hash || '').slice(1));
    if (fromHash && labels[fromHash]) { current = fromHash; }

    renderFilters();
    renderGrid();

})(jQuery);

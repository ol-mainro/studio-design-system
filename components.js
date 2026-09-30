/**
 * Clap ! Studio — Composants interactifs
 * Visionneuse en surimpression (Lightbox) pour planches de BD et illustrations.
 * Zero-dépendance, accessible, réactif.
 */

(function () {
  'use strict';

  var currentGroup = [];
  var currentIndex = -1;
  var lightboxEl = null;
  var previousActiveElement = null;

  /**
   * Crée la structure DOM de la lightbox si elle n'existe pas encore
   */
  function ensureLightboxDOM() {
    if (lightboxEl) return lightboxEl;

    // Vérifier si un conteneur existe déjà dans le document
    var existing = document.querySelector('.cl-lightbox');
    if (existing) {
      lightboxEl = existing;
      bindLightboxControls(lightboxEl);
      return lightboxEl;
    }

    var div = document.createElement('div');
    div.className = 'cl-lightbox';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-modal', 'true');
    div.setAttribute('aria-label', 'Visionneuse de planche et illustration');
    div.setAttribute('tabindex', '-1');

    div.innerHTML = [
      '<div class="cl-lightbox__backdrop" data-cl-close></div>',
      '<div class="cl-lightbox__dialog">',
      '  <header class="cl-lightbox__header">',
      '    <div class="cl-lightbox__meta">',
      '      <span class="cl-lightbox__counter" data-cl-counter>Planche 1 / 1</span>',
      '      <h2 class="cl-lightbox__title" data-cl-title>Planche</h2>',
      '    </div>',
      '    <button type="button" class="cl-lightbox__close" aria-label="Fermer la visionneuse" data-cl-close>',
      '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      '    </button>',
      '  </header>',
      '  <div class="cl-lightbox__stage">',
      '    <button type="button" class="cl-lightbox__nav cl-lightbox__nav--prev" aria-label="Planche précédente" data-cl-prev>',
      '      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
      '    </button>',
      '    <div class="cl-lightbox__figure">',
      '      <img class="cl-lightbox__img" data-cl-img src="" alt="" />',
      '    </div>',
      '    <button type="button" class="cl-lightbox__nav cl-lightbox__nav--next" aria-label="Planche suivante" data-cl-next>',
      '      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
      '    </button>',
      '  </div>',
      '  <footer class="cl-lightbox__footer">',
      '    <p class="cl-lightbox__caption" data-cl-caption></p>',
      '    <span class="cl-lightbox__credit" data-cl-credit></span>',
      '  </footer>',
      '</div>'
    ].join('\n');

    document.body.appendChild(div);
    lightboxEl = div;
    bindLightboxControls(lightboxEl);
    return lightboxEl;
  }

  function bindLightboxControls(lb) {
    // Boutons de fermeture (croix et backdrop)
    lb.querySelectorAll('[data-cl-close]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        close();
      });
    });

    // Précédent / Suivant
    var prevBtn = lb.querySelector('[data-cl-prev]');
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        prev();
      });
    }

    var nextBtn = lb.querySelector('[data-cl-next]');
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        next();
      });
    }

    // Clic sur l'image pour passer à la suivante
    var imgEl = lb.querySelector('[data-cl-img]');
    if (imgEl) {
      imgEl.addEventListener('click', function () {
        if (currentGroup.length > 1) next();
      });
    }
  }

  /**
   * Ouvre la lightbox sur une planche donnée
   */
  function openItem(item, group) {
    previousActiveElement = document.activeElement;
    currentGroup = group && group.length ? group : [item];
    currentIndex = currentGroup.indexOf(item);
    if (currentIndex === -1) currentIndex = 0;

    ensureLightboxDOM();
    updateView();

    lightboxEl.classList.add('cl-lightbox--active');
    document.body.classList.add('cl-lightbox-open');

    // Focus sur la modale pour l'accessibilité
    lightboxEl.focus();
  }

  /**
   * Met à jour le contenu de la visionneuse selon l'élément courant
   */
  function updateView() {
    if (!lightboxEl || currentIndex < 0 || currentIndex >= currentGroup.length) return;

    var item = currentGroup[currentIndex];
    var data = extractItemData(item);

    var img = lightboxEl.querySelector('[data-cl-img]');
    var title = lightboxEl.querySelector('[data-cl-title]');
    var counter = lightboxEl.querySelector('[data-cl-counter]');
    var caption = lightboxEl.querySelector('[data-cl-caption]');
    var credit = lightboxEl.querySelector('[data-cl-credit]');
    var prevBtn = lightboxEl.querySelector('[data-cl-prev]');
    var nextBtn = lightboxEl.querySelector('[data-cl-next]');

    if (img) {
      img.src = data.src;
      img.alt = data.title || 'Planche grand format';
    }

    if (title) title.textContent = data.title;
    if (caption) {
      caption.textContent = data.caption;
      caption.style.display = data.caption ? '' : 'none';
    }
    if (credit) {
      credit.textContent = data.credit;
      credit.style.display = data.credit ? '' : 'none';
    }
    if (counter) {
      var badgeText = data.badge ? data.badge + ' · ' : '';
      counter.textContent = badgeText + (currentIndex + 1) + ' / ' + currentGroup.length;
    }

    // Gestion de la visibilité des flèches si un seul visuel
    var hasMultiple = currentGroup.length > 1;
    if (prevBtn) prevBtn.style.display = hasMultiple ? '' : 'none';
    if (nextBtn) nextBtn.style.display = hasMultiple ? '' : 'none';
  }

  /**
   * Extrait les informations (src, titre, description, crédit, badge) d'un élément DOM
   */
  function extractItemData(el) {
    var src = el.getAttribute('data-src') || el.getAttribute('data-cl-src');
    if (!src) {
      var innerImg = el.querySelector('img');
      if (innerImg) src = innerImg.getAttribute('src');
    }
    if (!src && el.tagName === 'A') {
      var href = el.getAttribute('href');
      if (href && !href.startsWith('#')) src = href;
    }

    var title = el.getAttribute('data-title') || el.getAttribute('data-cl-title');
    if (!title) {
      var titleEl = el.querySelector('.cl-board-card__title, .cl-board-row__title, [data-cl-title]');
      if (titleEl) title = titleEl.textContent.trim();
    }

    var caption = el.getAttribute('data-caption') || el.getAttribute('data-cl-caption');
    if (!caption) {
      var descEl = el.querySelector('.cl-board-card__desc, .cl-board-row__desc, [data-cl-desc]');
      if (descEl) caption = descEl.textContent.trim();
    }

    var credit = el.getAttribute('data-credit') || el.getAttribute('data-author');
    var badge = el.getAttribute('data-badge');
    if (!badge) {
      var badgeEl = el.querySelector('.cl-board-card__badge, .cl-board-row__tag, .cl-board-row__num');
      if (badgeEl) badge = badgeEl.textContent.trim();
    }

    return {
      src: src || '',
      title: title || 'Planche',
      caption: caption || '',
      credit: credit || '',
      badge: badge || ''
    };
  }

  function close() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('cl-lightbox--active');
    document.body.classList.remove('cl-lightbox-open');

    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  function next() {
    if (currentGroup.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentGroup.length;
    updateView();
  }

  function prev() {
    if (currentGroup.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
    updateView();
  }

  /**
   * Initialise les déclencheurs de visionneuse sur la page
   */
  function init() {
    ensureLightboxDOM();

    // Raccourcis clavier (Échap, Gauche, Droite)
    document.addEventListener('keydown', function (e) {
      if (!lightboxEl || !lightboxEl.classList.contains('cl-lightbox--active')) return;

      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        e.preventDefault();
        prev();
      }
    });

    // Liaison automatique des éléments de galerie et de liste
    var containers = document.querySelectorAll('.cl-board-gallery, .cl-board-list, [data-cl-gallery]');
    if (containers.length > 0) {
      containers.forEach(function (container) {
        var items = Array.from(container.querySelectorAll('.cl-board-card, .cl-board-row, [data-cl-lightbox-item]'));
        items.forEach(function (item) {
          bindTrigger(item, items);
        });
      });
    }

    // Éléments indépendants avec data-cl-lightbox
    var standalone = document.querySelectorAll('[data-cl-lightbox]:not(.cl-board-card):not(.cl-board-row)');
    standalone.forEach(function (el) {
      bindTrigger(el, [el]);
    });
  }

  function bindTrigger(el, group) {
    el.style.cursor = 'pointer';
    if (!el.hasAttribute('tabindex') && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
      el.setAttribute('tabindex', '0');
    }
    if (!el.hasAttribute('role') && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
      el.setAttribute('role', 'button');
    }

    var triggerHandler = function (e) {
      // Éviter d'ouvrir si clic sur un lien externe explicite à l'intérieur
      var targetLink = e.target.closest('a');
      if (targetLink && targetLink !== el && targetLink.getAttribute('href') && !targetLink.getAttribute('href').startsWith('#')) {
        return;
      }
      e.preventDefault();
      openItem(el, group);
    };

    el.addEventListener('click', triggerHandler);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerHandler(e);
      }
    });
  }

  // Export global
  window.ClapLightbox = {
    init: init,
    open: function (itemOrConfig) {
      if (itemOrConfig instanceof HTMLElement) {
        openItem(itemOrConfig, [itemOrConfig]);
      } else if (typeof itemOrConfig === 'object') {
        var dummy = document.createElement('div');
        if (itemOrConfig.src) dummy.setAttribute('data-src', itemOrConfig.src);
        if (itemOrConfig.title) dummy.setAttribute('data-title', itemOrConfig.title);
        if (itemOrConfig.caption) dummy.setAttribute('data-caption', itemOrConfig.caption);
        if (itemOrConfig.credit) dummy.setAttribute('data-credit', itemOrConfig.credit);
        if (itemOrConfig.badge) dummy.setAttribute('data-badge', itemOrConfig.badge);
        openItem(dummy, [dummy]);
      }
    },
    close: close,
    next: next,
    prev: prev
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

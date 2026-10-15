/**
 * Clap ! Studio — Composants interactifs
 *
 * Zéro dépendance (sauf QRious, facultatif, pour ClapQR). Chaque module
 * s'accroche à des attributs data-cl-* : le HTML décrit, le script anime.
 *
 *   ClapLightbox  visionneuse de planches / illustrations
 *   ClapModal     modale générique (focus piégé, Échap, retour du focus)
 *   ClapToast     notification éphémère
 *   ClapAudio     playlist audio + lecteur flottant
 *   ClapViewer    visionneuse de chapitre (média + récit), liée à ClapAudio
 *   ClapFullscreen plein écran / mode borne
 *   ClapVideo     lecteur vidéo à contrôles intégrés
 *   ClapQR        QR code de partage (rendu, carte PNG, impression…)
 *   Clap.icons    sprite d'icônes SVG (<use href="#cl-i-play">)
 *
 * Tout est aussi exposé sous window.Clap.
 */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════════════
     Utilitaires
     ════════════════════════════════════════════════════════════════════ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function resolve(elOrSel) { return typeof elOrSel === 'string' ? $(elOrSel) : elOrSel; }

  function formatTime(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function escapeHTML(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Texte brut → paragraphes HTML ; **gras** et *italique* reconnus. */
  function richText(text) {
    return String(text || '').split(/\n{2,}/).map(function (p) { return p.trim(); }).filter(Boolean).map(function (p) {
      var html = escapeHTML(p)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      return '<p>' + html + '</p>';
    }).join('');
  }

  /** Lit un bloc <script type="application/json"> par sélecteur. */
  function readJSON(sel) {
    var el = $(sel);
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { console.error('[Clap] JSON invalide dans', sel, e); return null; }
  }

  function isTyping(target) {
    return !!target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable);
  }

  function emit(name, detail, target) {
    (target || document).dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
  }

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

  /** Garde Tab / Maj+Tab à l'intérieur de container. */
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    var items = $$(FOCUSABLE, container).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) { e.preventDefault(); container.focus(); return; }
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === container)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function setPlaying(el, on) { if (el) el.setAttribute('data-playing', on ? 'true' : 'false'); }

  /** Classe BEM « --active » dérivée de la première classe de l'élément. */
  function setActive(el, on) {
    var base = el.classList[0];
    if (base) el.classList.toggle(base + '--active', on);
    if (on) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
  }

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ════════════════════════════════════════════════════════════════════
     Icônes — sprite SVG injecté une fois. Usage :
       <svg class="cl-ico" aria-hidden="true"><use href="#cl-i-play"/></svg>
     Trait 2 px, couleur du texte (style Lucide). Liste : Clap.icons.names
     ════════════════════════════════════════════════════════════════════ */

  var Icons = (function () {
    var S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    var F = 'fill="currentColor" stroke="none"';
    var set = {
      play: [F, '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.4-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/>'],
      pause: [F, '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>'],
      prev: [S, '<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>'],
      next: [S, '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>'],
      volume: [S, '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>'],
      mute: [S, '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>'],
      book: [S, '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'],
      download: [S, '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'],
      close: [S, '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'],
      'chevron-left': [S, '<polyline points="15 18 9 12 15 6"/>'],
      'chevron-right': [S, '<polyline points="9 18 15 12 9 6"/>'],
      'arrow-left': [S, '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'],
      'arrow-right': [S, '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'],
      image: [S, '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'],
      expand: [S, '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>'],
      list: [S, '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'],
      sparkles: [S, '<path d="M12 3l1.9 5.8L20 10.5l-6.1 1.7L12 18l-1.9-5.8L4 10.5l6.1-1.7z"/><path d="M19 3v4M17 5h4"/>'],
      check: [S, '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'],
      qr: [S, '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM17 17h4v4h-4zM21 14v.01M14 21v.01"/>'],
      share: [S, '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>'],
      copy: [S, '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'],
      printer: [S, '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'],
      music: [S, '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'],
      headphones: [S, '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>']
    };

    function inject() {
      if (document.getElementById('cl-icons') || !document.querySelector('use[href^="#cl-i-"]')) return;
      var html = '<svg id="cl-icons" xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' +
        Object.keys(set).map(function (k) {
          return '<symbol id="cl-i-' + k + '" viewBox="0 0 24 24" ' + set[k][0] + '>' + set[k][1] + '</symbol>';
        }).join('') + '</svg>';
      document.body.insertAdjacentHTML('afterbegin', html);
    }

    return { inject: inject, names: Object.keys(set) };
  })();

  /* ════════════════════════════════════════════════════════════════════
     ClapLightbox — planches de BD & illustrations
     ════════════════════════════════════════════════════════════════════ */

  var Lightbox = (function () {
    var currentGroup = [];
    var currentIndex = -1;
    var lightboxEl = null;
    var previousActiveElement = null;

    function ensureLightboxDOM() {
      if (lightboxEl) return lightboxEl;

      var existing = $('.cl-lightbox');
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
      $$('[data-cl-close]', lb).forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });
      var prevBtn = $('[data-cl-prev]', lb);
      if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); });
      var nextBtn = $('[data-cl-next]', lb);
      if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); });
      // Clic sur l'image : planche suivante
      var imgEl = $('[data-cl-img]', lb);
      if (imgEl) imgEl.addEventListener('click', function () { if (currentGroup.length > 1) next(); });
    }

    function openItem(item, group) {
      previousActiveElement = document.activeElement;
      currentGroup = group && group.length ? group : [item];
      currentIndex = currentGroup.indexOf(item);
      if (currentIndex === -1) currentIndex = 0;

      ensureLightboxDOM();
      updateView();

      lightboxEl.classList.add('cl-lightbox--active');
      document.body.classList.add('cl-lightbox-open');
      lightboxEl.focus();
    }

    function updateView() {
      if (!lightboxEl || currentIndex < 0 || currentIndex >= currentGroup.length) return;

      var data = extractItemData(currentGroup[currentIndex]);
      var img = $('[data-cl-img]', lightboxEl);
      var title = $('[data-cl-title]', lightboxEl);
      var counter = $('[data-cl-counter]', lightboxEl);
      var caption = $('[data-cl-caption]', lightboxEl);
      var credit = $('[data-cl-credit]', lightboxEl);
      var prevBtn = $('[data-cl-prev]', lightboxEl);
      var nextBtn = $('[data-cl-next]', lightboxEl);

      if (img) { img.src = data.src; img.alt = data.title || 'Planche grand format'; }
      if (title) title.textContent = data.title;
      if (caption) { caption.textContent = data.caption; caption.style.display = data.caption ? '' : 'none'; }
      if (credit) { credit.textContent = data.credit; credit.style.display = data.credit ? '' : 'none'; }
      if (counter) counter.textContent = (data.badge ? data.badge + ' · ' : '') + (currentIndex + 1) + ' / ' + currentGroup.length;

      var hasMultiple = currentGroup.length > 1;
      if (prevBtn) prevBtn.style.display = hasMultiple ? '' : 'none';
      if (nextBtn) nextBtn.style.display = hasMultiple ? '' : 'none';
    }

    /** src, titre, légende, crédit, badge d'un élément déclencheur. */
    function extractItemData(el) {
      var src = el.getAttribute('data-src') || el.getAttribute('data-cl-src');
      if (!src) { var innerImg = $('img', el); if (innerImg) src = innerImg.getAttribute('src'); }
      if (!src && el.tagName === 'A') {
        var href = el.getAttribute('href');
        if (href && href.charAt(0) !== '#') src = href;
      }

      var title = el.getAttribute('data-title') || el.getAttribute('data-cl-title');
      if (!title) { var t = $('.cl-board-card__title, .cl-board-row__title, [data-cl-title]', el); if (t) title = t.textContent.trim(); }

      var caption = el.getAttribute('data-caption') || el.getAttribute('data-cl-caption');
      if (!caption) { var d = $('.cl-board-card__desc, .cl-board-row__desc, [data-cl-desc]', el); if (d) caption = d.textContent.trim(); }

      var credit = el.getAttribute('data-credit') || el.getAttribute('data-author');
      var badge = el.getAttribute('data-badge');
      if (!badge) { var b = $('.cl-board-card__badge, .cl-board-row__tag, .cl-board-row__num', el); if (b) badge = b.textContent.trim(); }

      return { src: src || '', title: title || 'Planche', caption: caption || '', credit: credit || '', badge: badge || '' };
    }

    function isOpen() { return !!lightboxEl && lightboxEl.classList.contains('cl-lightbox--active'); }

    function close() {
      if (!lightboxEl) return;
      lightboxEl.classList.remove('cl-lightbox--active');
      document.body.classList.remove('cl-lightbox-open');
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') previousActiveElement.focus();
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

    function bindTrigger(el, group) {
      if (el.__clLightbox) return;
      el.__clLightbox = true;
      el.style.cursor = 'pointer';
      if (!el.hasAttribute('tabindex') && el.tagName !== 'BUTTON' && el.tagName !== 'A') el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role') && el.tagName !== 'BUTTON' && el.tagName !== 'A') el.setAttribute('role', 'button');

      var handler = function (e) {
        // Un lien externe explicite à l'intérieur garde son comportement
        var link = e.target.closest('a');
        if (link && link !== el && link.getAttribute('href') && link.getAttribute('href').charAt(0) !== '#') return;
        e.preventDefault();
        openItem(el, group);
      };
      el.addEventListener('click', handler);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(e); }
      });
    }

    function init() {
      if (!$('.cl-board-gallery, .cl-board-list, [data-cl-gallery], [data-cl-lightbox], .cl-lightbox')) return;
      ensureLightboxDOM();

      document.addEventListener('keydown', function (e) {
        if (!isOpen()) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
        else trapFocus(lightboxEl, e);
      });

      $$('.cl-board-gallery, .cl-board-list, [data-cl-gallery]').forEach(function (container) {
        var items = $$('.cl-board-card, .cl-board-row, [data-cl-lightbox-item]', container);
        items.forEach(function (item) { bindTrigger(item, items); });
      });
      $$('[data-cl-lightbox]:not(.cl-board-card):not(.cl-board-row)').forEach(function (el) { bindTrigger(el, [el]); });
    }

    return {
      init: init,
      open: function (itemOrConfig) {
        if (itemOrConfig instanceof HTMLElement) {
          openItem(itemOrConfig, [itemOrConfig]);
        } else if (itemOrConfig && typeof itemOrConfig === 'object') {
          var dummy = document.createElement('div');
          ['src', 'title', 'caption', 'credit', 'badge'].forEach(function (k) {
            if (itemOrConfig[k]) dummy.setAttribute('data-' + k, itemOrConfig[k]);
          });
          openItem(dummy, [dummy]);
        }
      },
      close: close,
      next: next,
      prev: prev
    };
  })();

  /* ════════════════════════════════════════════════════════════════════
     ClapModal — <div class="cl-modal" id="…">, ouverte par
     [data-cl-modal-open="#id"], fermée par [data-cl-modal-close] ou Échap.
     ════════════════════════════════════════════════════════════════════ */

  var Modal = (function () {
    var stack = [];   // modales ouvertes, la dernière au-dessus

    function open(target, opener) {
      var el = resolve(target);
      if (!el || el.classList.contains('cl-modal--open')) return;
      el.__clReturnFocus = opener || document.activeElement;
      el.classList.add('cl-modal--open');
      el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('cl-modal-open');
      stack.push(el);
      var dialog = $('.cl-modal__dialog', el) || el;
      if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
      var first = $('[autofocus]', el) || $('.cl-modal__close', el) || dialog;
      setTimeout(function () { first.focus({ preventScroll: true }); }, 30);
      emit('cl:modalopen', { modal: el }, el);
    }

    function close(target) {
      var el = resolve(target) || stack[stack.length - 1];
      if (!el || !el.classList.contains('cl-modal--open')) return;
      el.classList.remove('cl-modal--open');
      el.setAttribute('aria-hidden', 'true');
      stack = stack.filter(function (m) { return m !== el; });
      if (!stack.length) document.body.classList.remove('cl-modal-open');
      var back = el.__clReturnFocus;
      if (back && typeof back.focus === 'function') back.focus({ preventScroll: true });
      emit('cl:modalclose', { modal: el }, el);
    }

    function top() { return stack[stack.length - 1] || null; }

    function init() {
      document.addEventListener('click', function (e) {
        var opener = e.target.closest('[data-cl-modal-open]');
        if (opener) { e.preventDefault(); open(opener.getAttribute('data-cl-modal-open'), opener); return; }
        var closer = e.target.closest('[data-cl-modal-close]');
        if (closer) { e.preventDefault(); close(closer.closest('.cl-modal')); }
      });
      document.addEventListener('keydown', function (e) {
        var m = top();
        if (!m) return;
        if (e.key === 'Escape') { e.preventDefault(); close(m); }
        else trapFocus($('.cl-modal__dialog', m) || m, e);
      });
    }

    return { init: init, open: open, close: close, top: top };
  })();

  /* ════════════════════════════════════════════════════════════════════
     ClapToast — ClapToast.show('Message', 3000)
     ════════════════════════════════════════════════════════════════════ */

  var Toast = (function () {
    var el = null, timer = null;
    function show(message, ms) {
      if (!el) {
        el = $('.cl-toast') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'cl-toast' }));
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
      }
      el.textContent = message;
      el.classList.add('cl-toast--show');
      clearTimeout(timer);
      timer = setTimeout(function () { el.classList.remove('cl-toast--show'); }, ms || 3200);
    }
    return { show: show };
  })();

  /* ════════════════════════════════════════════════════════════════════
     ClapAudio — une playlist, un seul <audio> pour toute la page.

     ClapAudio.init({ tracks: [{ title, src, fallback? }, …] })
     ou <script type="application/json" data-cl-tracks>[…]</script>.

     Attributs reconnus partout dans la page :
       [data-cl-track="i"]        rangée / carte de la piste i : clic = lecture
                                  ou pause si c'est déjà elle ; reçoit
                                  <classe>--active quand elle est courante
       [data-cl-play="i"]         bouton lecture/pause de la piste i
       [data-cl-play-all]         lecture/pause globale (reprend la courante)
       [data-cl-action="toggle|prev|next|mute"]
       [data-cl-seek]             <input type=range> de progression
       [data-cl-volume]           <input type=range> de volume (0…1)
       [data-cl-time="current|total"]
       [data-cl-now="title"]      reçoit le titre de la piste courante
     Tout bouton concerné reçoit data-playing="true|false" (bascule d'icône).
     Événements : cl:trackchange, cl:play, cl:pause (detail.index, .track).
     ════════════════════════════════════════════════════════════════════ */

  var Audio = (function () {
    var audio = null, tracks = [], index = -1, seeking = false, lastVolume = 1;
    var opts = { autoAdvance: true };

    function current() { return tracks[index] || null; }
    function isPlaying() { return !!audio && !audio.paused && !audio.ended; }

    function load(i) {
      var t = tracks[i];
      if (!t) return false;
      index = i;
      t.__triedFallback = false;
      audio.src = t.src;
      audio.load();
      sync();
      emit('cl:trackchange', { index: i, track: t });
      return true;
    }

    function play(i) {
      if (typeof i === 'number' && i !== index) load(i);
      else if (index < 0) load(0);
      var p = audio.play();
      if (p && p.catch) p.catch(function (err) { if (err.name !== 'AbortError') console.warn('[ClapAudio]', err); });
    }

    function pause() { audio.pause(); }
    function toggle(i) {
      if (typeof i === 'number' && i !== index) { play(i); return; }
      if (isPlaying()) pause(); else play();
    }
    function next() { if (index < tracks.length - 1) play(index + 1); }
    function prev() {
      // au-delà de 3 s, « précédent » revient au début de la piste
      if (audio.currentTime > 3 || index <= 0) { audio.currentTime = 0; return; }
      play(index - 1);
    }
    function mute() {
      if (audio.volume > 0) { lastVolume = audio.volume; audio.volume = 0; }
      else audio.volume = lastVolume || 1;
    }

    function sync() {
      var playing = isPlaying();
      $$('[data-cl-track]').forEach(function (el) {
        var on = +el.getAttribute('data-cl-track') === index;
        setActive(el, on);
        setPlaying(el, on && playing);
      });
      $$('[data-cl-play]').forEach(function (el) {
        var on = +el.getAttribute('data-cl-play') === index && playing;
        setPlaying(el, on);
        el.setAttribute('aria-label', on ? 'Pause' : 'Écouter');
      });
      $$('[data-cl-play-all], [data-cl-action="toggle"], .cl-player').forEach(function (el) { setPlaying(el, playing); });
      $$('[data-cl-action="toggle"]').forEach(function (el) { el.setAttribute('aria-label', playing ? 'Pause' : 'Lecture'); });
      $$('[data-cl-action="prev"]').forEach(function (el) { el.disabled = index <= 0; });
      $$('[data-cl-action="next"]').forEach(function (el) { el.disabled = index >= tracks.length - 1; });
      $$('[data-cl-action="mute"]').forEach(function (el) {
        var muted = audio.volume === 0;
        el.setAttribute('aria-pressed', muted ? 'true' : 'false');
        el.setAttribute('aria-label', muted ? 'Activer le son' : 'Couper le son');
      });
      var t = current();
      $$('[data-cl-now="title"]').forEach(function (el) { el.textContent = t ? t.title : ''; });
    }

    function syncTime() {
      var cur = audio.currentTime || 0, dur = audio.duration || 0;
      $$('[data-cl-time="current"]').forEach(function (el) { el.textContent = formatTime(cur); });
      $$('[data-cl-time="total"]').forEach(function (el) { el.textContent = dur ? formatTime(dur) : '--:--'; });
      if (!seeking) $$('[data-cl-seek]').forEach(function (el) { el.max = dur || 100; el.value = cur; });
    }

    function onError() {
      var t = current();
      if (t && t.fallback && !t.__triedFallback) {
        t.__triedFallback = true;
        Toast.show('Flux distant indisponible — lecture de la copie locale.');
        audio.src = t.fallback;
        audio.load();
        play();
      } else if (t) {
        Toast.show('Impossible de lire « ' + t.title + ' ».');
      }
    }

    function bind() {
      document.addEventListener('click', function (e) {
        var el;
        if ((el = e.target.closest('[data-cl-play]'))) { e.preventDefault(); e.stopPropagation(); toggle(+el.getAttribute('data-cl-play')); return; }
        if ((el = e.target.closest('[data-cl-play-all]'))) { e.preventDefault(); toggle(); return; }
        if ((el = e.target.closest('[data-cl-action]'))) {
          var a = el.getAttribute('data-cl-action');
          if (a === 'toggle') toggle(); else if (a === 'next') next(); else if (a === 'prev') prev(); else if (a === 'mute') { mute(); sync(); }
          return;
        }
        // Une rangée entière est cliquable, sauf ses boutons et liens
        if ((el = e.target.closest('[data-cl-track]')) && !e.target.closest('button, a, input, [data-cl-viewer-open]')) {
          toggle(+el.getAttribute('data-cl-track'));
        }
      });

      document.addEventListener('keydown', function (e) {
        // Entrée / Espace sur une rangée focusable
        var row = e.target.closest && e.target.closest('[data-cl-track]');
        if (row && e.target === row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(+row.getAttribute('data-cl-track')); return; }
        // Espace global = lecture/pause (hors champ, bouton, lecteur vidéo)
        if (e.key === ' ' && !isTyping(e.target) && !e.target.closest('button, a, [data-cl-vplayer], .cl-lightbox')) {
          e.preventDefault(); toggle();
        }
      });

      $$('[data-cl-seek]').forEach(function (el) {
        el.addEventListener('input', function () { seeking = true; $$('[data-cl-time="current"]').forEach(function (t) { t.textContent = formatTime(+el.value); }); });
        el.addEventListener('change', function () { audio.currentTime = +el.value; seeking = false; });
      });
      $$('[data-cl-volume]').forEach(function (el) {
        el.addEventListener('input', function () { audio.volume = +el.value; if (+el.value > 0) lastVolume = +el.value; sync(); });
      });
      $$('[data-cl-track]').forEach(function (el) {
        if (!el.hasAttribute('tabindex') && !/^(A|BUTTON)$/.test(el.tagName)) el.setAttribute('tabindex', '0');
      });

      audio.addEventListener('play', function () { sync(); emit('cl:play', { index: index, track: current() }); });
      audio.addEventListener('pause', function () { sync(); emit('cl:pause', { index: index, track: current() }); });
      audio.addEventListener('timeupdate', syncTime);
      audio.addEventListener('loadedmetadata', syncTime);
      audio.addEventListener('volumechange', function () { $$('[data-cl-volume]').forEach(function (el) { el.value = audio.volume; }); });
      audio.addEventListener('error', onError);
      audio.addEventListener('ended', function () {
        if (opts.autoAdvance && index < tracks.length - 1) play(index + 1); else sync();
      });
    }

    function init(options) {
      options = options || {};
      opts.autoAdvance = options.autoAdvance !== false;
      tracks = options.tracks || readJSON('[data-cl-tracks]') || [];
      if (!tracks.length) return null;
      if (!audio) {
        audio = document.createElement('audio');
        audio.preload = 'metadata';
        document.body.appendChild(audio);
        bind();
      }
      load(typeof options.start === 'number' ? options.start : 0);
      syncTime();
      return api;
    }

    var api = {
      init: init, play: play, pause: pause, toggle: toggle, next: next, prev: prev, mute: mute,
      get index() { return index; },
      get tracks() { return tracks; },
      get element() { return audio; },
      isPlaying: isPlaying
    };
    return api;
  })();

  /* ════════════════════════════════════════════════════════════════════
     ClapViewer — chapitre plein cadre : média à gauche, récit à droite.
     Vit dans une .cl-modal portant [data-cl-viewer]. Les données sont
     celles de ClapAudio : { title, subtitle, text, image, video, badge }.

       [data-cl-viewer-open="i"]   ouvre le chapitre i
       [data-cl-viewer-open]       (vide) ouvre la piste courante
     Dans la modale : [data-cl-viewer-img|video|title|subtitle|text|badge],
     [data-cl-viewer-prev|next], [data-cl-viewer-dots], [data-cl-viewer-play].
     Clavier : ← / → ; balayage tactile horizontal ≥ 50 px.
     ════════════════════════════════════════════════════════════════════ */

  var Viewer = (function () {
    var el = null, items = [], index = 0, follow = true;

    function field(name) { return $('[data-cl-viewer-' + name + ']', el); }

    function render() {
      var it = items[index];
      if (!it) return;
      var img = field('img'), vid = field('video');
      if (it.video && vid) {
        img && (img.hidden = true, img.removeAttribute('src'));
        vid.hidden = false;
        if (vid.getAttribute('src') !== it.video) { vid.src = it.video; vid.play().catch(function () {}); }
      } else if (img) {
        if (vid) { vid.pause(); vid.hidden = true; vid.removeAttribute('src'); }
        img.hidden = false;
        img.src = it.image || '';
        img.alt = it.alt || it.title || '';
      }
      var set = function (name, value, html) {
        var f = field(name);
        if (!f) return;
        if (html) f.innerHTML = value; else f.textContent = value || '';
        f.hidden = !value;
      };
      set('badge', it.badge || ('Chapitre ' + (index + 1)));
      set('title', it.title);
      set('subtitle', it.subtitle);
      set('text', richText(it.text || it.description), true);
      var story = $('.cl-viewer__story', el);
      if (story) story.scrollTop = 0;

      var prev = field('prev'), next = field('next');
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= items.length - 1;

      var dots = field('dots');
      if (dots) {
        if (dots.children.length !== items.length) {
          dots.innerHTML = items.map(function (x, i) {
            return '<button type="button" class="cl-stepper__dot" data-cl-viewer-goto="' + i + '" aria-label="Chapitre ' + (i + 1) + '"></button>';
          }).join('');
        }
        Array.prototype.forEach.call(dots.children, function (d, i) {
          d.classList.toggle('cl-stepper__dot--active', i === index);
          if (i === index) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
        });
      }
      var play = field('play');
      if (play) {
        play.setAttribute('data-cl-play', index);
        setPlaying(play, Audio.index === index && Audio.isPlaying());
      }
    }

    function go(i) {
      if (i < 0 || i >= items.length) return;
      index = i;
      render();
    }

    function open(i) {
      index = typeof i === 'number' ? i : Math.max(0, Audio.index);
      render();
      Modal.open(el);
    }

    function isOpen() { return !!el && el.classList.contains('cl-modal--open'); }

    function bindSwipe(zone) {
      var x0 = null, y0 = null;
      zone.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      zone.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
        x0 = null;
      });
    }

    function init(options) {
      options = options || {};
      el = resolve(options.el || '[data-cl-viewer]');
      if (!el) return null;
      items = options.items || Audio.tracks;
      follow = options.follow !== false;

      document.addEventListener('click', function (e) {
        var opener = e.target.closest('[data-cl-viewer-open]');
        if (opener) {
          e.preventDefault(); e.stopPropagation();
          var v = opener.getAttribute('data-cl-viewer-open');
          open(v === '' ? undefined : +v);
          return;
        }
        if (!isOpen()) return;
        if (e.target.closest('[data-cl-viewer-prev]')) go(index - 1);
        else if (e.target.closest('[data-cl-viewer-next]')) go(index + 1);
        var dot = e.target.closest('[data-cl-viewer-goto]');
        if (dot) go(+dot.getAttribute('data-cl-viewer-goto'));
      }, true);

      document.addEventListener('keydown', function (e) {
        if (!isOpen() || Modal.top() !== el) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      });

      bindSwipe(el);
      // la visionneuse suit le lecteur quand une nouvelle piste démarre
      document.addEventListener('cl:trackchange', function (e) { if (follow && isOpen()) go(e.detail.index); });
      document.addEventListener('cl:play', function () { if (isOpen()) render(); });
      document.addEventListener('cl:pause', function () { if (isOpen()) render(); });
      el.addEventListener('cl:modalclose', function () { var v = field('video'); if (v) v.pause(); });
      return { open: open, go: go, close: function () { Modal.close(el); } };
    }

    return { init: init, open: function (i) { open(i); } };
  })();

  /* ════════════════════════════════════════════════════════════════════
     ClapFullscreen — [data-cl-fullscreen] bascule le plein écran du
     document ; body.cl-kiosk tant qu'il est actif (mode borne).
     ════════════════════════════════════════════════════════════════════ */

  var Fullscreen = (function () {
    function toggle(target) {
      var t = target || document.documentElement;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (t.requestFullscreen) t.requestFullscreen().catch(function () { Toast.show('Plein écran indisponible sur cet appareil.'); });
    }
    function init() {
      document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cl-fullscreen]');
        if (b) { e.preventDefault(); toggle(); }
      });
      document.addEventListener('fullscreenchange', function () {
        var on = document.fullscreenElement === document.documentElement;
        document.body.classList.toggle('cl-kiosk', on);
        $$('[data-cl-fullscreen]').forEach(function (b) {
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          var label = b.getAttribute(on ? 'data-label-on' : 'data-label-off');
          if (label) b.textContent = label;
        });
      });
    }
    return { init: init, toggle: toggle };
  })();

  /* ════════════════════════════════════════════════════════════════════
     ClapVideo — <div class="cl-video cl-vplayer" data-cl-vplayer>
     Contrôles : [data-cl-v="play|mute|rate|fullscreen"], [data-cl-v-seek],
     [data-cl-v-volume], [data-cl-v-time="current|total"].
     Clavier (focus dans le lecteur) : Espace/K lecture, F plein écran,
     M muet, ← / → ±5 s. Barre masquée après 2,6 s d'inactivité.
     API : ClapVideo.get(el).load({ src, poster, autoplay })
     ════════════════════════════════════════════════════════════════════ */

  var Video = (function () {
    var RATES = [1, 1.25, 1.5, 0.75];

    function youtubeId(url) {
      var m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
      return m ? m[1] : null;
    }

    function create(root) {
      if (root.__clVideo) return root.__clVideo;
      var video = $('video', root);
      var frame = $('.cl-video__frame', root) || root;
      var seek = $('[data-cl-v-seek]', root), vol = $('[data-cl-v-volume]', root);
      var idleTimer = null, iframe = null;
      root.setAttribute('tabindex', root.getAttribute('tabindex') || '0');

      function ctl(name) { return $('[data-cl-v="' + name + '"]', root); }
      function fill(range, ratio) { if (range) range.style.setProperty('--cl-fill', (ratio * 100).toFixed(2) + '%'); }

      function sync() {
        var playing = !video.paused && !video.ended;
        setPlaying(root, playing);
        var p = ctl('play');
        if (p) { setPlaying(p, playing); p.setAttribute('aria-label', playing ? 'Pause' : 'Lecture'); }
        var m = ctl('mute');
        if (m) { m.setAttribute('aria-pressed', video.muted ? 'true' : 'false'); setPlaying(m, !video.muted); }
        var r = ctl('rate');
        if (r) r.textContent = video.playbackRate + '×';
        if (vol) { vol.value = video.muted ? 0 : video.volume; fill(vol, video.muted ? 0 : video.volume); }
        if (!playing) wake(true);
      }

      function syncTime() {
        var cur = video.currentTime || 0, dur = video.duration || 0;
        $$('[data-cl-v-time="current"]', root).forEach(function (el) { el.textContent = formatTime(cur); });
        $$('[data-cl-v-time="total"]', root).forEach(function (el) { el.textContent = dur ? formatTime(dur) : '--:--'; });
        if (seek && !seek.__dragging) { seek.max = dur || 100; seek.value = cur; fill(seek, dur ? cur / dur : 0); }
      }

      function toggle() { if (video.paused || video.ended) video.play().catch(function () {}); else video.pause(); }
      function fullscreen() {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (root.requestFullscreen) root.requestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      }

      function wake(stay) {
        root.classList.remove('cl-vplayer--idle');
        clearTimeout(idleTimer);
        if (!stay && !video.paused) idleTimer = setTimeout(function () { root.classList.add('cl-vplayer--idle'); }, 2600);
      }

      function load(o) {
        o = o || {};
        root.classList.remove('cl-vplayer--error', 'cl-vplayer--buffering');
        var yt = youtubeId(o.src);
        if (yt) {
          video.pause(); video.removeAttribute('src'); video.hidden = true;
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
            iframe.setAttribute('allowfullscreen', '');
            frame.appendChild(iframe);
          }
          iframe.title = o.title || 'Vidéo';
          iframe.src = 'https://www.youtube-nocookie.com/embed/' + yt + '?rel=0' + (o.autoplay ? '&autoplay=1' : '');
          root.classList.add('cl-vplayer--embed');
          return;
        }
        if (iframe) { iframe.remove(); iframe = null; }
        root.classList.remove('cl-vplayer--embed');
        video.hidden = false;
        if (o.poster) video.poster = o.poster; else video.removeAttribute('poster');
        video.src = o.src;
        video.load();
        syncTime();
        if (o.autoplay) video.play().catch(function () { sync(); });
      }

      root.addEventListener('click', function (e) {
        var c = e.target.closest('[data-cl-v]');
        if (c) {
          var a = c.getAttribute('data-cl-v');
          if (a === 'play') toggle();
          else if (a === 'mute') { video.muted = !video.muted; if (!video.muted && video.volume === 0) video.volume = 1; }
          else if (a === 'rate') { video.playbackRate = RATES[(RATES.indexOf(video.playbackRate) + 1) % RATES.length]; sync(); }
          else if (a === 'fullscreen') fullscreen();
          return;
        }
        if (e.target === video) toggle();
      });
      video.addEventListener('dblclick', fullscreen);

      root.addEventListener('keydown', function (e) {
        if (isTyping(e.target) || e.target.type === 'range' && /Arrow/.test(e.key)) return;
        var k = e.key.toLowerCase();
        if (k === ' ' || k === 'k') { if (e.target.closest('button') && k === ' ') return; e.preventDefault(); toggle(); }
        else if (k === 'f') { e.preventDefault(); fullscreen(); }
        else if (k === 'm') { e.preventDefault(); video.muted = !video.muted; }
        else if (k === 'arrowright') { e.preventDefault(); video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); }
        else if (k === 'arrowleft') { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); }
        wake();
      });
      root.addEventListener('mousemove', function () { wake(); });
      root.addEventListener('mouseleave', function () { if (!video.paused) root.classList.add('cl-vplayer--idle'); });

      if (seek) {
        seek.addEventListener('input', function () { seek.__dragging = true; fill(seek, seek.max ? seek.value / seek.max : 0); });
        seek.addEventListener('change', function () { video.currentTime = +seek.value; seek.__dragging = false; });
      }
      if (vol) vol.addEventListener('input', function () { video.volume = +vol.value; video.muted = +vol.value === 0; });

      ['play', 'pause', 'ended', 'volumechange', 'ratechange'].forEach(function (ev) { video.addEventListener(ev, sync); });
      video.addEventListener('play', function () { wake(); });
      video.addEventListener('timeupdate', syncTime);
      video.addEventListener('loadedmetadata', syncTime);
      video.addEventListener('waiting', function () { root.classList.add('cl-vplayer--buffering'); });
      ['playing', 'canplay', 'pause'].forEach(function (ev) { video.addEventListener(ev, function () { root.classList.remove('cl-vplayer--buffering'); }); });
      video.addEventListener('error', function () { if (video.getAttribute('src')) root.classList.add('cl-vplayer--error'); });
      video.addEventListener('ended', function () { emit('cl:videoended', { player: root }, root); });

      sync(); syncTime();
      root.__clVideo = { load: load, toggle: toggle, fullscreen: fullscreen, element: video, root: root };
      return root.__clVideo;
    }

    function init() { $$('[data-cl-vplayer]').forEach(create); }
    return { init: init, get: function (el) { el = resolve(el); return el ? create(el) : null; } };
  })();

  /* ════════════════════════════════════════════════════════════════════
     ClapQR — QR code de partage. Nécessite QRious (cdnjs) chargé avant :
       <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
     Les couleurs viennent des tokens du thème courant, jamais du code.

       ClapQR.render(container, url)          dessine dans le conteneur
       ClapQR.downloadCard({ url, title, subtitle, brand, filename })
       ClapQR.downloadRaw(url, filename)
       ClapQR.print({ url, title, subtitle, brand })
       ClapQR.share({ url, title }) / ClapQR.copy(url)
     ════════════════════════════════════════════════════════════════════ */

  var QR = (function () {
    function token(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }
    function available() {
      if (window.QRious) return true;
      Toast.show('Génération de QR code indisponible (bibliothèque non chargée).');
      return false;
    }
    function dataURL(url, size) {
      if (!available()) return '';
      return new window.QRious({ value: url, size: size || 600, level: 'H', padding: 0, foreground: token('--surface-invert', '#000000'), background: '#ffffff' }).toDataURL('image/png');
    }
    function slug(s) {
      return String(s || 'qr').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    function download(href, filename) {
      var a = document.createElement('a');
      a.href = href; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
    }

    function render(container, url) {
      container = resolve(container);
      if (!container || !available()) return;
      var canvas = $('canvas', container) || container.appendChild(document.createElement('canvas'));
      new window.QRious({ element: canvas, value: url, size: 360, level: 'Q', padding: 0, foreground: token('--surface-invert', '#000000'), background: '#ffffff' });
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'QR code vers ' + url);
    }

    /** Carte imprimable : bandeau accent, titre, QR, consigne, URL. */
    function card(o) {
      var src = dataURL(o.url, 600);
      if (!src) return Promise.reject();
      var W = 800, H = 960, M = 40, R = 32;
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var ctx = c.getContext('2d');
      var body = token('--font-body', 'sans-serif'), display = token('--font-heading', 'sans-serif');
      ctx.fillStyle = token('--surface', '#ffffff'); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = token('--border-subtle', '#dddddd'); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(M, M, W - 2 * M, H - 2 * M, R); ctx.fill(); ctx.stroke();
      ctx.fillStyle = token('--accent', '#ffd100');
      ctx.beginPath(); ctx.roundRect(M, M, W - 2 * M, 110, [R, R, 0, 0]); ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = token('--on-accent', '#000000');
      ctx.font = '700 24px ' + body; ctx.fillText((o.brand || 'Clap ! Éditions').toUpperCase(), W / 2, M + 66);
      ctx.fillStyle = token('--primary', '#000000');
      ctx.font = '40px ' + display; ctx.fillText(o.title || '', W / 2, M + 180, W - 4 * M);
      ctx.fillStyle = token('--accent-ink', '#555555');
      ctx.font = '600 20px ' + body; ctx.fillText(o.subtitle || '', W / 2, M + 220, W - 4 * M);
      return new Promise(function (res) {
        var img = new Image();
        img.onload = function () {
          var S = 440, x = (W - S) / 2, y = M + 260;
          ctx.drawImage(img, x, y, S, S);
          ctx.fillStyle = token('--primary', '#000000');
          ctx.font = '700 18px ' + body; ctx.fillText(o.hint || 'Scannez pour ouvrir la ressource', W / 2, y + S + 56);
          ctx.fillStyle = '#6b7280';
          ctx.font = '14px ' + body; ctx.fillText(o.url, W / 2, y + S + 86, W - 4 * M);
          res(c.toDataURL('image/png'));
        };
        img.src = src;
      });
    }

    function downloadCard(o) { return card(o).then(function (png) { download(png, o.filename || 'QR-' + slug(o.title) + '.png'); }); }
    function downloadRaw(url, filename) { var s = dataURL(url, 600); if (s) download(s, filename || 'QRCode.png'); }

    function print(o) {
      card(o).then(function (png) {
        var w = window.open('', '_blank');
        if (!w) { Toast.show('Autorisez les fenêtres pop-up pour imprimer.'); return; }
        w.document.write('<!doctype html><title>' + escapeHTML(o.title) + '</title><style>body{margin:0;display:flex;justify-content:center}img{max-width:100%;height:auto}@page{margin:1cm}</style><img src="' + png + '" onload="setTimeout(function(){print()},100)">');
        w.document.close();
      });
    }

    function copy(url) {
      var done = function () { Toast.show('Lien copié dans le presse-papiers.'); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { Toast.show('Copie impossible : ' + url); });
      else Toast.show(url);
    }

    function share(o) {
      var data = { title: o.title, text: o.text || o.title, url: o.url };
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        navigator.share(data).catch(function () {});
      } else copy(o.url);
    }

    return { render: render, dataURL: dataURL, downloadCard: downloadCard, downloadRaw: downloadRaw, print: print, share: share, copy: copy };
  })();

  /* ════════════════════════════════════════════════════════════════════
     Exports & initialisation
     ════════════════════════════════════════════════════════════════════ */

  window.ClapLightbox = Lightbox;
  window.ClapModal = Modal;
  window.ClapToast = Toast;
  window.ClapAudio = Audio;
  window.ClapViewer = Viewer;
  window.ClapFullscreen = Fullscreen;
  window.ClapVideo = Video;
  window.ClapQR = QR;
  window.Clap = {
    lightbox: Lightbox, modal: Modal, toast: Toast, audio: Audio, viewer: Viewer,
    fullscreen: Fullscreen, video: Video, qr: QR, icons: Icons,
    util: { formatTime: formatTime, escapeHTML: escapeHTML, richText: richText, readJSON: readJSON }
  };

  // Les modules sans données s'initialisent seuls ; ClapAudio et
  // ClapViewer attendent leurs pistes (init explicite, ou JSON inline).
  onReady(function () {
    Icons.inject();
    Lightbox.init();
    Modal.init();
    Fullscreen.init();
    Video.init();
    if ($('[data-cl-tracks]')) Audio.init();
    if ($('[data-cl-viewer]') && Audio.tracks.length) Viewer.init();
  });
})();

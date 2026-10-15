/**
 * Chrome des pages de styleguide — HORS design system.
 * Nuancier et échelle d'espacement lus dans les tokens du thème courant,
 * sélecteur de thème (lien actif + repli file://).
 */
(function () {
  'use strict';
  var swatches = [
    ['--primary', 'Principale'], ['--surface', 'Fond principal'],
    ['--surface-raised', 'Surface remontée'], ['--surface-alt', 'Seconde bande claire'],
    ['--surface-invert', 'Bande inversée'], ['--accent', 'Accent'],
    ['--accent-hover', 'Accent survol'], ['--accent-ink', 'Accent texte'],
    ['--on-accent', 'Sur accent'], ['--danger', 'Erreur'], ['--success', 'Succès']
  ];
  var steps = ['--sp-1', '--sp-2', '--sp-3', '--sp-4', '--sp-5', '--sp-6', '--sp-8', '--sp-10', '--sp-12', '--sp-14', '--sp-16'];
  var cs = getComputedStyle(document.documentElement);

  var sw = document.getElementById('sg-swatches');
  if (sw) sw.innerHTML = swatches.map(function (s) {
    return '<div class="sg-swatch"><div class="sg-swatch__chip" style="background:var(' + s[0] + ');box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)"></div>' +
      '<div class="sg-swatch__body"><div class="sg-swatch__name">' + s[1] + '</div>' +
      '<div class="sg-swatch__val">' + s[0] + '<br>' + cs.getPropertyValue(s[0]).trim() + '</div></div></div>';
  }).join('');

  document.querySelectorAll('[data-font-of]').forEach(function (el) {
    var probe = document.querySelector(el.dataset.fontOf);
    if (probe) el.textContent = getComputedStyle(probe).fontFamily.split(',')[0].replace(/["']/g, '');
  });

  var sc = document.getElementById('sg-scale');
  if (sc) sc.innerHTML = steps.map(function (v) {
    var val = cs.getPropertyValue(v).trim();
    return '<div class="sg-scale-row"><code>' + v + ' · ' + val + '</code><div class="sg-bar" style="width:' + val + '"></div></div>';
  }).join('');

  // Page courante + repli sans serveur (les chemins absolus ne résolvent pas en file://)
  var page = document.documentElement.dataset.page;
  var link = document.querySelector('[data-page-link="' + page + '"]');
  if (link) link.classList.add('sg-theme__btn--on');
  if (location.protocol === 'file:') {
    var files = { clap: 'index.html', conjugarium: 'conjugarium.html', surhumains: 'surhumains.html', observatoire: 'observatoire.html' };
    document.querySelectorAll('[data-page-link]').forEach(function (a) { a.setAttribute('href', files[a.dataset.pageLink]); });
  }
})();

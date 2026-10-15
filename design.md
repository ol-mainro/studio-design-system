# Clap ! Studio — Design System

Le design system du studio de création **Clap !** fournit des **composants** et des
**layouts** (pages complètes) pour produire les supports de consultation et de communication
des projets : minisites d'œuvres, pages de pack pédagogique, landing pages, lecteurs de
podcast, parcours sonores de musée, playlists vidéo… Un même univers vit sur plusieurs
supports (conte audio, album, vidéos karaoké, affiches mémo, quiz) : le système garantit
qu'ils se reconnaissent entre eux.

Il est pensé pour être utilisé **par des outils d'IA** autant que par des humains : ce
document est la référence que l'IA lit avant de produire une page, et à laquelle elle se
conforme. Voir aussi `CLAUDE.md`.

Le système est **thémable** : un thème redéfinit des couleurs, des polices et la forme des
séparateurs sans qu'aucun composant ne change. Quatre thèmes sont livrés — Clap ! Studio
(par défaut), Conjugarium, Surhumains, L'Observatoire des Mots. Voir § 9.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `design.md` | Ce document : principes, tokens, composants, comportements, layouts, règles d'usage |
| `CLAUDE.md` | Consignes pour l'IA qui produit un support à partir du système |
| `tokens.css` | Variables CSS — **source de vérité** des valeurs de design, thème Clap ! Studio par défaut |
| `themes/*.css` | Un fichier par thème (`conjugarium`, `surhumains`, `observatoire`) — ne redéfinit que les rôles |
| `components.css` | Composants préfixés `.cl-`, dépend de `tokens.css` |
| `components.js` | Comportements (audio, vidéo, modale, visionneuse, lightbox, QR, onglets…), zéro dépendance |
| `layouts/` | Pages complètes prêtes à dupliquer : `podcast.html`, `musee.html`, `video.html` |
| `index.html` | Styleguide, thème Clap ! Studio — sert `/clap` |
| `conjugarium.html` · `surhumains.html` · `observatoire.html` | Styleguide de chaque thème, avec ses propres meta de partage |
| `styleguide/` | Chrome des pages de styleguide (navigation, nuancier) — **hors** design system |
| `assets/fonts/` | `avenir-heavy.woff2`, `simply-olive.woff2` |
| `assets/` | `clap-logo.png`, pochettes `conjugarium-cover.jpg` / `surhumains-cover.jpg`, planches SVG de démo |

## Démarrage

```html
<html lang="fr" data-theme="conjugarium">   <!-- omettre data-theme pour Clap ! Studio -->
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Gaegu:wght@700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./tokens.css" />
  <link rel="stylesheet" href="./themes/conjugarium.css" />   <!-- 1. tokens, 2. thème -->
  <link rel="stylesheet" href="./components.css" />           <!-- 3. composants -->
</head>
<body>
  …
  <script src="./components.js"></script>                      <!-- en fin de body -->
</body>
```

Le thème s'active par `data-theme="…"` sur `<html>` ou sur n'importe quel conteneur, pour
n'habiller qu'une partie de la page. Charger plusieurs thèmes ne coûte rien : seul celui
que nomme `data-theme` s'applique.

**Le plus rapide est de partir d'un layout** (§ 6) : copier la page la plus proche du
besoin, remplacer le bloc de données JSON et les textes, ajuster les chemins `../`.

Pour un projet Vite/React, copier `tokens.css`, `themes/` et `components.css` dans
`src/styles/`, les importer dans `main.tsx` dans cet ordre, et déplacer `assets/fonts/` dans
`public/fonts/` (ajuster les chemins des `@font-face`). `components.js` reste utilisable tel
quel (il s'accroche au DOM par attributs `data-cl-*`) ou sert de référence de comportement.

### Le styleguide publié

Un fichier HTML **par thème** — pas une page qui bascule par script. Les métadonnées de
partage (titre, description, Open Graph, Twitter Card) doivent être dans le HTML statique :
les robots qui génèrent les aperçus de lien ne l'exécutent pas.

| URL | Fichier | Thème |
|---|---|---|
| <https://clap-design-system.web.app/clap> | `index.html` | Clap ! Studio |
| <https://clap-design-system.web.app/conjugarium> | `conjugarium.html` | Conjugarium |
| <https://clap-design-system.web.app/surhumains> | `surhumains.html` | Surhumains |
| <https://clap-design-system.web.app/observatoire> | `observatoire.html` | Observatoire des Mots |
| <https://clap-design-system.web.app/layouts/podcast> | `layouts/podcast.html` | Surhumains (`?theme=` pour comparer) |
| <https://clap-design-system.web.app/layouts/musee> | `layouts/musee.html` | Conjugarium |
| <https://clap-design-system.web.app/layouts/video> | `layouts/video.html` | Conjugarium |

La racine `/` redirige vers `/clap`. Chaque chemin est servi par un *rewrite* Firebase
vers son fichier ; la variante à barre oblique finale est redirigée en 301 vers la version
sans barre, sans quoi les chemins relatifs ne résoudraient plus.

Les quatre styleguides partagent le même corps : leur `<head>` diffère (thème, meta de
partage) et certaines notes sont adaptées au thème. Le chrome commun vit dans
`styleguide/styleguide.css` et `styleguide/styleguide.js`. **Une modification structurelle
du corps se répercute dans les quatre fichiers** — il n'y a pas de génération automatique.

Sans serveur, ouvrir `index.html` fonctionne aussi : en `file://`, le sélecteur de thème
pointe vers les fichiers voisins. Les layouts, eux, chargent leurs médias depuis le réseau.

---

## 1. Principes

**Deux registres, un seul système.** Le studio parle aux enfants et aux familles d'un côté,
aux enseignants de l'autre. Couleurs, espacements et composants ne changent pas entre les
deux ; seule la typo de titre bascule (`--font-heading` ↔ `--font-display`), et la page
protégée abandonne l'alternance de fonds pour une surface inversée pleine.

**L'accent est un signal, pas une décoration.** `--accent` marque ce qui est cliquable ou
en cours de lecture. Une zone visible ne contient qu'un seul bouton d'accent plein.
L'accent n'est jamais fond de texte long — exceptions : le pied de page et le lecteur
flottant, deux blocs courts et volontairement tranchés. En **texte** sur fond clair, c'est
`--accent-ink` qui prend le relais (§ 2).

**Le système est clair ; le sombre est une rupture.** Le fond principal est blanc ou très
pâle. `--primary` est une couleur de **contenu** (titres, texte, boutons pleins), pas un
fond. La surface sombre n'apparaît que sur **une** bande par page, `.cl-section-invert`,
pour le moment fort : la playlist, le parcours. Deux bandes sombres et la rupture ne rompt
plus rien.

**Une zone inversée ne duplique aucun composant.** `.cl-section-invert` (ou `.cl-invert`)
redéclare la rampe de texte, les bordures et les voiles pour tout son sous-arbre : les
composants à l'intérieur sont exactement les mêmes. Il n'existe aucune variante sombre.

**Les séparateurs sont la signature.** Chaque changement de couleur de fond passe par un
`.cl-wave`, y compris avant le pied de page. Jamais de bord droit entre deux sections. La
forme appartient au thème.

**Le HTML décrit, le script anime.** Les composants sont des classes `.cl-*` ; leurs
comportements s'accrochent à des attributs `data-cl-*`. Les contenus variables (pistes,
chapitres, vidéos) sont un bloc JSON dans la page. Aucune couleur, aucun texte d'interface
n'est fabriqué par le script.

**Mobile = un seul point de rupture.** `@media (max-width: 600px)`. Les rangées passent en
colonne et se centrent, les détails secondaires (`.cl-row__desc`, `.cl-player__side`)
disparaissent plutôt que de se tasser.

**Le retour au survol est toujours le même.** Un `scale` léger (1.02 à 1.1 selon la taille)
plus un éclaircissement. Pas de changement de teinte, pas d'ombre animée.

---

## 2. Tokens

Toutes les valeurs sont dans `tokens.css`. **Ne jamais écrire une couleur, un rayon, une
taille ou un z-index en dur** dans un composant ou une page.

Les tokens sont en **trois couches** :

1. **Primitives** — `--clap-navy`, `--cjg-pink`, `--shm-mint`, `--obs-orange`… Les
   couleurs brutes d'une marque. Aucun composant ne les lit.
2. **Rôles nommés** — `--primary`, `--surface`, `--accent`, `--accent-ink`… C'est ce
   qu'un thème déclare, avec **trois triplets RGB** : `--_ink-rgb` (encre),
   `--_accent-rgb` (accent), `--_shadow-rgb` (ombres, souvent = encre).
3. **Dérivés** — rampe de texte, bordures, voiles, déclinaisons d'accent, ombres. Calculés
   dans `tokens.css` § 2 ter à partir des triplets, sur `:root` **et** sur tout
   `[data-theme]`. Un thème ne les redéclare jamais.

### Couleur principale et surfaces

| Token | Clap ! Studio | Conjugarium | Surhumains | Observatoire | Usage |
|---|---|---|---|---|---|
| `--primary` | `#0D1B2E` | `#0E172A` | `#3333CB` | `#33236B` | **Titres, texte, boutons pleins.** Pas un fond. |
| `--on-primary` | `#FFFFFF` | `#EFEEFA` | `#FFFFFF` | `#FFFFFF` | Posé sur `--primary` |
| `--surface` | `#FFFFFF` | `#EFEEFA` | `#F9F9F9` | `#FAF8FC` | **Fond principal** |
| `--surface-raised` | `#F6F7F9` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | Cartes, playlist, pills, modales |
| `--surface-sunken` | `#F0F2F5` | `#FFFFFF` | `#EFEFF4` | `#F0ECF5` | Champs de saisie |
| `--surface-alt` | `#F2F4F7` | `#C9C8FB` | `#9EEFDF` | `#F4B0CF` | Seconde bande claire (`.cl-section-light--alt`) |
| `--surface-invert` | `#0D1B2E` | `#0E172A` | `#2626A8` | `#271A54` | La bande de rupture, une par page |

### Accent

| Token | Clap ! Studio | Conjugarium | Surhumains | Observatoire | Usage |
|---|---|---|---|---|---|
| `--accent` | `#FFD100` | `#F4B0CF` | `#F98FA5` | `#EA571B` | Aplats : boutons, badges, état actif, lecteur |
| `--accent-ink` | `#7A6000` | `#A62A60` | `#B0234A` | `#B53F0E` | **Accent en texte, sur fond clair** |
| `--on-accent` | `#1A1A1A` | `#0E172A` | `#14144B` | `#FFFFFF` | Texte et icônes posés SUR l'accent |

Dérivés : `--accent-soft` (fond de rangée active), `--accent-ring` (halo de focus),
`--accent-glow` (ombre portée), `--accent-faint` (bordure au survol), `--on-accent-muted` /
`--on-accent-faint` (texte secondaire sur l'accent), `--on-accent-track` (rail de curseur
posé sur l'accent).

> **Pourquoi `--accent-ink`.** Un accent de marque clair plafonne autour de 1,5:1 sur un
> fond clair, là où AA demande 4,5:1. L'accent est donc réservé aux **aplats**, où
> `--on-accent` porte la lisibilité ; dès qu'il devient **texte** sur fond clair, on passe à
> `--accent-ink`, assombri jusqu'à franchir AA. Dans une zone inversée, `--accent-ink`
> redevient `--accent`, lisible tel quel sur le sombre.

### Couleurs d'état

`--danger` `#D92D20` (erreurs de formulaire, action destructive au survol) · `--success`
`#067647` + `--success-bg` / `--success-border` (badge de confirmation). Dans une zone
inversée : `#F87171` et `#34D399`.

### Texte

Le texte s'atténue par opacité de l'encre. **Quatre paliers, pas davantage**, calés sur des
seuils de contraste mesurés.

| Token | Contraste | Usage |
|---|---|---|
| `--text-1` | ~16:1 | Titres, titres de piste, libellés forts (= `--primary`) |
| `--text-2` | ~10:1 | Corps de texte, descriptions |
| `--text-3` | **4,5:1** | Tags, légendes, description de piste — plancher AA |
| `--text-4` | **3:1** | Numéros de piste, icônes de champ — **information redondante uniquement** |

Ils basculent en bloc dans une zone inversée : un composant demande `--text-2`, il obtient
le bon quel que soit le fond.

### Bordures, voiles, médias

`--border-subtle` bordure de carte et de champ · `--border-hairline` filet entre rangées ·
`--border-strong` contour des boutons secondaires · `--overlay-hover` survol de rangée ·
`--chip-bg` / `--chip-border` fond des tags. Relatifs à la surface courante, ils basculent
dans une zone inversée.

Posés **sur une image ou une vidéo** : `--scrim` (voile de survol), `--scrim-strong` (fond de
modale, dégradé de contrôles vidéo), `--scrim-chip` (pastille sur image), `--on-media` /
`--on-media-soft` / `--on-media-track` (texte, pastille et rail clairs sur média).

### Typographie

| Token | Clap ! Studio | Conjugarium | Surhumains / Observatoire | Usage |
|---|---|---|---|---|
| `--font-body` | Lexend | Lexend | Lexend | Corps, boutons, champs. **Jamais remplacée** : lisible pour les lecteurs débutants. |
| `--font-heading` | Gaegu 700 | Simply Olive | Avenir Heavy | Titres des pages publiques (registre enfant) |
| `--font-display` | Avenir Heavy | Simply Olive | Avenir Heavy | Titres pro, titres de carte, bannières |
| `--heading-weight` | 800 | 400 | 800 | Graisse des titres en `--font-display` |

Simply Olive n'a qu'une graisse : le Conjugarium pose `--heading-weight: 400` pour éviter
un faux gras, et remonte les tailles de titre. **La version démo de Simply Olive n'a pas de
chiffres** : les surtitres et numéros restent donc en `--font-body`.

Tailles : `--fs-2xs` .68 · `--fs-xs` .72 · `--fs-sm` .8 · `--fs-ui` .875 · `--fs-base` .95 ·
`--fs-md` 1 · `--fs-lg` 1.2 · `--fs-xl` 1.4 rem. Titres fluides : `--fs-title-fun`,
`--fs-title-pro`, `--fs-title-section`, redéfinissables par un thème.

Interlignes : `--lh-tight` 1.25 (titres de carte) · `--lh-normal` 1.5 · `--lh-relaxed` 1.7
(descriptions, récits) · `--lh-loose` 1.8 (texte long).

### Espacement

Échelle en rem, multiples de 0.25 : `--sp-1` .25 → `--sp-16` 4rem (1, 2, 3, 4, 5, 6, 8, 10,
12, 14, 16). Padding de carte `--sp-6 --sp-8`, de rangée `--sp-4 --sp-5`, gap de hero
`--sp-10`, haut de section `--sp-12`.

### Rayons

`--r-xs` 4px (tags) · `--r-sm` 5px · `--r-md` 14px (champs) · `--r-lg` 16px (playlist) ·
`--r-xl` 20px (cartes, pochettes) · `--r-2xl` 24px (modales, vidéo) · `--r-pill` 50px
(boutons, badges, lecteur) · `--r-round` 50 % (boutons icône).

**Règle** : plus la surface est grande, plus le rayon est doux. Tout objet interactif et
compact est en pill.

### Ombres

`--shadow-card` cartes · `--shadow-modal` modales · `--shadow-cover` pochette ·
`--shadow-player` lecteur flottant · `--shadow-float` bouton posé sur un média ·
`--shadow-media` vidéo, image agrandie · `--shadow-accent` halo sous les surfaces d'accent ·
`--ring-focus` halo de focus.

### Tailles fixes, empilement, transitions

`--num-size` 32px (pastille numéro) · `--icon-btn` 44px (cible tactile minimale) ·
`--z-wave` 2 · `--z-player` 100 · `--z-modal` 500 · `--z-toast` 600 · `--t-fast` 0.15s ·
`--t-base` 0.2s.

### Layout

`--content-max` 820px (colonne principale) · `--wide-max` 1100px (grilles de chapitres,
pages vidéo) · `--prose-max` 620px (texte long) · `--card-max` 520px · `--player-max` 760px ·
`--player-h` 100px (spacer) · `--wave-h` / `--wave-h-mobile` (75/50px, montés par les
thèmes à nuages et à flammes).

---

## 3. Composants

Tous préfixés `.cl-`. Les styleguides montrent chacun en contexte ; les layouts (§ 6) les
montrent en situation réelle.

### Structure de page

`.cl-page` colonne pleine hauteur · `.cl-section` section sur le fond courant ·
`.cl-section--end` ajoute le padding bas quand une vague suit · `.cl-section-invert` la bande
de rupture (`.cl-section-dark` : alias déprécié) · `.cl-section-light` section de texte ·
`.cl-section-light--alt` seconde bande claire (`--surface-alt`) · `.cl-container` colonne
820px · `.cl-container--wide` colonne 1100px · `.cl-prose` colonne 620px centrée ·
`.cl-player-spacer` en fin de page dès qu'un lecteur flottant est monté.

### Entête, barre supérieure, pied de page

`.cl-header` logo centré + tagline sur deux lignes, le second membre en
`.cl-tagline__accent`. `.cl-topbar` (> `.cl-topbar__inner` > `.cl-topbar__brand` + actions)
barre collante pour les pages d'application : retour, marque. `.cl-footer` bloc d'accent :
`.cl-footer__tagline`, `.cl-footer__link`, `.cl-footer__legal`.

### Séparateurs — `.cl-wave`

La **forme** vient du thème (`--divider-shape`, appliquée en `mask-image`) ; les
**couleurs** se posent par instance :

```html
<!-- --wave-from = section qui précède, --wave-to = section qui suit -->
<div class="cl-wave" style="--wave-from: var(--surface); --wave-to: var(--surface-invert)"></div>
```

Formes livrées : `--shape-drips` (coulures, Clap ! et Observatoire), `--shape-clouds`
(nuages, Conjugarium), `--shape-flames` (flammes, Surhumains). Convention : un SVG de 1920
unités de large, calé sur son bord bas, sans couleur propre. `--divider-repeat` est la
largeur d'*un* motif **en px fixes** (`--divider-repeat-mobile` sous 600px) : l'espacement
ne dépend pas de la largeur d'écran.

### Titres et texte

`.cl-title-fun` (`--font-heading`) page publique · `.cl-title-pro` (`--font-display`) page
protégée · `.cl-section-title` titre de section, avec `.cl-section-title__accent` ·
`.cl-text` paragraphe long · `.cl-desc` description · `.cl-meta` surtitre en accent,
majuscules espacées.

### Boutons

| Classe | Usage |
|---|---|
| `.cl-btn` | Action principale, accent plein, pill. **Une seule par zone visible.** |
| `.cl-btn--lg` | Variante bannière |
| `.cl-btn--primary` | Action sobre, en `--primary` plein |
| `.cl-btn--soft` | Action secondaire claire (retour, raccourci, partage) |
| `.cl-btn--block` | Pleine largeur, dans un formulaire |
| `.cl-btn--ghost` | Action destructive ; passe en `--danger` au survol |
| `.cl-icon-btn` | Rond 44px en accent — lecture / pause |
| `.cl-icon-btn--outline` | Rond 40px contour — téléchargement, texte |

Tout bouton `:disabled` passe à 30 % d'opacité.

### Badges, pastilles

`.cl-badge` en accent, majuscules — type d'œuvre · `.cl-badge--ghost` translucide —
qualificatif secondaire · `.cl-badge--success` confirmation · `.cl-chip` pastille courte
(groupe, durée), `.cl-chip--accent` en accent doux.

### Cartes et bannières

`.cl-card` sur `--surface-raised`. `.cl-card--accent` : bordure d'accent, **une seule par
page**. `.cl-card--auth` carte d'authentification centrée. `.cl-banner` (avec `.cl-card`) :
`.cl-banner__left` > `.cl-banner__icon` + `.cl-banner__title` / `.cl-banner__subtitle`, action
à droite ; passe en colonne sous 600px.

### Hero projet

`.cl-hero` = pochette 180px (`.cl-hero__cover`) + `.cl-hero__info` : `.cl-hero__badges`
(ligne de badges), titre, description, `.cl-hero__actions` (boutons). Sous 600px : colonne
centrée.

### Citation

`.cl-quote` (sur un `<figure>`) : `.cl-quote__label` pastille, `.cl-quote__text`
(`<blockquote>`), `.cl-quote__source`. À poser dans une `.cl-section-light--alt`.

### Formulaires, filtres, onglets

`.cl-form` > `.cl-field` (> `.cl-field__icon` + `.cl-input`) · `.cl-error` · `.cl-search` +
`.cl-search__input` · `.cl-select`. Focus : bordure `--accent` + `--ring-focus`.

`.cl-controls` barre qui wrappe : pastilles à gauche, action à droite. `.cl-pills` >
`.cl-pill` / `.cl-pill--active`. Avec `data-cl-tabs`, les pastilles deviennent des onglets
(§ 4).

### Playlist audio

`.cl-playlist` (`<ul>`, coins `--r-lg`, rangées collées) > `.cl-row` :
`.cl-row__num` (numéro, ou égaliseur en lecture) · `.cl-row__thumb` (vignette facultative) ·
`.cl-row__info` (> `.cl-row__titleline` = `.cl-row__title` + `.cl-row__tag`, puis
`.cl-row__desc` masquée sous 600px) · `.cl-row__actions`. `.cl-row--active` signale la
lecture sur **trois** canaux : fond `--accent-soft`, numéro et titre en `--accent-ink`.
`.cl-empty` pour la liste vide.

### Lecteur flottant

`.cl-player` fixe en bas, centré, accent plein, pill. `.cl-player__inner` >
`.cl-player__play` (rond 48px) · `.cl-player__meta` (> `.cl-player__titleline` =
`.cl-player__title` + `.cl-eq` + `.cl-player__link` facultatif ; puis
`.cl-player__progress` = temps / `.cl-range` / temps) · `.cl-player__side`
(`.cl-player__iconbtn` précédent / suivant / muet, `.cl-player__sep`,
`.cl-range--volume`). Sous 600px : rayon `--r-2xl`, côté masqué.

### États de lecture

`components.js` pose `data-playing="true|false"` sur tout ce qui dépend de la lecture.
- Un bouton contient **les deux icônes** (`.cl-ico--play` et `.cl-ico--pause`) et/ou les deux
  libellés (`.cl-when-paused` et `.cl-when-playing`) : le CSS montre le bon.
- `.cl-eq` (égaliseur à 4 barres) s'anime sous un ancêtre `data-playing="true"` — remplace
  l'ancien `♫` + `.cl-pulse` (supprimé). Animation coupée si `prefers-reduced-motion`.
- Un bouton à bascule (muet) contient `.cl-when-unpressed` et `.cl-when-pressed`, et suit
  `aria-pressed`.

### Chapitres (parcours, exposition)

`.cl-chapters` grille (`minmax(240px, 1fr)`) > `.cl-chapter` : `.cl-chapter__thumb` (16:10,
avec `.cl-chapter__num`), `.cl-chapter__play` (rond, en haut à droite), `.cl-chapter__body`
(> `.cl-chapter__title` + `.cl-chapter__desc` sur 2 lignes). `.cl-chapter--active` : bordure
et halo d'accent.

### Modale

`.cl-modal` (plein écran, fond `--scrim-strong`) > `.cl-modal__backdrop` +
`.cl-modal__dialog` (`--accent` : bordure d'accent ; `--wide` : 1040px, hauteur fixe) >
`.cl-modal__header` (`.cl-modal__heading`, `.cl-modal__close`) · `.cl-modal__body`
(`.cl-modal__title`) · `.cl-modal__footer` (`.cl-modal__nav`). Ouverte : `.cl-modal--open`.

### Visionneuse de chapitre

Dans une `.cl-modal__dialog--wide.cl-viewer` : `.cl-viewer__split` = `.cl-viewer__stage`
(média `.cl-viewer__media`, image ou vidéo muette en boucle, flèches `.cl-media-nav--prev`
/ `--next`) + `.cl-viewer__story` (`.cl-viewer__head` > `.cl-viewer__title` +
`.cl-viewer__subtitle`, puis `.cl-viewer__text`). Pied : `.cl-stepper` (points,
`.cl-stepper__dot--active`), bouton d'écoute, `.cl-viewer__hint`. Sous 600px : empilé.

### Vidéo

- `.cl-vgallery` > `.cl-vcard` : `.cl-vcard__body` (> `.cl-vcard__thumb` 16:9 avec
  `__overlay` / `__play` / `__duration`, puis `.cl-vcard__info` = `__eyebrow`, `__title`,
  `__sub`) + `.cl-vcard__cta`.
- `.cl-video` > `.cl-video__frame` (16:9) : lecteur simple (`<video controls>` ou iframe).
- `.cl-vplayer` (avec `.cl-video`) : contrôles intégrés — `.cl-vplayer__big` (lecture
  centrale), `.cl-vplayer__bar` (dégradé, `.cl-vplayer__btn`, `.cl-vplayer__time`,
  `.cl-range--media`), `.cl-vplayer__spinner`, `.cl-vplayer__error`. États :
  `--idle` (barre masquée), `--buffering`, `--error`, `--embed` (YouTube).
- `.cl-vswitcher` > `.cl-vchip` (`__num`, `__info`, `__title`, `__status`) /
  `.cl-vchip--active`.
- `.cl-track-nav` (> `.cl-track-nav__btn`, `--center`, `.cl-track-nav__label`) :
  précédente · liste · suivante.

### Fiche mémo, QR code, fil d'Ariane, toast

- `.cl-memo` (avec `.cl-card`) : `.cl-memo__head` (> `__icon` + `__title`), `__intro`,
  `__grid` de `__box` (`--accent`) contenant `__label`, `__list` (repères en chasse fixe),
  `__example`, `__tip`.
- `.cl-qr` (avec `.cl-card`) : `.cl-qr__code` (fond blanc imposé : un QR se scanne sur
  blanc) + `.cl-qr__info` (`__url`, `__actions`).
- `.cl-breadcrumb` (liens, `[aria-current]`) · `.cl-pagehead` (> `__row`, `__sub`) en-tête de
  page média.
- `.cl-toast` notification éphémère (`--show`), au-dessus du lecteur flottant.

### Planches de BD & illustrations

- **Grille** : `.cl-board-gallery` > `.cl-board-card` (vignette 3:4 `__thumb`, `__overlay`
  + `__zoom` au survol, `__badge`, `__body` = `__eyebrow` / `__title` / `__desc`).
- **Liste** : `.cl-board-list` > `.cl-board-row` (`__num`, `__thumb`, `__info`, `__tag`,
  `__cta`).
- **Lightbox** `.cl-lightbox` : ouverte au clic sur une carte ou une rangée, navigation
  groupée, Échap / ← / →, focus piégé puis rendu au déclencheur (§ 4).

---

## 4. Comportements — `components.js`

Un seul script, zéro dépendance (sauf QRious pour `ClapQR`). Chaque module est exposé sur
`window` (`ClapAudio`…) et sous `window.Clap`. Les modules sans données s'initialisent seuls
au `DOMContentLoaded` ; un script de page qui lit leur état doit donc le lire **à l'usage**,
pas au chargement.

| Module | Déclencheurs | API |
|---|---|---|
| Icônes | `<svg class="cl-ico"><use href="#cl-i-play"/></svg>` | sprite injecté ; `Clap.icons.names` |
| `ClapAudio` | `<script type="application/json" data-cl-tracks>`, `[data-cl-track="i"]`, `[data-cl-play="i"]`, `[data-cl-play-all]`, `[data-cl-action="toggle\|prev\|next\|mute"]`, `[data-cl-seek]`, `[data-cl-volume]`, `[data-cl-time="current\|total"]`, `[data-cl-now="title"]` | `init({tracks})`, `play(i)`, `pause()`, `toggle(i)`, `next()`, `prev()`, `index`, `tracks`, `isPlaying()` ; événements `cl:trackchange`, `cl:play`, `cl:pause` |
| `ClapViewer` | `.cl-modal[data-cl-viewer]`, `[data-cl-viewer-open="i"]` (vide = piste courante), `[data-cl-viewer-img\|video\|title\|subtitle\|text\|badge\|prev\|next\|dots\|play]`, `data-cl-viewer-autoplay` | `open(i)` ; suit `ClapAudio` ; ← / →, balayage ≥ 50px |
| `ClapModal` | `.cl-modal`, `[data-cl-modal-open="#id"]`, `[data-cl-modal-close]` | `open(el)`, `close(el)` ; Échap, focus piégé et rendu ; `cl:modalopen` / `cl:modalclose` |
| `ClapTabs` | `[data-cl-tabs]` > `[data-cl-tab="#panneau"]` | `select(btn)` ; masque les autres panneaux (`hidden`) |
| `ClapFullscreen` | `[data-cl-fullscreen]` (`data-label-on/off` facultatifs) | `toggle()` ; `body.cl-kiosk` pendant le plein écran |
| `ClapVideo` | `[data-cl-vplayer]` contenant `<video>`, `[data-cl-v="play\|mute\|rate\|fullscreen"]`, `[data-cl-v-seek]`, `[data-cl-v-volume]`, `[data-cl-v-time]` | `ClapVideo.get(el).load({src, poster, autoplay})` ; Espace/K, F, M, ← / → ±5 s ; `cl:videoended` ; lien YouTube → iframe |
| `ClapQR` | — (charger QRious : `cdnjs…/qrious/4.0.2/qrious.min.js`) | `render(el, url)`, `downloadCard({url, title, subtitle, brand})`, `downloadRaw(url)`, `print(o)`, `share(o)`, `copy(url)` — couleurs lues dans les tokens |
| `ClapToast` | `.cl-toast` (créé au besoin) | `show(message, ms)` |
| `ClapLightbox` | `.cl-board-gallery`, `.cl-board-list`, `[data-cl-gallery]`, `[data-cl-lightbox]`, `data-src` / `data-title` / `data-caption` / `data-credit` | `open(el \| {src, title…})`, `close()`, `next()`, `prev()` |

Utilitaires : `Clap.util.formatTime(s)`, `Clap.util.richText(texte)` (paragraphes,
`**gras**`, `*italique*`, échappé), `Clap.util.readJSON(sélecteur)`.

Clavier global : **Espace** lecture / pause audio (hors champ, bouton et lecteur vidéo).

---

## 5. Gabarits de page

### Page publique

```html
<div class="cl-page">
  <header class="cl-header">…</header>
  <div class="cl-wave" style="--wave-from: var(--surface); --wave-to: var(--surface-invert)"></div>
  <main class="cl-section-invert">
    <div class="cl-container">
      <div class="cl-hero">…</div>
      <ul class="cl-playlist">…</ul>
    </div>
  </main>
  <div class="cl-wave" style="--wave-from: var(--surface-invert); --wave-to: var(--surface)"></div>
  <section class="cl-section-light"><div class="cl-prose">…</div></section>
  <div class="cl-wave" style="--wave-from: var(--surface); --wave-to: var(--accent)"></div>
  <footer class="cl-footer">…</footer>
  <div class="cl-player-spacer"></div>
</div>
<div class="cl-player">…</div>
```

### Page protégée (pack, ressources)

Surface inversée pleine, sans entête ni pied de page, sans lien sortant. Titres en
`.cl-title-pro`. Ordre canonique : hero → carte accentuée (téléchargement global) → cartes
de ressources → contrôles → playlist. La porte d'accès affiche `.cl-card--auth` seule.

```html
<div class="cl-page cl-section-invert">
  <div class="cl-container">
    <div class="cl-hero">…</div>
    <div class="cl-card cl-card--accent cl-banner">…</div>
    <div class="cl-card">…</div>
    <div class="cl-controls">…</div>
    <ul class="cl-playlist">…</ul>
  </div>
  <div class="cl-player-spacer"></div>
</div>
```

---

## 6. Layouts

Trois pages complètes dans `layouts/`, chacune issue d'un prototype réel et réécrite avec
les seuls composants du système. Elles chargent `../tokens.css`, les trois thèmes,
`../components.css` et `../components.js` ; `?theme=clap|conjugarium|surhumains|observatoire`
les rejoue dans un autre thème. Les médias sont des URLs distantes (Firebase Storage).

**Pour créer un support : copier le layout le plus proche, remplacer le bloc JSON, les
textes et les meta de partage, puis retirer ce qui ne sert pas.**

### `podcast.html` — lecteur de podcast (thème Surhumains)

Header → vague → bande inversée (`.cl-hero` avec « Tout écouter » / « Mode lecture »,
`.cl-playlist` dont chaque rangée a lecture, texte, téléchargement) → vague → prose
« À propos » → vague → citation `.cl-section-light--alt` → vague → footer. Lecteur
flottant complet. Modale « Mode lecture » : texte de la piste, écoute, précédente /
suivante (petit script de page).

```json
[{ "title": "Introduction", "src": "https://…mp3", "text": "Paragraphe 1\n\nParagraphe 2" }]
```

### `musee.html` — parcours sonore de musée (thème Conjugarium)

Header → vague → bande inversée large (bannière « Écouter tout le parcours », onglets
Galerie / Liste + bouton « Mode borne », `.cl-chapters` ou `.cl-playlist` avec vignettes) →
vague → prose → vague → footer. Lecteur flottant avec lien « Voir ». Visionneuse de chapitre
(`data-cl-viewer-autoplay` : ouvrir un chapitre le fait jouer). Aucun script de page.

```json
[{ "title": "Accroche", "subtitle": "…", "badge": "Chapitre 01",
   "src": "https://…mp3", "image": "https://…jpg", "video": null, "text": "…" }]
```

### `video.html` — playlist vidéo (thème Conjugarium)

`.cl-topbar` → **catalogue** (`.cl-pagehead`, `.cl-vgallery`) ou **lecteur** (fil
d'Ariane, `.cl-pagehead`, `.cl-vplayer`, `.cl-track-nav`, `.cl-vswitcher`, `.cl-memo`,
`.cl-qr`), routés par l'ancre (`#track-N`) → vague → footer. Fin de vidéo → suivante. Le QR
pointe vers l'ancre de la vidéo.

```json
[{ "id": "track-1", "title": "Les verbes en -ER", "short": "1. Mme Javel (-ER)",
   "character": "Madame Javel", "group": "1er groupe au présent", "duration": "3:45",
   "src": "https://…mp4", "poster": "https://…jpg", "description": "…",
   "memo": { "rule": "…", "endings": ["je -e", "…"], "example": "…", "tip": "…" } }]
```

> Dans les données de démo, les pistes 4 à 7 réutilisent les vidéos 1 à 3 en attendant
> les montages définitifs.

---

## 7. Icônes

Sprite SVG injecté par `components.js` (trait 2px, style Lucide), utilisable partout :

```html
<svg class="cl-ico" aria-hidden="true"><use href="#cl-i-play"/></svg>
```

`play` `pause` `prev` `next` `volume` `mute` `book` `download` `close` `chevron-left`
`chevron-right` `arrow-left` `arrow-right` `image` `expand` `list` `sparkles` `check` `qr`
`share` `copy` `printer` `music` `headphones`. Pour en ajouter une, l'ajouter à `Icons` dans
`components.js` (viewBox 24). Pas de glyphes Unicode (▶ ❚❚ ♫) comme icônes : leur rendu
dépend de la police.

---

## 8. Accessibilité — points à tenir

- **Contrastes.** `--text-3` est au plancher AA (4,5:1) ; `--text-4` (3:1) est réservé à
  l'information redondante.
- **Accent en texte.** Jamais `--accent` comme couleur de texte sur fond clair :
  `--accent-ink`.
- **Boutons icône.** Toujours un `aria-label` ; `components.js` le met à jour (Lecture /
  Pause, Couper / Activer le son).
- **Modales.** Focus déplacé à l'ouverture, piégé (Tab / Maj+Tab), rendu au déclencheur à
  la fermeture ; Échap ferme ; défilement de la page bloqué.
- **Onglets.** `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-selected` tenu à
  jour.
- **Clavier.** Rangées de playlist focusables (Entrée / Espace) ; visionneuse ← / → ;
  vidéo Espace/K, F, M, ← / →.
- **Mouvement.** `prefers-reduced-motion` fige l'égaliseur.
- **Cible tactile.** Boutons icône 40 à 44px (`--icon-btn`).
- **État de lecture.** Triple signal (fond + numéro + titre) : ne dépend pas de la seule
  couleur.

---

## 9. Thèmes

Un thème ne touche **ni les composants, ni les classes** : il déclare ses rôles nommés et
ses trois triplets RGB. Les styleguides `/conjugarium`, `/surhumains`, `/observatoire`
rejouent toute la documentation dans chaque thème.

### Conjugarium

Dérivé de `clapeditions.fr/bienvenueauconjugarium-audio`. Respiration lavande
(`#EFEEFA`), registre du conte illustré : **nuages**, Simply Olive pour les titres (tailles
montées d'un cran, `--heading-weight: 400`), rose pochette `#F4B0CF` en accent,
`--accent-ink` `#A62A60`, pervenche `#C9C8FB` en `--surface-alt`, `--wave-h` 90px.

### Surhumains

Dérivé de `clapeditions.fr/surhumains`. Registre documentaire : titres et corps sans
écriture manuscrite (Avenir Heavy), bleu électrique `#3333CB` en `--primary` (8,1:1 sur le
fond), bleu profond `#2626A8` pour la bande inversée, rose corail `#F98FA5` en accent
(`--accent-ink` `#B0234A`, 6,3:1), menthe `#9EEFDF` en `--surface-alt`. Séparateur
**flammes** relevé sur le site (`--divider-repeat` 1440px, `--wave-h` 105px).

### L'Observatoire des Mots

Podcast de grammaire en docu-fiction. Violet foncé `#33236B` pour l'autorité, orange vif
`#EA571B` pour les interactions (`--on-accent` blanc, `--accent-ink` `#B53F0E`, 5,8:1), rose
`#F4B0CF` en `--surface-alt`. Coulures, Avenir Heavy.

### Écrire un nouveau thème

Créer `themes/mon-projet.css` :

```css
:root { /* primitives : couleurs brutes, préfixe propre au projet */ --mp-ink: #…; }

:root[data-theme="mon-projet"],
[data-theme="mon-projet"] {
  --_ink-rgb: R, G, B;       /* → rampe de texte, bordures, voiles */
  --_accent-rgb: R, G, B;    /* → accent-soft / ring / glow / faint */
  --_shadow-rgb: R, G, B;    /* → ombres et voiles de média */

  --primary: #…;  --primary-hover: #…;  --on-primary: #…;
  --surface: #…;  --surface-raised: #…;  --surface-sunken: #…;  --surface-alt: #…;
  --surface-invert: #…;  --surface-invert-raised: #…;
  --accent: #…;   --accent-hover: #…;   --accent-ink: #…;  --on-accent: #…;

  --font-heading: '…';  --font-display: '…';  --heading-weight: 800;
  --heading-lh: 1;  --heading-ls: normal;

  --divider-shape: var(--shape-drips);  --divider-repeat: 720px;  --divider-repeat-mobile: 260px;
}
```

Puis : un styleguide `mon-projet.html` (copie d'un existant, meta de partage statiques),
ses routes dans `firebase.json`, un lien dans le sélecteur de thème des styleguides et des
layouts, une colonne dans les tableaux du § 2.

Vérifications avant de le déclarer fini :

1. `--on-accent` sur `--accent` ≥ 4,5:1 (texte des boutons).
2. `--accent-ink` sur `--surface` et `--surface-alt` ≥ 4,5:1.
3. `--primary` sur `--surface` ≥ 7:1 (titres et texte).
4. `--accent` sur `--surface` ≥ 3:1 (état actif, bordures).

---

## 10. Licence des polices

| Police | Statut | Portée |
|---|---|---|
| **Lexend** | SIL Open Font License | Libre, y compris commercial. Google Fonts. |
| **Gaegu** | SIL Open Font License | Libre, y compris commercial. Google Fonts. |
| **Avenir Heavy** | Licence propriétaire | Fichier local. Vérifier que la licence du studio couvre le webfont. |
| **Simply Olive** | ⚠️ **PERSONAL USE ONLY** | Voir ci-dessous. |

> **⚠️ Simply Olive n'est pas licenciée pour un usage public.** Le fichier fourni est une
> version DEMO (métadonnées `PERSONAL USE ONLY!`, auteur Ali Hamidi) — et elle n'a pas de
> chiffres. Elle convient pour maquetter, **pas** pour un site en ligne. Pour la production :
> acquérir la licence webfont et remplacer `assets/fonts/simply-olive.woff2`, ou changer
> `--font-heading` / `--font-display` dans `themes/conjugarium.css`. Pile de repli :
> `'Simply Olive', 'Gaegu', cursive`.

---

## 11. Historique

- **2026-09-18** — Extraction depuis `conjugarium-minisite/` ; couche sémantique ;
  séparateurs en `mask-image` ; `--accent-ink` ; renversement en clair (le navy devient
  `--primary`, une seule bande inversée) ; rampe de texte ramenée à quatre paliers ;
  `/conjugarium` devient un fichier HTML distinct pour ses meta de partage.
- **2026-09-30** — Thèmes Surhumains et Observatoire ; dérivations par triplets RGB ;
  galerie vidéo, planches de BD et lightbox.
- **2026-10-15** — Remise en cohérence et layouts média :
  - dérivations rapatriées dans `tokens.css` (suppression de `themes/_base.css`, qui
    laissait les tokens dérivés invalides sur `/clap`) ; `--surface-alt` ; plus aucune
    valeur en dur dans `components.css` ; suppression des alias de compatibilité et des
    copies figées `clap/` et `conjugarium/` ;
  - composants média (`.cl-modal`, `.cl-viewer`, `.cl-chapters`, `.cl-vplayer`,
    `.cl-memo`, `.cl-qr`…) et `components.js` étendu (audio, vidéo, visionneuse, onglets,
    QR, sprite d'icônes) ;
  - `layouts/podcast.html`, `layouts/musee.html`, `layouts/video.html`, d'après les
    prototypes Surhumains, Germain l'Auxerrois et Karaoké du Conjugarium.

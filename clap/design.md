# Clap ! Studio — Design System

Système de design pour les minisites, pages de pack pédagogique et landing pages du
studio. Ce document est autonome : il ne suppose la lecture d'aucun autre fichier.

> Il existe une variante de ce système pour l'univers **Le Conjugarium**, dans le dossier
> voisin `conjugarium/` (son propre `design.md`, ses propres `tokens.css` /
> `components.css` / assets). Les deux dossiers sont indépendants — aucun fichier partagé,
> aucune référence croisée — pour pouvoir être versés séparément dans un outil comme
> Google Stitch, un l'un sans l'autre.

## Fichiers de ce dossier

Ce dossier est **autonome** : tout ce dont il a besoin est à l'intérieur, rien ne pointe
vers un fichier du dossier `conjugarium/` voisin ni vers un niveau supérieur.

| Fichier | Rôle |
|---|---|
| `design.md` | Ce document |
| `tokens.css` | Variables CSS — source de vérité des valeurs |
| `components.css` | Composants prêts à l'emploi, préfixés `.cl-` |
| `index.html` | Styleguide visuel, autoporté |
| `assets/fonts/avenir-heavy.woff2` | Police de titre du registre pro |
| `assets/clap-logo.png` | Logo du studio |

## Démarrage

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Gaegu:wght@700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="./tokens.css" />
<link rel="stylesheet" href="./components.css" />
```

Pour un projet Vite/React : copier `tokens.css` + `components.css` dans `src/styles/`,
importer les deux dans `main.tsx`, déplacer `avenir-heavy.woff2` dans `public/fonts/`
(ajuster le chemin du `@font-face` en conséquence).

---

## 1. Principes

**Le système est clair ; le sombre est une rupture.** Le fond principal est blanc : c'est
lui qui domine la page. Le navy (`#0D1B2E`) n'est pas un fond, c'est `--primary`, une
couleur de **contenu** — titres, texte, boutons pleins. Il ne devient fond que sur **une**
bande par page, `.cl-section-invert`, pour le moment fort : le lecteur intégral, une mise en
avant. Deux bandes sombres et la rupture ne rompt plus rien.

**Une zone inversée ne duplique aucun composant.** `.cl-invert` redéclare la rampe de texte,
les bordures et les voiles pour tout son sous-arbre ; les composants à l'intérieur sont
exactement les mêmes qu'à l'extérieur. Il n'existe pas de variante sombre à maintenir.

**Le jaune est un signal, pas une décoration.** `--accent` (`#FFD100`) marque ce qui est
cliquable ou en cours de lecture. Une zone visible ne contient qu'un seul bouton d'accent
plein. Il n'est jamais fond de texte long — seules exceptions : le pied de page et le
lecteur audio, deux blocs courts et volontairement tranchés. En **texte** sur fond clair, il
ne passe pas le contraste AA : c'est `--accent-ink` (`#7A6000`) qui prend le relais.

**Deux registres de titre.** `--font-heading` (Gaegu, manuscrite) pour les pages publiques
destinées aux enfants et familles ; `--font-display` (Avenir Heavy, sobre) pour les pages
pro ou à accès protégé.

**Les séparateurs sont la signature.** Chaque changement de couleur de fond passe par un
`.cl-wave` en forme de coulures de peinture. Jamais de bord droit entre deux sections.

**Mobile = un seul point de rupture.** `@media (max-width: 600px)`. Le pattern est constant :
les rangées horizontales passent en colonne et se centrent, les détails secondaires
disparaissent plutôt que de se tasser.

**Le retour au survol est toujours le même.** Un `scale` léger (1.02 à 1.1 selon la taille)
plus un éclaircissement. Pas de changement de teinte, pas d'ombre animée.

---

## 2. Tokens

Toutes les valeurs sont dans `tokens.css`. Ne jamais écrire une couleur ou un rayon en dur
dans un composant : toujours passer par un token.

Les tokens sont en deux couches :

1. **Primitives** — `--clap-navy`, `--clap-yellow`… Les couleurs brutes de la marque.
   Aucun composant ne les lit jamais directement.
2. **Sémantiques** — `--surface`, `--accent`, `--text-1`… Les *rôles*. C'est la seule
   couche que lisent les composants.

### Couleur principale et surfaces

| Token | Valeur | Usage |
|---|---|---|
| `--primary` | `#0D1B2E` | **Titres, texte, boutons pleins.** Pas un fond de page. |
| `--primary-hover` | `#17293F` | Survol de `.cl-btn--primary` |
| `--on-primary` | `#FFFFFF` | Posé sur `--primary` |
| `--surface` | `#FFFFFF` | **Fond principal de la page** |
| `--surface-raised` | `#F6F7F9` | Cartes, playlist, pills |
| `--surface-sunken` | `#F0F2F5` | Champs de saisie |
| `--surface-invert` | `#0D1B2E` | La bande de rupture sombre, une par page |
| `--surface-invert-raised` | `#162235` | Cartes à l'intérieur de la bande sombre |

### Accent

| Token | Valeur | Usage |
|---|---|---|
| `--accent` | `#FFD100` | Aplats : boutons, badges, état actif, lecteur |
| `--accent-hover` | `#FFE033` | Survol de toute surface d'accent |
| `--accent-ink` | `#7A6000` | **Accent en texte, sur fond clair** (6,0:1 sur blanc) |
| `--on-accent` | `#1A1A1A` | Texte et icônes posés SUR l'accent |
| `--on-accent-muted` | `rgba(0,0,0,.55)` | Texte secondaire sur l'accent |
| `--on-accent-faint` | `rgba(0,0,0,.45)` | Texte tertiaire sur l'accent |

Déclinaisons en opacité : `--accent-soft` (fond de rangée active), `--accent-ring` (halo de
focus), `--accent-glow` / `--accent-glow-lg` (ombres portées), `--accent-faint` (bordure
au survol).

> **Pourquoi `--accent-ink` existe.** Le jaune de marque plafonne à 1,46:1 sur blanc, très
> loin des 4,5:1 qu'exige AA pour du texte. Il est donc réservé aux **aplats**, où c'est
> `--on-accent` qui porte la lisibilité. Dès que l'accent doit devenir du **texte** sur fond
> clair, on passe à `--accent-ink`, assombri jusqu'à franchir AA. Composants concernés :
> `.cl-tagline__accent`, `.cl-section-title__accent`, `.cl-meta`, `.cl-row--active .cl-row__title`.

### Couleurs d'état

`--danger` `#F87171` (erreurs de formulaire, action de déconnexion au survol) ·
`--success` `#34D399` + `--success-bg` / `--success-border` (badge d'accès vérifié).

### Rampe de texte

Le texte s'atténue par opacité sur la surface courante. **Quatre paliers, pas davantage**,
chacun calé sur un seuil de contraste mesuré :

| Token | Contraste garanti | Usage |
|---|---|---|
| `--text-1` | ~16:1 | Titres, titres de piste, libellés forts |
| `--text-2` | ~10:1 | Corps de texte, descriptions |
| `--text-3` | **4,5:1** | Tags, légendes, description de piste — plancher AA |
| `--text-4` | **3:1** | Numéros de piste, icônes de champ — information redondante uniquement |

Ces quatre tokens basculent en bloc dans une zone `.cl-invert` (voir § 3, Zone inversée).
Un composant ne sait donc jamais s'il est sur fond clair ou sombre : il demande `--text-2`,
il obtient la bonne valeur. `--text-4` ne passe pas AA et c'est assumé : réservé à ce qui
est déjà porté par un élément voisin, jamais à une information unique.

### Bordures et voiles

`--border-subtle` bordure de carte et de champ · `--border-hairline` filet entre rangées de
playlist · `--border-strong` bordure des boutons ghost · `--overlay-hover` survol de rangée ·
`--accent-soft` rangée en lecture · `--chip-bg` / `--chip-border` fond des tags. Relatifs à
la surface courante, ils basculent eux aussi dans `.cl-invert`.

### Typographie

| Token | Police | Usage |
|---|---|---|
| `--font-body` | **Lexend** 400→700 (Google Fonts) | Corps de texte, boutons, champs. Jamais remplacée : choisie pour sa lisibilité chez les lecteurs débutants. |
| `--font-heading` | **Gaegu** 700 (Google Fonts) | Titres des pages publiques. Registre enfant. |
| `--font-display` | **Avenir Heavy** 800 (fichier local) | Titres des pages pro / protégées et titres de carte. |

Tailles : `--fs-xs` .72 · `--fs-sm` .8 · `--fs-base` .95 · `--fs-md` 1 · `--fs-lg` 1.2 ·
`--fs-xl` 1.4 rem. Titres fluides : `--fs-title-fun` `clamp(2rem, 5vw, 3.5rem)` (Gaegu),
`--fs-title-pro` `clamp(1.8rem, 5vw, 2.8rem)` (Avenir), `--fs-title-section`.

Interlignes : `--lh-tight` 1.15 (titres) · `--lh-normal` 1.5 (taglines) ·
`--lh-relaxed` 1.7 (descriptions) · `--lh-loose` 1.8 (texte long).

### Espacement

Échelle en rem, multiples de 0.25 : `--sp-1` .25 → `--sp-16` 4rem
(1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16). Padding de carte `--sp-6 --sp-8`, padding de rangée
`--sp-4 --sp-5`, gap de hero `--sp-10`, padding de section sombre `--sp-12` en haut.

### Rayons

`--r-xs` 4px (tags) · `--r-sm` 5px · `--r-md` 14px (champs) · `--r-lg` 16px (playlist,
icône de bannière) · `--r-xl` 20px (cartes, pochettes) · `--r-2xl` 24px (carte d'auth,
lecteur mobile) · `--r-pill` 50px (boutons, badges, pills, recherche) ·
`--r-round` 50 % (boutons icône). Règle : plus la surface est grande, plus le rayon est
doux. Tout objet interactif et compact est en pill.

### Ombres

Sur fond clair, une ombre forte salit : elles sont volontairement basses.
`--shadow-card` cartes · `--shadow-modal` carte d'authentification · `--shadow-cover`
pochette de projet · `--shadow-player` lecteur flottant · `--shadow-accent` /
`--shadow-accent-lg` halo sous les surfaces d'accent · `--ring-focus` halo de focus.

### Transitions

`--t-fast` 0.15s (survol, transform) · `--t-base` 0.2s (couleur, bordure, fond).

### Séparateur de section

`--divider-shape` porte la forme (coulures de peinture) en `mask-image`. `--divider-repeat`
règle sa densité — la largeur d'*un* motif, donc `50%` en donne deux sur la largeur.
`--wave-h` 75px / `--wave-h-mobile` 50px.

### Layout

`--content-max` 820px (colonne principale) · `--prose-max` 620px (texte long) ·
`--card-max` 520px (carte d'auth) · `--player-max` 760px · `--player-h` 100px (spacer).

---

## 3. Composants

Tous préfixés `.cl-`. Le styleguide (`index.html` de ce dossier) montre chacun d'eux
en contexte.

### Layout

`.cl-page` colonne pleine hauteur · `.cl-section` / `.cl-section-dark` section de contenu
(fond `--surface` par défaut) · `.cl-section-light` section claire · `.cl-container`
colonne 820px centrée · `.cl-prose` colonne 620px centrée pour le texte ·
`.cl-player-spacer` à placer en fin de page dès que le lecteur flottant est monté.

### Zone inversée

`.cl-invert` (ou `.cl-section-invert`, ou `.cl-section-dark`) redéclare `--surface`,
`--surface-raised`, la rampe de texte (`--text-1..4`), les bordures et `--primary` /
`--on-primary` pour tout son sous-arbre. Une seule par page — la bande de rupture.

```html
<section class="cl-section-invert">   <!-- ou class="cl-invert" sur n'importe quel bloc -->
  <ul class="cl-playlist">…</ul>      <!-- composants inchangés à l'intérieur -->
</section>
```

### Entête et pied de page

`.cl-header` logo centré + tagline sur deux lignes, le second membre en
`.cl-tagline__accent` (accent-ink, 700). `.cl-footer` bloc d'accent plein : tagline, lien
de contact souligné par une bordure de 2px, mention légale.

### Séparateurs — `.cl-wave`

La forme est appliquée en `mask-image` ; les couleurs se posent par instance, en CSS pur.

```html
<!-- --wave-from = section qui précède, --wave-to = section qui suit -->
<div class="cl-wave" style="--wave-from: var(--surface); --wave-to: var(--surface-invert)"></div>
```

`mask-size` (piloté par `--divider-repeat`) + `repeat-x` → deux motifs sur desktop, trois
sous 600px, pour garder des gouttes de taille constante quelle que soit la largeur d'écran.
Le SVG source fait 1920 unités de large, calé sur son bord bas.

### Titres

`.cl-title-fun` (Gaegu) page publique · `.cl-title-pro` (Avenir Heavy) page protégée ·
`.cl-section-title` titre de section, avec `.cl-section-title__accent` pour passer un
fragment en accent-ink · `.cl-text` paragraphe long · `.cl-desc` description.

### Boutons

| Classe | Usage |
|---|---|
| `.cl-btn` | Action principale, accent plein, pill. Une seule par zone visible. |
| `.cl-btn--primary` | Action sobre en couleur principale (navy plein), sans accent |
| `.cl-btn--lg` | Variante bannière |
| `.cl-btn--block` | Pleine largeur, dans un formulaire |
| `.cl-btn--ghost` | Action secondaire ou destructive ; passe en `--danger` au survol |
| `.cl-icon-btn` | Rond 44px en accent — lecture / pause |
| `.cl-icon-btn--outline` | Rond 40px contour — téléchargement ; passe en accent au survol |

### Badges

`.cl-badge` en accent, majuscules, `letter-spacing: 2px` — qualifie le type d'œuvre ·
`.cl-badge--ghost` gris translucide — qualifie une ressource secondaire ·
`.cl-badge--success` vert — confirme un état · `.cl-meta` texte accent-ink en majuscules
espacées, pour un décompte (« 9 épisodes »).

### Cartes

`.cl-card` base sur `--surface-raised`. `.cl-card--accent` ajoute une bordure d'accent de
2px : une seule carte accentuée par page, celle qu'on veut voir en premier.
`.cl-card--auth` carte d'authentification centrée, plus large en padding.

`.cl-banner` se combine à `.cl-card` pour le pattern « icône + texte à gauche, action à
droite » : `.cl-banner__left` > `.cl-banner__icon` (carré 60px à coins `--r-lg`) +
`.cl-banner__title` / `.cl-banner__subtitle`. Passe en colonne sous 600px.

### Hero projet

`.cl-hero` = pochette carrée 180px (`.cl-hero__cover`, `--r-xl` + `--shadow-cover`) +
colonne d'infos. `.cl-hero__badges` aligne les badges sur une ligne ; un `.cl-btn--ghost`
placé dedans est poussé à droite par `margin-left: auto`. Sous 600px : colonne centrée,
pochette à 160px.

### Formulaires

`.cl-form` colonne à gap `--sp-5`. `.cl-field` positionne `.cl-field__icon` en absolu à
gauche du `.cl-input` (padding gauche de 3.25rem réservé). Le champ est en creux
(`--surface-sunken`) par rapport à la carte qui le contient. Focus : bordure `--accent` +
`--ring-focus`, jamais l'outline navigateur. `.cl-error` message d'erreur en `--danger`.

`.cl-search` + `.cl-search__input` : variante pill de la même logique.

### Filtres

`.cl-controls` barre `space-between` qui wrappe : recherche à gauche, `.cl-pills` à droite.
`.cl-pill` inactive sur `--surface-raised`, `.cl-pill--active` en accent plein.

### Playlist

Le composant central. `.cl-playlist` est un `<ul>` à `overflow: hidden` et `--r-lg` : les
rangées sont collées, séparées par un filet `--border-hairline`.

Chaque `.cl-row` : `.cl-row__num` (28px, numéro au repos, icône note animée par `.cl-pulse`
en lecture) · `.cl-row__info` avec `.cl-row__titleline` (titre + `.cl-row__tag` optionnel)
et `.cl-row__desc` (ellipsée, masquée sous 600px) · `.cl-row__actions` (play + download).

`.cl-row--active` signale la lecture sur trois canaux simultanés : fond `--accent-soft`,
numéro en `--accent-ink`, titre en `--accent-ink`. `.cl-empty` pour la liste vide.

### Lecteur flottant

`.cl-player` en `position: fixed`, centré, largeur `min(760px, 100vw - 32px)`, accent
plein, rayon 100px. Structure : `.cl-player__play` (rond `--primary` 48px, icône accent) ·
`.cl-player__meta` (titre ellipsé + `.cl-player__progress` = temps / `.cl-range` / temps) ·
`.cl-player__side` (volume). Le `.cl-range` a une poignée de 32px. Sous 600px : rayon
`--r-2xl` et `.cl-player__side` masqué.

**Toujours** ajouter `.cl-player-spacer` en fin de page quand le lecteur est monté.

---

## 4. Gabarits de page

### Page publique

```html
<div class="cl-page">
  <header class="cl-header">…</header>
  <div class="cl-wave" style="--wave-from:var(--surface); --wave-to:var(--surface-invert)"></div>
  <main class="cl-section-invert cl-invert">
    <div class="cl-container">
      <div class="cl-hero">…</div>     <!-- titre en .cl-title-fun -->
      <ul class="cl-playlist">…</ul>
      <a class="cl-btn">Télécharger</a>
    </div>
  </main>
  <div class="cl-wave" style="--wave-from:var(--surface-invert); --wave-to:var(--surface)"></div>
  <section class="cl-section-light">
    <div class="cl-prose">…</div>
  </section>
  <footer class="cl-footer">…</footer>
  <div class="cl-player-spacer"></div>
</div>
```

### Page protégée (pack, ressources)

Sans entête ni pied de page, sans lien sortant. Titres en `.cl-title-pro`. Ordre
canonique : hero → carte accentuée (téléchargement global) → cartes de ressources →
contrôles → playlist. Peut rester sur `--surface` claire, ou passer en `.cl-invert` si
tout le registre doit être sombre.

```html
<div class="cl-page">
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

La porte d'accès affiche `.cl-card--auth` seule sur la page, centrée, à la place de tout
le contenu.

---

## 5. Icônes

Le minisite d'origine utilise **[Phosphor Icons](https://phosphoricons.com/)**
(`@phosphor-icons/react`), poids `regular` pour l'ornement et `fill` pour play / pause.

Correspondances : `Play` / `Pause` (lecteur, rangées) · `MusicNote` (rangée en lecture) ·
`DownloadSimple` (téléchargements) · `Key` / `Lock` (authentification) ·
`MagnifyingGlass` (recherche) · `SpeakerHigh` (volume) · `CheckCircle` (accès vérifié).

---

## 6. Accessibilité

- **Contrastes.** Les quatre paliers de texte sont calés sur des seuils mesurés :
  `--text-3` est au plancher AA (4,5:1), `--text-4` est à 3:1 et **ne passe pas** AA pour
  du texte — réservé à l'information redondante, jamais à une information unique.
- **Accent en texte.** Ne jamais poser `--accent` comme couleur de texte sur fond clair :
  utiliser `--accent-ink`.
- **Boutons.** `--on-accent` sur l'accent et `--on-primary` sur le primary dépassent 10:1.
- **Focus.** Les champs ont un focus visible (`--ring-focus`). Ajouter un `:focus-visible`
  explicite sur `.cl-btn`, `.cl-icon-btn` et `.cl-pill` pour toute nouvelle page.
- **Boutons icône.** Toujours un `aria-label` : les composants ne portent aucun texte.
- **Cible tactile.** Boutons icône 40 à 44px, poignées de range 32px : conserver ces
  dimensions.
- **État de lecture.** Le triple signal (fond + numéro + titre) évite de dépendre de la
  seule couleur.

---

## 7. Licence des polices

| Police | Statut | Portée |
|---|---|---|
| **Lexend** | SIL Open Font License | Libre, y compris commercial. Servie par Google Fonts. |
| **Gaegu** | SIL Open Font License | Libre, y compris commercial. Servie par Google Fonts. |
| **Avenir Heavy** | Licence propriétaire | Fichier local. Vérifier que la licence du studio couvre le webfont. |

---

## 8. Source et historique

Extrait le 2026-09-18 du minisite Conjugarium d'origine (feuilles de style de sa page
publique et de sa page de pack pédagogique), en fusionnant les composants dupliqués entre
les deux pages et en reconnectant les valeurs en dur aux variables.

Passe du 2026-09-18 : **renversement en clair**. Le fond principal passe du navy au blanc,
le navy devient `--primary` (contenu) et le fond de la seule bande `.cl-section-invert`.
La rampe de texte est ramenée de six paliers à quatre, chacun calé sur un seuil de
contraste mesuré et relatif à la surface courante, ce qui supprime les variantes sombres
des composants.

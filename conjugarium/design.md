# Conjugarium — Design System

Système de design pour l'univers **Bienvenue au Conjugarium** (Clap ! Éditions) : le
minisite, la page de pack pédagogique, toute page dérivée de cet univers. Ce document
est autonome : il ne suppose la lecture d'aucun autre fichier.

> Ce système est une variante du design system **Clap ! Studio**, dans le dossier voisin
> `clap/` (son propre `design.md`, ses propres `tokens.css` / `components.css` / assets).
> Les deux dossiers sont indépendants — aucun fichier partagé, aucune référence croisée —
> pour pouvoir être versés séparément dans un outil comme Google Stitch, l'un sans l'autre.
> Ils partagent le même **contrat de composants** (`.cl-*`, mêmes classes, même anatomie) :
> seules les valeurs des tokens et deux polices changent.

## Fichiers de ce dossier

Ce dossier est **autonome** : tout ce dont il a besoin est à l'intérieur, rien ne pointe
vers un fichier du dossier `clap/` voisin ni vers un niveau supérieur.

| Fichier | Rôle |
|---|---|
| `design.md` | Ce document |
| `tokens.css` | Variables CSS — source de vérité des valeurs |
| `components.css` | Composants prêts à l'emploi, préfixés `.cl-` |
| `index.html` | Styleguide visuel, autoporté |
| `assets/fonts/simply-olive.woff2` | Police de titre — ⚠️ voir § 7, Licence |
| `assets/conjugarium-cover.jpg` | Pochette de l'œuvre, image de partage |
| `assets/clap-logo.png` | Logo du studio (démo du composant d'entête) |

## Démarrage

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="./tokens.css" />
<link rel="stylesheet" href="./components.css" />
```

Pas de Google Fonts pour le titrage : Simply Olive est servie localement depuis
`assets/fonts/`, avec Gaegu en repli si elle ne charge pas (voir § 7).

Pour un projet Vite/React : copier `tokens.css` + `components.css` dans `src/styles/`,
importer les deux dans `main.tsx`, déplacer `assets/fonts/` dans `public/fonts/` (ajuster
le chemin du `@font-face` en conséquence).

---

## 1. Principes

**Le système est clair ; le sombre est une rupture.** Le fond principal est la lavande
pâle (`#EFEEFA`) : c'est elle qui domine la page. La nuit (`#0E172A`) n'est pas un fond,
c'est `--primary`, une couleur de **contenu** — titres, texte, boutons pleins. Elle ne
devient fond que sur **une** bande par page, `.cl-section-invert`, pour le moment fort :
le lecteur intégral. Deux bandes sombres et la rupture ne rompt plus rien.

**Une zone inversée ne duplique aucun composant.** `.cl-invert` redéclare la rampe de
texte, les bordures et les voiles pour tout son sous-arbre ; les composants à l'intérieur
sont exactement les mêmes qu'à l'extérieur. Il n'existe pas de variante sombre à
maintenir.

**Le rose est un signal, pas une décoration.** `--accent` (`#F4B0CF`, la couleur de la
pochette) marque ce qui est cliquable ou en cours de lecture. Une zone visible ne contient
qu'un seul bouton d'accent plein. Il n'est jamais fond de texte long. En **texte** sur
fond clair, il ne passe pas le contraste AA : c'est `--accent-ink` (`#A62A60`) qui prend
le relais.

**Une seule police de titre, deux registres.** Simply Olive tient à la fois le registre
public (`--font-heading`) et le registre pro (`--font-display`) — à la différence du
système Clap ! Studio, qui distingue Gaegu et Avenir Heavy. N'ayant qu'une graisse, elle
ne force jamais de faux gras (`--heading-weight: 400`).

**Les nuages sont la signature.** Chaque changement de couleur de fond passe par un
`.cl-wave` en forme de nuages — la silhouette du site de référence
`clapeditions.fr/bienvenueauconjugarium-audio`. Jamais de bord droit entre deux sections.

**Mobile = un seul point de rupture.** `@media (max-width: 600px)`. Le pattern est
constant : les rangées horizontales passent en colonne et se centrent, les détails
secondaires disparaissent plutôt que de se tasser.

**Le retour au survol est toujours le même.** Un `scale` léger (1.02 à 1.1 selon la
taille) plus un éclaircissement. Pas de changement de teinte, pas d'ombre animée.

---

## 2. Tokens

Toutes les valeurs sont dans `tokens.css`. Ne jamais écrire une couleur ou un rayon en
dur dans un composant : toujours passer par un token.

Les tokens sont en deux couches :

1. **Primitives** — `--cjg-navy`, `--cjg-pink`… Les couleurs brutes de la palette.
   Aucun composant ne les lit jamais directement.
2. **Sémantiques** — `--surface`, `--accent`, `--text-1`… Les *rôles*. C'est la seule
   couche que lisent les composants.

### Couleur principale et surfaces

| Token | Valeur | Usage |
|---|---|---|
| `--primary` | `#0E172A` | **Titres, texte, boutons pleins.** Pas un fond de page. |
| `--primary-hover` | `#1B2540` | Survol de `.cl-btn--primary` |
| `--on-primary` | `#EFEEFA` | Posé sur `--primary` |
| `--surface` | `#EFEEFA` | **Fond principal de la page** — lavande pâle |
| `--surface-raised` | `#FFFFFF` | Cartes, playlist, pills |
| `--surface-sunken` | `#FFFFFF` | Champs de saisie |
| `--surface-invert` | `#0E172A` | La bande de rupture sombre, une par page |
| `--surface-invert-raised` | `#1B2540` | Cartes à l'intérieur de la bande sombre |

### Accent

| Token | Valeur | Usage |
|---|---|---|
| `--accent` | `#F4B0CF` | Aplats : boutons, badges, état actif, lecteur |
| `--accent-hover` | `#F8C5DC` | Survol de toute surface d'accent |
| `--accent-ink` | `#A62A60` | **Accent en texte, sur fond clair** (5,9:1 sur la lavande) |
| `--on-accent` | `#0E172A` | Texte et icônes posés SUR l'accent |
| `--on-accent-muted` | `rgba(14,23,42,.62)` | Texte secondaire sur l'accent |
| `--on-accent-faint` | `rgba(14,23,42,.48)` | Texte tertiaire sur l'accent |

Déclinaisons en opacité : `--accent-soft` (fond de rangée active), `--accent-ring` (halo
de focus), `--accent-glow` / `--accent-glow-lg` (ombres portées), `--accent-faint`
(bordure au survol).

> **Pourquoi `--accent-ink` existe.** Le rose plafonne à 1,53:1 sur la lavande, très loin
> des 4,5:1 qu'exige AA pour du texte. Il est donc réservé aux **aplats**, où c'est
> `--on-accent` qui porte la lisibilité. Dès que l'accent doit devenir du **texte** sur
> fond clair, on passe à `--accent-ink`, assombri jusqu'à franchir AA. Composants
> concernés : `.cl-tagline__accent`, `.cl-section-title__accent`, `.cl-meta`,
> `.cl-row--active .cl-row__title`.

### Couleur secondaire hors token

Le site de référence alterne **deux** fonds clairs : la lavande pâle (`--surface`) et un
bleu-lavande plus saturé (`#C9C8FB`), utilisé pour le bandeau principal du site. N'ayant
pas d'équivalent générique dans le contrat de composants, il est exposé comme utilitaire
plutôt que comme token :

```css
.cjg-section-periwinkle { background: var(--cjg-periwinkle); } /* #C9C8FB */
```

### Couleurs d'état

`--danger` `#D92D20` (erreurs de formulaire) · `--success` `#067647` + `--success-bg` /
`--success-border` (badge d'accès vérifié). En zone `.cl-invert`, ils basculent
automatiquement vers des teintes plus vives (`#F87171` / `#34D399`) adaptées au fond
sombre.

### Rampe de texte

Le texte s'atténue par opacité sur la surface courante. **Quatre paliers, pas
davantage**, chacun calé sur un seuil de contraste mesuré :

| Token | Contraste garanti | Usage |
|---|---|---|
| `--text-1` | ~16:1 | Titres, titres de piste, libellés forts |
| `--text-2` | ~10:1 | Corps de texte, descriptions |
| `--text-3` | **4,5:1** | Tags, légendes, description de piste — plancher AA |
| `--text-4` | **3:1** | Numéros de piste, icônes de champ — information redondante uniquement |

Ces quatre tokens basculent en bloc dans une zone `.cl-invert`. Un composant ne sait donc
jamais s'il est sur fond clair ou sombre : il demande `--text-2`, il obtient la bonne
valeur. `--text-4` ne passe pas AA et c'est assumé : réservé à ce qui est déjà porté par
un élément voisin, jamais à une information unique.

### Bordures et voiles

`--border-subtle` bordure de carte et de champ · `--border-hairline` filet entre rangées
de playlist · `--border-strong` bordure des boutons ghost · `--overlay-hover` survol de
rangée · `--accent-soft` rangée en lecture · `--chip-bg` / `--chip-border` fond des tags.
Relatifs à la surface courante, ils basculent dans `.cl-invert`.

### Typographie

| Token | Police | Usage |
|---|---|---|
| `--font-body` | **Lexend** 400→700 (Google Fonts) | Corps de texte, boutons, champs. Jamais remplacée. |
| `--font-heading` | **Simply Olive** (repli Gaegu) | Titres des pages publiques. |
| `--font-display` | **Simply Olive** (repli Avenir Heavy, Lexend) | Titres des pages pro / protégées et titres de carte. |

Simply Olive n'a qu'une graisse : `--heading-weight: 400` empêche tout faux gras
synthétique sur les titres qui, chez Clap ! Studio, seraient en 800. Les tailles sont
remontées d'un cran par rapport au système de base (`--fs-title-fun` à
`clamp(2.4rem, 6vw, 4.2rem)`) car la police porte moins loin à taille égale.
`--heading-lh: 1.1` et `--heading-ls: 0.01em` s'appliquent uniformément aux quatre
classes de titre (`.cl-title-fun`, `.cl-title-pro`, `.cl-section-title`,
`.cl-banner__title`).

Tailles : `--fs-xs` .72 · `--fs-sm` .8 · `--fs-base` .95 · `--fs-md` 1 · `--fs-lg` 1.2 ·
`--fs-xl` 1.4 rem. Interlignes : `--lh-tight` 1.15 · `--lh-normal` 1.5 ·
`--lh-relaxed` 1.7 · `--lh-loose` 1.8 (texte long).

### Espacement

Échelle en rem, multiples de 0.25 : `--sp-1` .25 → `--sp-16` 4rem
(1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16).

### Rayons

`--r-xs` 4px (tags) · `--r-sm` 5px · `--r-md` 14px (champs) · `--r-lg` 16px (playlist,
icône de bannière) · `--r-xl` 20px (cartes, pochettes) · `--r-2xl` 24px (carte d'auth,
lecteur mobile) · `--r-pill` 50px (boutons, badges, pills) · `--r-round` 50 % (boutons
icône). Règle : plus la surface est grande, plus le rayon est doux.

### Ombres

La lavande pardonne encore moins qu'un blanc pur : ombres volontairement basses.
`--shadow-card` cartes · `--shadow-modal` carte d'authentification · `--shadow-cover`
pochette de projet · `--shadow-player` lecteur flottant · `--shadow-accent` /
`--shadow-accent-lg` halo sous les surfaces d'accent · `--ring-focus` halo de focus.

### Transitions

`--t-fast` 0.15s (survol, transform) · `--t-base` 0.2s (couleur, bordure, fond).

### Séparateur de section

`--divider-shape` porte la forme (nuages) en `mask-image`. `--divider-repeat: 70%` règle
sa densité — les nuages sont plus larges que les coulures de Clap ! Studio : comprimés à
la densité de référence (50 %) ils rapetissent, 70 % (110 % sous 600px) leur rend la
largeur du site d'origine. `--wave-h` 90px / `--wave-h-mobile` 60px — les nuages ont
besoin de plus de hauteur.

### Layout

`--content-max` 820px (colonne principale) · `--prose-max` 620px (texte long) ·
`--card-max` 520px (carte d'auth) · `--player-max` 760px · `--player-h` 100px (spacer).

---

## 3. Composants

Tous préfixés `.cl-`. Le styleguide (`index.html` de ce dossier) montre chacun d'eux en
contexte. **Le contrat de classes est identique** au système Clap ! Studio : un composant
construit pour l'un fonctionne à l'identique dans l'autre, seules les couleurs et les
polices changent.

### Layout

`.cl-page` colonne pleine hauteur · `.cl-section` / `.cl-section-dark` section de
contenu (fond `--surface` par défaut) · `.cl-section-light` section claire ·
`.cl-container` colonne 820px centrée · `.cl-prose` colonne 620px centrée pour le texte ·
`.cl-player-spacer` à placer en fin de page dès que le lecteur flottant est monté.

### Zone inversée

`.cl-invert` (ou `.cl-section-invert`, ou `.cl-section-dark`) redéclare `--surface`,
`--surface-raised`, la rampe de texte (`--text-1..4`), les bordures et `--primary` /
`--on-primary` pour tout son sous-arbre. Une seule par page — la bande de rupture, pour
le lecteur intégral.

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

La forme (nuages) est appliquée en `mask-image` ; les couleurs se posent par instance,
en CSS pur.

```html
<!-- --wave-from = section qui précède, --wave-to = section qui suit -->
<div class="cl-wave" style="--wave-from: var(--surface); --wave-to: var(--surface-invert)"></div>
```

`mask-size` (piloté par `--divider-repeat: 70%`) + `repeat-x` → un motif large sur
desktop, un motif et demi sous 600px (`110%`), pour garder des nuages ronds et proches du
site d'origine plutôt que resserrés ou aplatis. Le SVG source fait 1920 unités de large,
calé sur son bord bas.

### Titres

`.cl-title-fun` (Simply Olive) page publique · `.cl-title-pro` (Simply Olive) page
protégée · `.cl-section-title` titre de section, avec `.cl-section-title__accent` pour
passer un fragment en accent-ink · `.cl-text` paragraphe long · `.cl-desc` description.

### Boutons

| Classe | Usage |
|---|---|
| `.cl-btn` | Action principale, accent plein, pill. Une seule par zone visible. |
| `.cl-btn--primary` | Action sobre en couleur principale (nuit pleine), sans accent |
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
2px : une seule carte accentuée par page. `.cl-card--auth` carte d'authentification
centrée, plus large en padding.

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
gauche du `.cl-input`. Le champ est en creux (`--surface-sunken`) par rapport à la carte
qui le contient. Focus : bordure `--accent` + `--ring-focus`. `.cl-error` message
d'erreur en `--danger`.

`.cl-search` + `.cl-search__input` : variante pill de la même logique.

### Filtres

`.cl-controls` barre `space-between` qui wrappe : recherche à gauche, `.cl-pills` à
droite. `.cl-pill` inactive sur `--surface-raised`, `.cl-pill--active` en accent plein.

### Playlist

Le composant central. `.cl-playlist` est un `<ul>` à `overflow: hidden` et `--r-lg` : les
rangées sont collées, séparées par un filet `--border-hairline`.

Chaque `.cl-row` : `.cl-row__num` (28px, numéro au repos, icône note animée par
`.cl-pulse` en lecture) · `.cl-row__info` avec `.cl-row__titleline` (titre +
`.cl-row__tag` optionnel) et `.cl-row__desc` (ellipsée, masquée sous 600px) ·
`.cl-row__actions` (play + download).

`.cl-row--active` signale la lecture sur trois canaux simultanés : fond `--accent-soft`,
numéro en `--accent-ink`, titre en `--accent-ink`. `.cl-empty` pour la liste vide.

### Lecteur flottant

`.cl-player` en `position: fixed`, centré, largeur `min(760px, 100vw - 32px)`, accent
plein, rayon 100px. Structure : `.cl-player__play` (rond `--primary` 48px, icône accent) ·
`.cl-player__meta` (titre ellipsé + `.cl-player__progress`) · `.cl-player__side`
(volume). Sous 600px : rayon `--r-2xl` et `.cl-player__side` masqué.

**Toujours** ajouter `.cl-player-spacer` en fin de page quand le lecteur est monté.

---

## 4. Gabarits de page

### Page publique (minisite)

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

### Page protégée (pack pédagogique)

Sans entête ni pied de page, sans lien sortant. Titres en `.cl-title-pro`. Ordre
canonique : hero → carte accentuée (téléchargement global) → cartes de ressources →
contrôles → playlist.

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
- **Focus.** Les champs ont un focus visible (`--ring-focus`). Ajouter un
  `:focus-visible` explicite sur `.cl-btn`, `.cl-icon-btn` et `.cl-pill` pour toute
  nouvelle page.
- **Boutons icône.** Toujours un `aria-label` : les composants ne portent aucun texte.
- **Cible tactile.** Boutons icône 40 à 44px, poignées de range 32px.
- **État de lecture.** Le triple signal (fond + numéro + titre) évite de dépendre de la
  seule couleur.

---

## 7. Licence des polices

| Police | Statut | Portée |
|---|---|---|
| **Lexend** | SIL Open Font License | Libre, y compris commercial. Servie par Google Fonts. |
| **Gaegu** | SIL Open Font License | Repli de `--font-heading` si Simply Olive ne charge pas. Libre. |
| **Avenir Heavy** | Licence propriétaire | Repli de `--font-display`. Vérifier que la licence du studio couvre le webfont. |
| **Simply Olive** | ⚠️ **PERSONAL USE ONLY** | Voir ci-dessous. |

> **⚠️ Simply Olive n'est pas licenciée pour un usage public.** Le fichier fourni
> (`assets/fonts/simply-olive.woff2`) est converti depuis une version DEMO dont les
> métadonnées portent `PERSONAL USE ONLY!` (auteur : Ali Hamidi). Elle convient pour
> maquetter en local ou tester dans un outil de design comme Stitch, **pas** pour être
> servie depuis un site public, qui constitue une diffusion.
>
> Pour une mise en production, deux options :
> - acquérir la licence commerciale / webfont auprès de l'auteur, puis remplacer
>   `assets/fonts/simply-olive.woff2` par la version sous licence — aucun autre fichier à
>   toucher ;
> - ou changer `--font-heading` / `--font-display` dans `tokens.css` pour une police
>   libre au dessin proche.
>
> Le système dégrade proprement en attendant : la pile de repli est
> `'Simply Olive', 'Gaegu', cursive'`.

---

## 8. Source

Palette et nuages relevés le 2026-09-18 sur `clapeditions.fr/bienvenueauconjugarium-audio`.
Composants dérivés du design system Clap ! Studio (voir `clap/design.md`), en substituant
la palette, la typographie et la forme du séparateur.

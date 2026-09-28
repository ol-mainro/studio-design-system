# Clap ! Studio — Design System

Extrait du minisite **Le Conjugarium** (`conjugarium-minisite/`) pour réutilisation sur les
prochains projets : minisites d'œuvres, pages de pack pédagogique, landing pages.

Le système est **thémable** : un thème redéfinit des couleurs, des polices et la forme des
séparateurs sans qu'aucun composant ne change. Deux thèmes sont livrés — Clap ! Studio (par
défaut) et Conjugarium. Voir § 7.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `design.md` | Ce document : principes, tokens, anatomie des composants, règles d'usage |
| `tokens.css` | Variables CSS — **source de vérité** des valeurs de design |
| `components.css` | Composants prêts à l'emploi, préfixés `.cl-`, dépend de `tokens.css` |
| `themes/conjugarium.css` | Thème Conjugarium — ne redéfinit que la couche sémantique |
| `themes/surhumains.css` | Thème Surhumains — ne redéfinit que la couche sémantique |
| `index.html` | Styleguide, thème Clap ! Studio — sert `/clap` |
| `conjugarium.html` | Styleguide, thème Conjugarium — sert `/conjugarium`, ses propres meta de partage |
| `surhumains.html` | Styleguide, thème Surhumains — sert `/surhumains`, ses propres meta de partage |
| `assets/fonts/` | `avenir-heavy.woff2`, `simply-olive.woff2` |
| `assets/` | `clap-logo.png`, `conjugarium-cover.jpg`, `surhumains-cover.jpg` |

## Démarrage

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Gaegu:wght@700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="./tokens.css" />
<link rel="stylesheet" href="./components.css" />

<!-- facultatif : thème Conjugarium -->
<link rel="stylesheet" href="./themes/conjugarium.css" />
```

Le thème s'active en posant `data-theme="conjugarium"` sur `<html>` (ou sur n'importe
quel conteneur, pour n'habiller qu'une partie de la page).

### Le styleguide publié

Deux URLs, **deux fichiers HTML distincts** — pas une page partagée avec bascule par
script. Les métadonnées de partage (titre, description, Open Graph, Twitter Card) doivent
être présentes dans le HTML statique : les robots qui génèrent les aperçus de lien
(Facebook, Slack, iMessage, X…) ne l'exécutent pas, donc tout ce qui serait posé après coup
en JavaScript n'apparaît jamais dans un aperçu partagé.

| URL | Fichier | Thème |
|---|---|---|
| <https://clap-design-system.web.app/clap> | `index.html` | Clap ! Studio |
| <https://clap-design-system.web.app/conjugarium> | `conjugarium.html` | Conjugarium |
| <https://clap-design-system.web.app/surhumains> | `surhumains.html` | Surhumains |

Chaque thème a son URL dédiée ; la racine `/` redirige vers `/clap`, pour qu'il n'y ait
qu'une seule adresse canonique par thème. Les trois chemins sont servis par un *rewrite*
Firebase vers leur fichier respectif, et la variante à barre oblique finale est redirigée
en 301 vers la version sans barre — sans quoi les chemins relatifs des feuilles de style et
des polices ne résoudraient plus depuis la racine.

`conjugarium.html` et `surhumains.html` fixent leur thème en dur (pas de détection d'URL :
ils n'ont qu'un rôle) et portent leurs propres `<title>`, `<meta name="description">`,
`og:*` et `twitter:*`, avec en image de partage `assets/conjugarium-cover.jpg` et
`assets/surhumains-cover.jpg` — les pochettes des deux projets. `index.html` porte les
siennes, avec le logo Clap ! comme image.

**Les trois fichiers partagent le même corps et le même script** (composants, nuancier,
sélecteur de thème) : leur `<head>` diffère, et le texte des notes est adapté au thème
(nom de l'accent, police de titre, forme de séparateur). En cas de modification
structurelle du corps, répercuter le changement dans les trois fichiers — il n'y a pas de
génération automatique.

Sans serveur, `open design-system/index.html` (ou `conjugarium.html`, `surhumains.html`)
fonctionne aussi : le script détecte `location.protocol === 'file:'` et fait pointer les
liens du sélecteur vers le fichier voisin plutôt que vers les chemins absolus `/clap`,
`/conjugarium` et `/surhumains`, qui ne résolvent pas hors serveur.

Pour un projet Vite/React, copier `tokens.css` + `components.css` dans `src/styles/`,
importer les deux dans `main.tsx`, copier `themes/` si besoin, et déplacer le dossier `assets/fonts/`
dans `public/fonts/` (ajuster les chemins des `@font-face` en conséquence).

---

## 1. Principes

**Deux registres, un seul système.** Le studio parle à deux publics : les enfants et les
familles d'un côté, les enseignants de l'autre. Les couleurs, l'espacement et les composants
ne changent pas entre les deux ; seule la typo de titre bascule (`--font-heading` ↔
`--font-display`) et la page protégée abandonne l'alternance de fonds pour du sombre plein.

**L'accent est un signal, pas une décoration.** `--accent` marque ce qui est cliquable ou
ce qui est en cours de lecture. Une zone visible ne contient qu'un seul bouton d'accent plein.
L'accent n'est jamais fond de texte long — seules exceptions : le pied de page et le
lecteur audio, deux blocs courts et volontairement tranchés. En **texte** sur fond clair, il
ne passe pas : c'est `--accent-ink` qui prend le relais (voir § 2, Accent).

**Le système est clair ; le sombre est une rupture.** Le fond principal est blanc ou très
pâle : c'est lui qui domine la page. Le navy n'est pas un fond, c'est `--primary`, une
couleur de **contenu** — titres, texte, boutons pleins. Il ne devient fond que sur **une**
bande par page, `.cl-section-invert`, pour le moment fort : le lecteur intégral, une mise en
avant. Deux bandes sombres et la rupture ne rompt plus rien.

**Une zone inversée ne duplique aucun composant.** `.cl-invert` redéclare la rampe de texte,
les bordures et les voiles pour tout son sous-arbre ; les composants à l'intérieur sont
exactement les mêmes qu'à l'extérieur. Il n'existe pas de variante sombre à maintenir.

**Les séparateurs sont la signature.** Chaque changement de couleur de fond passe par un
`.cl-wave`. Jamais de bord droit entre deux sections. La forme appartient au thème : coulures
de peinture chez Clap ! Studio, nuages au Conjugarium.

**Mobile = un seul point de rupture.** `@media (max-width: 600px)`. Le pattern est constant :
les rangées horizontales passent en colonne et se centrent, les détails secondaires
(`.cl-row__desc`, `.cl-player__side`) disparaissent plutôt que de se tasser.

**Le retour au survol est toujours le même.** Un `scale` léger (1.02 à 1.1 selon la taille)
plus un éclaircissement. Pas de changement de teinte, pas d'ombre animée.

---

## 2. Tokens

Toutes les valeurs ci-dessous sont dans `tokens.css`. Ne jamais écrire une couleur ou un
rayon en dur dans un composant.

Les tokens sont en **deux couches**, et c'est ce qui rend le système thémable :

1. **Primitives** — `--clap-navy`, `--clap-yellow`, `--cjg-pink`… Les couleurs brutes d'une
   marque. Aucun composant ne les lit jamais.
2. **Sémantiques** — `--surface`, `--accent`, `--ink`… Les *rôles*. C'est la seule couche que
   lisent les composants, et donc la seule qu'un thème redéfinit.

### Couleur principale et surfaces

| Token | Clap ! Studio | Conjugarium | Usage |
|---|---|---|---|
| `--primary` | `#0D1B2E` | `#0E172A` | **Titres, texte, boutons pleins.** Pas un fond de page. |
| `--on-primary` | `#FFFFFF` | `#EFEEFA` | Posé sur `--primary` |
| `--surface` | `#FFFFFF` | `#EFEEFA` | **Fond principal de la page** |
| `--surface-raised` | `#F6F7F9` | `#FFFFFF` | Cartes, playlist, pills |
| `--surface-sunken` | `#F0F2F5` | `#FFFFFF` | Champs de saisie |
| `--surface-invert` | `#0D1B2E` | `#0E172A` | La bande de rupture sombre, une par page |

### Accent

| Token | Clap ! Studio | Conjugarium | Usage |
|---|---|---|---|
| `--accent` | `#FFD100` | `#F4B0CF` | Aplats : boutons, badges, état actif, lecteur |
| `--accent-hover` | `#FFE033` | `#F8C5DC` | Survol de toute surface d'accent |
| `--accent-ink` | `#7A6000` | `#A62A60` | **Accent en texte, sur fond clair** |
| `--on-accent` | `#1A1A1A` | `#0E172A` | Texte et icônes posés SUR l'accent |

Déclinaisons du même accent, en opacité : `--accent-soft` (fond de rangée active),
`--accent-ring` (halo de focus), `--accent-glow` / `--accent-glow-lg` (ombres portées),
`--accent-faint` (bordure au survol).

> **Pourquoi `--accent-ink`.** Le jaune de marque plafonne à 1,46:1 sur blanc et le rose à
> 1,53:1 sur lavande, là où AA demande 4,5:1 pour du texte. L'accent de marque est donc
> réservé aux **aplats**, où c'est `--on-accent` qui porte la lisibilité ; dès que l'accent
> doit devenir du **texte** sur fond clair, on passe à `--accent-ink`, assombri jusqu'à
> franchir AA (6,0:1 et 5,9:1). Les deux composants concernés sont `.cl-tagline__accent`
> et `.cl-section-title__accent`.

### Encre sur fond clair

`--ink` (corps de texte) · `--ink-heading` (titres de section) · `--ink-55` (temps du
lecteur) · `--ink-45` (mentions légales).

### Couleurs d'état

`--danger` `#F87171` (erreurs de formulaire, action de déconnexion au survol) ·
`--success` `#34D399` + `--success-bg` / `--success-border` (badge d'accès vérifié).

### Texte

Le texte s'atténue par opacité sur la surface courante. **Quatre paliers, pas davantage**,
et chacun est calé sur un seuil de contraste mesuré, pas choisi à vue.

| Token | Contraste | Usage |
|---|---|---|
| `--text-1` | ~16:1 | Titres, titres de piste, libellés forts |
| `--text-2` | ~10:1 | Corps de texte, descriptions |
| `--text-3` | **4,5:1** | Tags, légendes, description de piste — plancher AA |
| `--text-4` | **3:1** | Numéros de piste, icônes de champ — **information redondante uniquement** |

Ces quatre tokens basculent en bloc dans une zone `.cl-invert`. Un composant ne sait donc
jamais s'il est sur fond clair ou sombre : il demande `--text-2`, il obtient le bon.

`--text-4` ne passe pas AA, et c'est assumé : il est réservé à ce qui est déjà porté par un
autre élément (le numéro d'une piste dont le titre est lisible juste à côté). Ne jamais y
mettre une information unique.

### Bordures et surfaces

`--border-subtle` bordure de carte et de champ · `--border-hairline` filet entre rangées de
playlist · `--border-strong` bordure des boutons ghost · `--overlay-hover` survol de rangée ·
`--accent-soft` rangée en lecture · `--chip-bg` / `--chip-border` fond des tags.

Comme la rampe de texte, ils sont relatifs à la surface courante et basculent dans
`.cl-invert`. Sur fond clair ils sont teintés de navy, sur fond sombre de blanc.

### Typographie

| Token | Clap ! Studio | Conjugarium | Usage |
|---|---|---|---|
| `--font-body` | **Lexend** 400→700 | **Lexend** | Corps de texte, boutons, champs. **Jamais remplacée** : choisie pour sa lisibilité chez les lecteurs débutants. |
| `--font-heading` | **Gaegu** 700 | **Simply Olive** | Titres des pages publiques. Registre enfant. |
| `--font-display` | **Avenir Heavy** 800 | **Simply Olive** | Titres des pages pro / protégées et titres de carte. |

Le Conjugarium confie les deux registres à Simply Olive, qui n'a qu'une graisse : le thème
neutralise donc le `font-weight: 800` des titres pour éviter un faux gras synthétique, et
remonte les tailles (`--fs-title-fun` passe à `clamp(2.4rem, 6vw, 4.2rem)`) parce que la
police porte moins loin que Gaegu à taille égale.

Tailles : `--fs-xs` .72 · `--fs-sm` .8 · `--fs-base` .95 · `--fs-md` 1 · `--fs-lg` 1.2 ·
`--fs-xl` 1.4 rem. Titres fluides : `--fs-title-fun`, `--fs-title-pro`, `--fs-title-section`
— tous trois redéfinissables par un thème.

Interlignes : `--lh-tight` 1.15 (titres) · `--lh-normal` 1.5 (taglines) ·
`--lh-relaxed` 1.7 (descriptions) · `--lh-loose` 1.8 (texte long sur fond clair).

### Espacement

Échelle en rem, multiples de 0.25 : `--sp-1` .25 → `--sp-16` 4rem
(1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16). Valeurs de référence : padding de carte
`--sp-6 --sp-8`, padding de rangée `--sp-4 --sp-5`, gap de hero `--sp-10`,
padding de section sombre `--sp-12` en haut.

### Rayons

`--r-xs` 4px (tags) · `--r-sm` 5px · `--r-md` 14px (champs) · `--r-lg` 16px (playlist,
icône de bannière) · `--r-xl` 20px (cartes, pochettes) · `--r-2xl` 24px (carte d'auth,
lecteur mobile) · `--r-pill` 50px (boutons, badges, pills, recherche) ·
`--r-round` 50 % (boutons icône).

**Règle** : plus la surface est grande, plus le rayon est doux. Tout objet interactif et
compact est en pill.

### Ombres

`--shadow-card` cartes sur navy · `--shadow-modal` carte d'authentification ·
`--shadow-cover` pochette de projet · `--shadow-player` lecteur flottant ·
`--shadow-accent` / `--shadow-accent-lg` halo sous les surfaces d'accent (ils suivent le
thème via `--accent-glow`) · `--ring-focus` halo de focus des champs.

### Transitions

`--t-fast` 0.15s (survol, transform) · `--t-base` 0.2s (couleur, bordure, fond).

### Layout

`--content-max` 820px (colonne principale) · `--prose-max` 620px (texte long) ·
`--card-max` 520px (carte d'auth) · `--player-max` 760px · `--player-h` 100px (spacer) ·
`--wave-h` 75px / `--wave-h-mobile` 50px — le thème Conjugarium les monte à 90px / 60px,
les nuages ayant besoin de plus de hauteur que les coulures.

---

## 3. Composants

Tous préfixés `.cl-`. Le styleguide (`index.html`) montre chacun d'eux en contexte.

### Layout

`.cl-page` colonne pleine hauteur · `.cl-section-dark` section sombre extensible ·
`.cl-section-light` section claire · `.cl-container` colonne 820px centrée ·
`.cl-prose` colonne 620px centrée pour le texte · `.cl-player-spacer` à placer en fin de page
dès que le lecteur flottant est monté.

### Entête et pied de page

`.cl-header` logo centré + tagline sur deux lignes, le second membre en
`.cl-tagline__accent` (jaune, 700). `.cl-footer` bloc d'accent : tagline, lien de contact
souligné par une bordure de 2px, mention légale.

### Séparateurs — `.cl-wave`

La **forme** vient du thème, appliquée en `mask-image` ; les **couleurs** se posent par
instance. Plus aucun JavaScript n'est nécessaire.

```html
<!-- --wave-from = section qui précède, --wave-to = section qui suit -->
<div class="cl-wave" style="--wave-from: var(--surface-alt); --wave-to: var(--surface)"></div>
```

```css
:root                      { --divider-shape: var(--shape-drips); }   /* coulures */
[data-theme="conjugarium"] { --divider-shape: var(--shape-clouds); }  /* nuages   */
[data-theme="surhumains"]  { --divider-shape: var(--shape-flames); }  /* flammes  */
```

La densité est réglable par `--divider-repeat` — la largeur d'*un* motif, donc `50%` en
donne deux sur la largeur. Les coulures gardent `50%` ; les nuages, plus larges par nature,
passent à `70%` (`110%` sous 600px) pour retrouver la densité du site d'origine ; les
flammes contiennent déjà ~3 motifs dans leur SVG et passent donc à `100%` (`200%` sous
600px).

Trois formes sont livrées dans `tokens.css` : `--shape-drips`, `--shape-clouds` et
`--shape-flames`. Elles partagent la même convention : un SVG de 1920 unités de large, calé
sur son bord bas, sans couleur propre (c'est un masque). Pour en ajouter une, suivre la même
convention et exposer la variable à côté des autres.

`mask-size` + `repeat-x` → deux motifs sur desktop, trois sous 600px, pour garder des
gouttes et des nuages de taille constante quelle que soit la largeur d'écran.

### Titres

`.cl-title-fun` (Gaegu) page publique · `.cl-title-pro` (Avenir Heavy) page protégée ·
`.cl-section-title` titre de section sur fond blanc, avec `.cl-section-title__accent`
pour passer un fragment en jaune · `.cl-text` paragraphe long · `.cl-desc` description
sur fond sombre.

### Boutons

| Classe | Usage |
|---|---|
| `.cl-btn` | Action principale, accent plein, pill. **Une seule par zone visible.** |
| `.cl-btn--lg` | Variante bannière |
| `.cl-btn--block` | Pleine largeur, dans un formulaire |
| `.cl-btn--ghost` | Action secondaire ou destructive ; passe en `--danger` au survol |
| `.cl-icon-btn` | Rond 44px en accent — lecture / pause |
| `.cl-icon-btn--outline` | Rond 40px contour — téléchargement ; passe en accent au survol |

### Badges

`.cl-badge` en accent, majuscules, `letter-spacing: 2px` — qualifie le type d'œuvre ·
`.cl-badge--ghost` gris translucide — qualifie une ressource secondaire ·
`.cl-badge--success` vert — confirme un état · `.cl-meta` texte d'accent en majuscules
espacées, pour un décompte (« 9 épisodes »).

### Cartes

`.cl-card` base sur `--surface-raised`. `.cl-card--accent` ajoute une bordure d'accent de 2px :
**une seule carte accentuée par page**, celle qu'on veut voir en premier.
`.cl-card--auth` carte d'authentification centrée, plus large en padding.

`.cl-banner` se combine à `.cl-card` pour le pattern « icône + texte à gauche, action à
droite » : `.cl-banner__left` > `.cl-banner__icon` (carré 60px à coins `--r-lg`) +
`.cl-banner__title` / `.cl-banner__subtitle`. Passe en colonne sous 600px, le bouton
prenant toute la largeur.

### Hero projet

`.cl-hero` = pochette carrée 180px (`.cl-hero__cover`, `--r-xl` + `--shadow-cover`) +
colonne d'infos. `.cl-hero__badges` aligne les badges sur une ligne ; un `.cl-btn--ghost`
placé dedans est poussé à droite par `margin-left: auto`. Sous 600px : colonne centrée,
pochette à 160px.

### Formulaires

`.cl-form` colonne à gap `--sp-5`. `.cl-field` positionne `.cl-field__icon` en absolu à
gauche du `.cl-input` (dont le padding gauche de 3.25rem réserve la place). Le champ est
plus sombre que la carte qui le contient. Focus : bordure `--accent` + `--ring-focus`,
jamais l'outline navigateur. `.cl-error` message d'erreur, aligné à gauche, remonté par
une marge négative.

`.cl-search` + `.cl-search__input` : variante pill de la même logique.

### Filtres

`.cl-controls` barre `space-between` qui wrappe : recherche à gauche, `.cl-pills` à droite.
`.cl-pill` inactive sur `--surface-raised`, `.cl-pill--active` en accent plein.

### Playlist

Le composant central. `.cl-playlist` est un `<ul>` à `overflow: hidden` et `--r-lg` : les
rangées sont collées, séparées par un filet `--border-hairline`, et le bloc entier est masqué
en coins arrondis.

Chaque `.cl-row` : `.cl-row__num` (28px, numéro au repos, icône note animée par `.cl-pulse`
en lecture) · `.cl-row__info` avec `.cl-row__titleline` (titre + `.cl-row__tag` optionnel)
et `.cl-row__desc` (ellipsée, masquée sous 600px) · `.cl-row__actions` (play + download).

`.cl-row--active` signale la lecture sur **trois** canaux simultanés : fond
`--accent-soft`, numéro en accent, titre en accent. `.cl-empty` pour la liste vide.

### Lecteur flottant

`.cl-player` en `position: fixed`, centré, largeur `min(760px, 100vw - 32px)`, jaune plein,
rayon 100px. Structure : `.cl-player__play` (rond noir 48px, icône jaune) ·
`.cl-player__meta` (titre ellipsé + `.cl-player__progress` = temps / `.cl-range` / temps) ·
`.cl-player__side` (volume). Le `.cl-range` a une poignée de 32px, dimensionnée pour le
tactile. Sous 600px : rayon `--r-2xl` et `.cl-player__side` masqué.

**Toujours** ajouter `.cl-player-spacer` en fin de page quand le lecteur est monté.

---

## 4. Gabarits de page

### Page publique

```html
<div class="cl-page">
  <header class="cl-header">…</header>
  <div class="cl-wave"></div>          <!-- blanc → navy -->
  <main class="cl-section-dark">
    <div class="cl-container">
      <div class="cl-hero">…</div>     <!-- titre en .cl-title-fun -->
      <ul class="cl-playlist">…</ul>
      <a class="cl-btn">Télécharger</a>
    </div>
  </main>
  <div class="cl-wave"></div>          <!-- navy → blanc -->
  <section class="cl-section-light">
    <div class="cl-prose">…</div>
  </section>
  <footer class="cl-footer">…</footer>
  <div class="cl-player-spacer"></div>
</div>
```

### Page protégée (pack, ressources)

Surface sombre pleine du haut en bas, sans entête ni pied de page, sans lien sortant. Titres en
`.cl-title-pro`. Ordre canonique : hero → carte accentuée (téléchargement global) →
cartes de ressources → contrôles → playlist.

```html
<div class="cl-page cl-section-dark">
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
Les placeholders textuels du styleguide sont là pour éviter une dépendance :
les remplacer par les composants Phosphor en production.

Correspondances utilisées : `Play` / `Pause` (lecteur, rangées) · `MusicNote` (rangée en
lecture) · `DownloadSimple` (téléchargements) · `Key` / `Lock` (authentification) ·
`MagnifyingGlass` (recherche) · `SpeakerHigh` (volume) · `CheckCircle` (accès vérifié).

---

## 6. Accessibilité — points à tenir

- **Contrastes.** Les quatre paliers de texte sont calés sur des seuils mesurés :
  `--text-3` est exactement au plancher AA (4,5:1) dans les deux thèmes et sur les deux
  fonds. `--text-4` est à 3:1 et **ne passe donc pas** AA pour du texte : réservé à
  l'information redondante (numéro de piste dont le titre est lisible à côté), jamais à une
  information unique.
- **Boutons.** `--on-accent` sur l'accent et `--on-primary` sur le primary dépassent 10:1
  dans les deux thèmes.
- **Accent en texte.** Ne jamais poser `--accent` comme couleur de texte sur un fond clair :
  utiliser `--accent-ink`. Voir l'encadré du § 2.
- **Focus.** Les champs ont un focus visible (`--ring-focus`). Les boutons du système
  d'origine n'en ont pas — ajouter un `:focus-visible` explicite sur `.cl-btn`,
  `.cl-icon-btn` et `.cl-pill` pour toute nouvelle page.
- **Boutons icône.** Toujours un `aria-label` : les composants ne portent aucun texte.
- **Cible tactile.** Les boutons icône font 40 à 44px et les poignées de range 32px :
  conserver ces dimensions.
- **État de lecture.** Le triple signal (fond + numéro + titre) n'est pas seulement
  décoratif : il évite de dépendre de la seule couleur.

---

## 7. Thèmes

Un thème ne touche **ni les composants, ni les classes** : il redéfinit la couche sémantique.
Le styleguide (`index.html`) bascule de l'un à l'autre en direct pour le vérifier.

### Activer un thème

```html
<html data-theme="conjugarium">   <!-- ou sur n'importe quel conteneur -->
```

### Le thème Conjugarium

Dérivé de `clapeditions.fr/bienvenueauconjugarium-audio`. Il inverse le rapport de
luminosité du système de base : chez Clap ! Studio la respiration est blanche, ici elle est
lavande, et le registre passe du ludique-graphique au conte illustré.

| | Valeur | Rôle |
|---|---|---|
| Nuit | `#0E172A` | `--surface` — fond des sections de contenu |
| Nuit remontée | `#1B2540` | `--surface-raised` — cartes, playlist |
| Rose pochette | `#F4B0CF` | `--accent` — boutons, état actif, lecteur, pied de page |
| Lavande pâle | `#EFEEFA` | `--surface-alt` — sections de texte long, entête |
| Bleu-lavande | `#C9C8FB` | Seconde bande claire → `.cjg-section-periwinkle` |

### Le thème Surhumains

Dérivé de `clapeditions.fr/surhumains`. Même rapport de luminosité que le système de base
— une respiration claire, une seule bande de rupture — mais le registre passe du ludique au
documentaire : plus d'écriture manuscrite, titres et corps en Avenir, et le bleu électrique
remplace le navy comme couleur de contenu.

| | Valeur | Rôle |
|---|---|---|
| Blanc cassé | `#F9F9F9` | `--surface` — fond principal |
| Bleu électrique | `#3333CB` | `--primary` — titres, boutons pleins (8.1:1 sur le fond) |
| Bleu profond | `#2626A8` | `--surface-invert` — la bande de rupture |
| Rose corail | `#F98FA5` | `--accent` — boutons, état actif, lecteur |
| Menthe | `#9EEFDF` | Seconde bande claire → `.shm-section-mint` |

Le séparateur de section est la forme du site d'origine, relevée telle quelle :
`--shape-flames`, un SVG de 1920×144 contenant déjà trois motifs, d'où
`--divider-repeat: 100%` et `--wave-h: 105px`.

Le rose corail ne passe pas en texte sur fond clair : `--accent-ink` vaut `#B0234A` (6.3:1).
Aucune police n'est chargée en plus — le thème réutilise `avenir-heavy.woff2`.

Le bleu-lavande n'a pas d'équivalent dans le système de base : le site de référence alterne
**deux** fonds clairs. Il est donc exposé comme utilitaire plutôt que comme token, pour ne
pas créer un rôle qui resterait vide chez Clap ! Studio.

Autres écarts portés par le thème : les **nuages** remplacent les coulures, Simply Olive
remplace Gaegu *et* Avenir Heavy, les tailles de titre montent d'un cran, et `--wave-h`
passe à 90px pour laisser respirer les nuages, plus hauts que les gouttes.

### Écrire un nouveau thème

Ne redéfinir que ces tokens — tout le reste suit :

```css
[data-theme="mon-projet"] {
  --surface: #…;      --surface-raised: #…;  --surface-sunken: #…;  --surface-alt: #…;
  --accent: #…;       --accent-hover: #…;    --accent-ink: #…;      --on-accent: #…;
  --accent-soft: …;   --accent-ring: …;      --accent-glow: …;      --accent-faint: …;
  --ink: #…;          --ink-heading: #…;     --ink-55: …;           --ink-45: …;
  --font-heading: '…'; --font-display: '…';
  --divider-shape: var(--shape-clouds);
}
```

Trois vérifications avant de le déclarer fini :

1. `--on-accent` sur `--accent` ≥ 4,5:1 (texte des boutons).
2. `--accent-ink` sur `--surface-alt` ≥ 4,5:1 (accent en texte).
3. `--accent` sur `--surface` ≥ 3:1 (état actif de la playlist, bordures).

---

## 8. Licence des polices

| Police | Statut | Portée |
|---|---|---|
| **Lexend** | SIL Open Font License | Libre, y compris commercial. Servie par Google Fonts. |
| **Gaegu** | SIL Open Font License | Libre, y compris commercial. Servie par Google Fonts. |
| **Avenir Heavy** | Licence propriétaire | Fichier local. Vérifier que la licence du studio couvre le webfont. |
| **Simply Olive** | ⚠️ **PERSONAL USE ONLY** | Voir ci-dessous. |

> **⚠️ Simply Olive n'est pas licenciée pour un usage public.** Le fichier fourni est une
> version DEMO : ses métadonnées portent `PERSONAL USE ONLY!` (auteur : Ali Hamidi). Elle
> convient pour maquetter en local, **pas** pour être servie depuis un site en ligne, qui
> constitue une diffusion publique.
>
> Pour mettre le thème Conjugarium en production, deux options :
> - acquérir la licence commerciale / webfont auprès de l'auteur, puis remplacer
>   `assets/fonts/simply-olive.woff2` par la version sous licence — aucun autre fichier à
>   toucher ;
> - ou changer `--font-heading` / `--font-display` dans `themes/conjugarium.css` pour une
>   police libre au dessin proche.
>
> Le thème dégrade proprement en attendant : la pile de repli est
> `'Simply Olive', 'Gaegu', cursive`.

---

## 9. Source

Extrait le 2026-09-18 de `conjugarium-minisite/` :
`src/styles/global.css`, `src/pages/ConjugariumPage.css`,
`src/pages/ConjugariumPackPage.css`, `src/components/AudioPlayer.css`.

Les doublons entre les deux pages (playlist, hero, badges) ont été fusionnés en un seul
composant, et les valeurs écrites en dur dans `ConjugariumPackPage.css` ont été
reconnectées aux variables.

Le 2026-09-18, seconde passe pour le thème Conjugarium : introduction de la couche
sémantique, passage des séparateurs de `background-image` + JS à `mask-image` en CSS pur,
et ajout de `--accent-ink` pour corriger un contraste insuffisant présent dès la première
version. Palette et nuages relevés sur `clapeditions.fr/bienvenueauconjugarium-audio`.

Troisième passe le même jour : **renversement en clair**. Le fond principal passe du navy au
blanc / lavande, le navy devient `--primary` (contenu) et le fond de la seule bande
`.cl-section-invert`. La rampe de texte est ramenée de six paliers à quatre, chacun calé sur
un seuil de contraste mesuré et relatif à la surface courante, ce qui supprime les variantes
sombres des composants.

Quatrième passe : `/conjugarium` devient un fichier HTML distinct (`conjugarium.html`),
avec ses propres métadonnées de partage — nécessaire, une page qui bascule son thème par
script ne peut pas être décrite correctement par un aperçu de lien, qui n'exécute pas le
JavaScript.

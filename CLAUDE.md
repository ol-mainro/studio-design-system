# Clap ! Studio — Design System

## Raison d'être

Ce dépôt est le design system du studio de création **Clap !**. Il met à disposition des
**composants** et des **layouts** (pages complètes) pour créer les supports de
**consultation** et de **communication** des projets du studio : minisites d'œuvres, pages
de pack pédagogique, landing pages, lecteurs de podcast, parcours sonores de musée,
playlists vidéo… Un même univers vit sur plusieurs supports (conte audio, album, vidéos
karaoké, affiches mémo, quiz), qui doivent se reconnaître entre eux.

Ces supports sont produits **avec l'assistance d'outils d'IA**. L'IA qui crée ou modifie un
support consulte ce design system et **s'y conforme** : elle assemble les composants et
layouts existants plutôt que d'en inventer, et respecte les tokens, les thèmes et les règles
d'usage documentés ici.

## Source de vérité

- `design.md` — **à lire avant toute création** : principes, tokens, composants,
  comportements JS, layouts, accessibilité, thèmes. Fait foi en cas de doute.
- `layouts/` — `podcast.html`, `musee.html`, `video.html` : **point de départ** de tout
  nouveau support.
- `tokens.css` (valeurs + dérivations) · `themes/*.css` (un thème par projet) ·
  `components.css` (classes `.cl-*`) · `components.js` (comportements `data-cl-*`).
- `index.html`, `<thème>.html` — styleguides vivants, publiés sur
  <https://clap-design-system.web.app> (Firebase Hosting, `firebase.json`). Le dossier
  `styleguide/` est leur chrome, **hors** design system.

## Règles pour l'IA qui produit un support

1. **Partir du layout le plus proche.** Copier `layouts/<x>.html`, remplacer le bloc de
   données JSON, les textes et les meta de partage ; retirer ce qui ne sert pas.
2. **Composer, ne pas inventer.** Utiliser les classes `.cl-*` (`design.md` § 3) et les
   attributs `data-cl-*` (§ 4). Si un besoin n'est couvert par aucun composant, le signaler
   et proposer un ajout au design system plutôt qu'un style ad hoc dans le support.
3. **Jamais de valeur en dur.** Couleurs, rayons, espacements, ombres, tailles, z-index
   passent par les tokens. Les composants ne lisent jamais les primitives (`--clap-*`,
   `--cjg-*`, `--shm-*`, `--obs-*`).
4. **Respecter les principes** (§ 1) : un seul bouton d'accent plein par zone, une seule
   bande `.cl-section-invert` par page, une `.cl-wave` à chaque changement de fond (pied de
   page compris), un seul point de rupture mobile (`max-width: 600px`), `--accent-ink` pour
   l'accent en texte sur fond clair.
5. **Thème = identité du projet.** Charger `tokens.css`, puis le thème, puis
   `components.css`, et poser `data-theme` sur `<html>`. Nouveau projet : créer
   `themes/<projet>.css` selon § 9 (rôles nommés + 3 triplets RGB) sans toucher aux
   composants.
6. **Icônes** : le sprite de `components.js` (`<use href="#cl-i-…">`), jamais de glyphes
   Unicode.
7. **Accessibilité non négociable** : § 8.

## Faire évoluer le design system

- Toute modification de composant, token, comportement ou thème se répercute dans
  `design.md` **et** dans les styleguides et layouts concernés, dans le même changement.
- Les quatre styleguides partagent le même corps : une modification structurelle se fait
  dans les quatre fichiers.
- Un nouveau thème ajoute : son fichier CSS, son styleguide `<thème>.html` avec meta de
  partage statiques, ses routes dans `firebase.json`, sa colonne dans les tableaux de
  `design.md` § 2.
- Vérifier le rendu (desktop et 375px) de chaque styleguide et layout touché avant de
  livrer : `python3 -m http.server` à la racine, puis `/index.html`,
  `/layouts/<x>.html?theme=…`.

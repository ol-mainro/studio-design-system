# Clap ! Studio — Design System

## Raison d'être

Ce dépôt est le design system du studio de création **Clap !**. Il met à disposition des
**composants** et des **gabarits de page** (layouts) réutilisables pour créer les divers
supports de **consultation** et de **communication** de nos projets : minisites d'œuvres,
pages de pack pédagogique, landing pages, galeries vidéo, pages de ressources…

Il est pensé pour que ces supports puissent être produits **avec l'assistance d'outils d'IA**.
L'IA qui crée ou modifie un support consulte ce design system et **s'y conforme** : elle
assemble les composants existants plutôt que d'en inventer, et respecte les tokens, les
thèmes et les règles d'usage documentés ici.

## Source de vérité

- `design.md` — **à lire avant toute création** : principes, tokens, anatomie des composants,
  gabarits de page, accessibilité, thèmes. Fait foi en cas de doute.
- `tokens.css` — valeurs de design (primitives + couche sémantique).
- `components.css` — composants préfixés `.cl-`. `components.js` — contrôleur léger (lightbox).
- `themes/_base.css` + `themes/<projet>.css` — un thème par projet (Conjugarium, Surhumains,
  Observatoire des Mots), ne redéfinit que la couche sémantique.
- `index.html`, `<thème>.html` — styleguides vivants, un par thème, publiés sur
  <https://clap-design-system.web.app> (Firebase Hosting, voir `firebase.json`).

## Règles pour l'IA qui produit un support

1. **Composer, ne pas inventer.** Utiliser les classes `.cl-*` et les gabarits de `design.md`
   § 4. Si un besoin n'est couvert par aucun composant, le signaler et proposer un ajout au
   design system plutôt qu'un style ad hoc dans le support.
2. **Jamais de valeur en dur.** Couleurs, rayons, espacements, ombres passent par les tokens
   sémantiques (`--surface`, `--accent`, `--ink`…). Les composants ne lisent jamais les
   primitives (`--clap-navy`, `--cjg-pink`…).
3. **Respecter les principes** (`design.md` § 1) : un seul bouton d'accent plein par zone,
   une seule bande `.cl-section-invert` par page, `.cl-wave` à chaque changement de fond,
   un seul point de rupture mobile (`max-width: 600px`).
4. **Thème = identité du projet.** Pour un projet existant, charger son thème ; pour un
   nouveau projet, créer `themes/<projet>.css` selon `design.md` § 7 (« Écrire un nouveau
   thème ») sans toucher aux composants.
5. **Accessibilité non négociable** : appliquer `design.md` § 6.

## Faire évoluer le design system

- Toute modification de composant, token ou thème se répercute dans `design.md` **et** dans
  les styleguides HTML concernés, dans le même changement.
- Un nouveau thème ajoute : son fichier CSS, son styleguide `<thème>.html` avec ses propres
  meta de partage statiques (Open Graph, Twitter Card), et ses rewrites/redirects dans
  `firebase.json`.
- Vérifier visuellement le rendu dans le styleguide de chaque thème avant de livrer.

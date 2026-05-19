# UX Phase 2 — Recherche, Navigation, Draggable Pins, Auth Guard & Onboarding

## Overview

Six améliorations UX/UI pour Omni après le redesign UI/UX Phase 1 (carte livreur, MobileNav, header, tri, responsive, polish).

## 1. Autocomplete Search

### Delivery trips
- **Fichier** : `src/app/delivery/trips/new/page.jsx`
- Debounce 500ms → **200ms** (`setTimeout` dans `handleSearchChange`, ligne ~217)
- Aucun autre changement (Nominatim, dropdown, etc. restent identiques)

### Carte principale (map)
- **Fichier** : `src/app/map/page.jsx`
- Ajouter une barre de recherche en haut de la carte (sous le header, centrée)
- Filtre les `sortedVendors` (facilities) **côté client** par `name` et `category`
- Debounce 200ms sur l'input
- Dropdown des résultats sous l'input au clic → `map.flyTo()` vers la facility + surbrillance du marker
- Icône de recherche (loupe) dans l'input

## 2. Suppression des affichages lon/lat

- **Fichiers** : `src/app/vendor/settings/page.jsx:232`, `src/app/settings/page.jsx:164`
- Remplacer le texte "lat, lon" par une **mini-carte MapLibre** (150x100px) avec un marker
- Au clic sur la mini-carte → ouvre un sélecteur de position (MapLibre plein écran avec recherche Nominatim + clic pour placer le pin)
- Pattern similaire à `delivery/trips/new/page.jsx` mais en modal
- Utiliser `createPopup` ou un overlay modal

## 3. Draggable Pins

- **Fichier** : `src/app/delivery/trips/new/page.jsx`
- Ajouter `draggable: true` sur tous les markers (origin, destination, waypoints)
- Ajouter un écouteur `onDragEnd` sur chaque marker
- `onDragEnd` : `const lngLat = marker.getLngLat()` → met à jour le state `allPoints`
- Supprimer le mécanisme actuel `activePin` → clic carte pour repositionner
- Garder le clic sur la carte pour ajouter de nouveaux waypoints

## 4. Navigation globale vers la carte

### MobileNav global
- Créer `src/components/GlobalNav.jsx` (wrapper autour de MobileNav)
- Le rendre dans le root layout (`src/app/root.tsx`) pour qu'il apparaisse sur TOUTES les pages
- Position : **haut à droite**
- Ne PAS le rendre sur `/map` (déjà géré par le MobileNav existant dans map/page.jsx)
- Utiliser `useLocation()` de React Router pour détecter la page courante
- MobileNav a déjà "Acheteur" → `/map` dans `handleRoleSwitch`

## 5. Auth Guard Global

### AuthGuard amélioré
- **Fichier** : `src/components/AuthGuard.jsx` (existe mais redirige vers `/account/signin`)
- Corriger la redirection : `/account/signin` → `/auth`
- Vérifie la session via localStorage `omni_user` ou `/api/auth/session`
- Props : `children` (contenu protégé), `fallback` optionnel (UI à afficher si non auth, par défaut redirection)
- **Dans root.tsx** : envelopper les routes protégées (tout sauf `/map`, `/auth`, `/`)
- **Pour la carte** : pas d'AuthGuard — accessible readonly sans auth
- Actions individuelles (panier, contact) gardent leur redirection vers `/auth`

### Routes protégées
- `/vendor/*` → AuthGuard
- `/delivery/*` → AuthGuard
- `/wallet` → AuthGuard
- `/subscriptions` → AuthGuard
- `/user/*` → AuthGuard
- `/settings` → AuthGuard
- `/cart/*` → AuthGuard

## 6. Onboarding

### Onboarding général (nouveau)
- **Fichier** : `src/app/onboarding/page.jsx`
- **2 écrans** :
  - **Écran 1** : "Bienvenue sur Omni"
    - Champ prénom (pré-rempli depuis `omni_user.name`)
    - Bouton "Activer ma position" → `navigator.geolocation.getCurrentPosition`
    - Bouton "Continuer" → Écran 2
  - **Écran 2** : "Choisis ton rôle"
    - 3 cartes : Acheteur (icône Map), Vendeur (icône Store), Livreur (icône Truck)
    - Au clic : redirige vers `/map` (acheteur), `/vendor/onboarding` (vendeur), `/delivery/onboarding` (livreur)
- Marque `onboarding_done: true` dans localStorage
- Redirection après inscription dans `NeonAuthWrapper.jsx` : si `!localStorage.getItem("onboarding_done")` → `/onboarding`

### Onboarding au switch de rôle
- Dans `MobileNav.jsx` `handleRoleSwitch("vendor")` :
  - Vérifie déjà si vendor existe → `/vendor/onboarding` si non (déjà implémenté)
- Pour delivery (`handleRoleSwitch("delivery")`) :
  - Vérifier si delivery profile existe → `/delivery/onboarding` si non
  - Faire un fetch vers `/api/delivery/profile` pour vérifier

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/app/delivery/trips/new/page.jsx` | Debounce 200ms, draggable pins |
| `src/app/map/page.jsx` | Barre de recherche facilities |
| `src/app/vendor/settings/page.jsx` | Mini-carte au lieu de texte lon/lat |
| `src/app/settings/page.jsx` | Mini-carte au lieu de texte lon/lat |
| `src/components/GlobalNav.jsx` | Nouveau — wrapper MobileNav global |
| `src/app/root.tsx` | GlobalNav + AuthGuard pour routes protégées |
| `src/components/AuthGuard.jsx` | Fix redirection `/auth`, ajout props |
| `src/app/onboarding/page.jsx` | Nouveau — onboarding général 2 écrans |
| `src/components/NeonAuthWrapper.jsx` | Redirection vers `/onboarding` après signup |
| `src/components/MobileNav.jsx` | Vérification delivery profile au switch |

## Non couvert (hors scope)
- Pas de gestion des produits dans la recherche (que facilities)
- Pas de modification du système d'auth backend
- Pas de nouvelles tables BDD
- Pas de modification des API existantes

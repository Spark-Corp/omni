# Omni — UI/UX Redesign & Carte Trajet Livreur

## Date
2026-05-19

## 1. Carte Trajet Livreur (Plein écran)

### 1.1 Nouvel écran : `/delivery/trips/new` (remplace l'actuel)

**Layout :** Carte MapLibre plein écran avec panneau latéral/bottom sheet pour les contrôles.

**Comportement :**
1. À l'ouverture, la carte se centre sur la géolocalisation de l'utilisateur (ou fallback Lagos)
2. Un marker **bleu "Départ"** est automatiquement placé à la position GPS
3. L'utilisateur peut :
   - **Chercher une adresse** via Nominatim (champ de recherche en haut) → suggestions → clic → pin placé + flyTo
   - **Cliquer sur la carte** pour placer/déplacer un pin
4. **Étapes obligatoires** : Départ (🔵) et Arrivée (🔴)
5. **Étapes optionnelles** : jusqu'à 5 escales (🟡)
6. Un bouton "➕ Ajouter une escale" dans le panneau
7. Chaque étape a :
   - Un champ de recherche avec autocomplete Nominatim
   - Les coordonnées (lat/lon) affichées en petit
   - Un bouton supprimer pour les escales
8. **Tracé visuel** : ligne entre les points (ordre: départ → escale 1 → ... → arrivée) via une source geojson mise à jour en temps réel
9. **Slider déviation** en bas (0–10 km, par défaut 2, désactivé si free tier)
10. Bouton **"Activer ce trajet"** → POST /api/delivery/trips/create → redirige vers dashboard

**Contraintes free tier :** pas de waypoints, deviation forcée à 0 (inchangé, déjà implémenté en backend).

### 1.2 Recherche de lieux (Nominatim)

- Appel à `https://nominatim.openstreetmap.org/search?q=...&format=json&limit=5&countrycodes=tg`
- Résultat : `[{ display_name, lat, lon }]`
- Debounce 500ms
- Pays limité au Togo (`countrycodes=tg`) mais pas restrictif si pas de résultats

### 1.3 Composants

- `src/app/delivery/trips/new/page.jsx` → réécriture complète (carte + panneau)
- Pas de nouveau composant partagé pour l'instant (MapLibre importé dynamiquement comme dans la map principale)

---

## 2. Refonte Header & Navigation (Map Page)

### Problème actuel
Le header de la map page a des liens textuels blancs (`Wallet`, `Abo`, `Livraison`, `Mon compte`) qui ne sont pas organisés et ne mettent pas en valeur les actions importantes.

### Design proposé

**Header droit (mobile & desktop) :**
```
┌─────────────────────────────────┐
│  [Menu ☰]           [🔔][🛒 3] │  ← mobile < 768px
│                                 │
│  [Menu ☰]  Acheteur  [🔔][🛒] [Ma boutique]  [Compte ▼]  │ ← desktop
└─────────────────────────────────┘
```

1. **Menu hamburger ☰** (mobile) : panneau latéral gauche avec :
   - Mode actuel : Acheteur (sur fond emerald)
   - Basculer vers Vendeur → redirige vers `/vendor/onboarding` si pas de boutique
   - Basculer vers Livreur → redirige vers `/delivery/onboarding` si pas de profil
   - Wallet (💰 Solde: X FCFA)
   - Abonnements (👑)
   - Mon compte
2. **Desktop** : les liens sont des boutons modernes avec icônes au lieu de texte brut
3. **Badge de mode** "Acheteur" / "Vendeur" / "Livreur" — visible sur la carte pour savoir dans quel rôle on est

### Onboarding flows
- Si user clique "Vendeur" et n'a pas de boutique → `/vendor/onboarding`
- Si user clique "Livreur" et n'a pas de profil livreur → `/delivery/onboarding`
- Si déjà inscrit → redirige vers le dashboard respectif

---

## 3. Refonte Filtres & Tris (Map Page)

### Problème actuel
Les filtres (catégories) et le tri (distance/prix/note/best_value) sont deux rangées séparées dans la zone de recherche, peu lisibles et mal organisées.

### Design proposé

**Nouvelle disposition :**
```
┌─────────────────────────────────┐
│  🔍 [Rechercher...]     🎤 📷  │
├─────────────────────────────────┤
│  Trier par : [Proximité ▾]      │ ← dropdown moderne (un seul actif à la fois)
│                                 │
│  [Alimentation] [Services]      │ ← catégories plus petites, scrollables
│  [Mode] [Maison] [Transport]    │    < 5 catégories max visibles
└─────────────────────────────────┘
```

1. **Tri** : un sélecteur dropdown moderne au lieu de 4 boutons (économie d'espace vertical)
   - Options : Proximité, Prix croissant, Meilleure note, Meilleur rapport
   - Visuel : fond semi-transparent avec icône ⇅
2. **Catégories** : boutons plus compacts, 2 rangées max (6 catégories), scroll horizontal
3. **Placement** : dans une barre d'outils sous la barre de recherche

---

## 4. Responsive Design Global

### Problème
Toutes les pages sont basées sur un `max-w-lg mx-auto` (540px) mais ne sont pas pleinement responsives sur desktop (restent étroites).

### Solution
- **Pages "app"** (wallet, subscriptions, delivery dashboard, cart history) : garder la contrainte `max-w-lg` pour la lisibilité (contenu textuel), mais utiliser `md:max-w-xl` + padding adaptatif
- **Carte** : déjà full-width 🌟 ok
- **Onboarding** : déjà responsive (grille `md:grid-cols-2`)
- **Dashboard vendeur** : ajouter breakpoints pour utiliser l'espace desktop (2 colonnes pour les commandes)
- **Règle générale** : toutes les pages doivent être testées à 320px, 768px, 1024px, 1440px

Pages concernées (vérification + ajustements si besoin) :
- `/wallet` ← ok (simple)
- `/subscriptions` ← ok
- `/cart/history` ← à vérifier
- `/delivery/dashboard` ← à vérifier (liste de trajets + matches)
- `/delivery/onboarding` ← ok
- `/vendor/onboarding` ← ok (déjà responsive)
- `/vendor/dashboard` ← à vérifier
- `/user/profile` ← à vérifier

---

## 5. Design Moderne & Pro (UI Polish)

### Principes (open design + uiuxpro)
- **Cohérence** : mêmes espacements, mêmes border-radius, mêmes couleurs partout
- **Hiérarchie** : titres plus lisibles (font-weight, taille), espaces aérés
- **États vides** : chaque page avec état "aucune donnée" doit avoir une illustration + message + CTA
- **Transitions** : micro-interactions (hover, active, focus) fluides partout
- **Dark theme** : déjà dark, on renforce les contrastes
- **Glassmorphism** : déjà présent (backdrop-blur), on standardise

### Palette
- Fond : `#0a0a0f` (neutral-950)
- Surface : `rgba(255,255,255,0.03)` → `rgba(255,255,255,0.08)`
- Bordure : `rgba(255,255,255,0.06)` → `rgba(255,255,255,0.12)`
- Accent : `#10b981` (emerald-500)
- Texte : `rgba(255,255,255,0.9)` → `rgba(255,255,255,0.3)`

---

## Implémentation (Plan)

### Phase A — Carte Trajet Livreur
1. Réécrire `src/app/delivery/trips/new/page.jsx` avec MapLibre plein écran
2. Implémenter recherche Nominatim (debounce, suggestions dropdown, flyTo)
3. Ajouter interaction clic sur la carte pour placer/modifier les pins
4. Dessiner le tracé (geojson line) en temps réel
5. Connecter au POST /api/delivery/trips/create existant
6. Ajuster le backend pour accepter les noms de lieux (optionnel)

### Phase B — Header & Navigation
1. Créer un composant `MobileNav` (panneau latéral gauche avec liens)
2. Créer un composant `RoleSwitcher` (acheteur/vendeur/livreur)
3. Intégrer les routes onboarding dans la navigation
4. Remplacer les liens textuels du header par des icônes + badges

### Phase C — Filtres & Responsive
1. Remplacer les 4 boutons de tri par un dropdown
2. Ajuster les catégories
3. Audit responsive des pages secondaires

### Phase D — UI Polish
1. États vides avec illustrations
2. Cohérence visuelle (bordure, ombres, espacements)
3. Micro-interactions restantes

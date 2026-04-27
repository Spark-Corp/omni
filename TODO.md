# TODO OMNI - Suivi de Développement

## 📊 État Actuel (Avril 2025)

---

## ✅ **TERMINÉ**

### **Core MVP - Map**
- [x] **Carte MapLibre 3D** - Globe view avec CartoDB tiles
- [x] **Géolocalisation** - Position GPS avec fallback Lomé
- [x] **Affichage vendeurs** - Marqueurs premium cliquables
- [x] **Recherche** - Texte + vocale + image (Transformers.js)
- [x] **Street View** - Intégration Mapillary
- [x] **Itinéraire OSRM** - Routing gratuit avec ligne trajet
- [x] **Système solaire** - Three.js visible zoom < 4

### **Base de Données**
- [x] **Neon PostgreSQL** - Configuré avec PostGIS
- [x] **Schema SQL** - Tables users, vendors, products, messages
- [x] **API vendors/nearby** - Requêtes géospatiales ST_DWithin
- [x] **API products** - CRUD produits

### **Auth**
- [x] **OTP SMS mock** - Code 123456 pour dev
- [x] **API auth** - Routes send-otp/verify-otp corrigées

### **Dashboard Vendeur**
- [x] **Page dashboard** - Toggle online/offline
- [x] **API toggle-status** - Changement statut temps réel

### **Architecture**
- [x] **Vite + React** - Build tool et framework
- [x] **Tailwind CSS** - Design system premium dark
- [x] **Routes API** - Structure Hono/serverless

---

## 🔄 **BUGS FIXÉS RÉCEMMENT**

- [x] **Vendor flyTo** - Fix: setCenter au lieu de easeTo
- [x] **Auth 500** - Fix: signature route POST(request)
- [x] **MessageCircle** - Fix: import ajouté
- [x] **Carte tiles** - Fix: CartoDB au lieu d'Esri (CORS)

---

## 🔄 **EN COURS**

### **Base de Données**
- [ ] **Setup Neon Database** - Créer compte et configurer PostGIS
- [ ] **Schema SQL complet** - Tables vendors, products, auth_users, messages
- [ ] **API routes DB** - Remplacer mock par vraies requêtes SQL

---

## 📋 **À FAIRE - PRD COMPLET**

### **🔴 Priorité HAUTE - Core MVP**

#### **1. Base de Données Neon**
- [ ] **Créer compte Neon** - neon.tech → New Project → PostgreSQL + PostGIS
- [ ] **Schema complet** - Implémenter toutes les tables du PRD
- [ ] **Connection string** - Configurer DATABASE_URL
- [ ] **API vendors** - Route `/api/vendors/nearby` avec PostGIS ST_DWithin
- [ ] **API products** - CRUD produits par vendeur
- [ ] **API messages** - Chat entre acheteur/vendeur

#### **2. Authentification OTP SMS**
- [ ] **Installer @auth/create** - npm install @auth/core @auth/create argon2
- [ ] **Config auth** - AUTH_SECRET, AUTH_URL variables
- [ ] **Africa's Talking SMS** - AT_USERNAME, AT_API_KEY sandbox
- [ ] **Flow OTP** - Téléphone → OTP → Session
- [ ] **Middleware auth** - Protection routes API
- [ ] **Remplacer auth actuelle** - Passer à OTP SMS

#### **3. Dashboard Vendeur**
- [ ] **Page `/vendor/onboarding`** - Flow 3 minutes max
- [ ] **Formulaire inscription** - Nom boutique + catégorie principale
- [ ] **Localisation GPS** - Automatique avec fallback manuel quartier
- [ ] **Ajout produits** - Nom + prix + photo optionnelle
- [ ] **Langue TTS** - Choix langue locale pour notifications
- [ ] **Toggle Online/Offline** - Bouton géant vert/rouge
- [ ] **Dashboard `/vendor/dashboard`** - État vendeur + catalogue

#### **4. Flow Transaction**
- [ ] **Popup "Vérifier disponibilité"** - Sur marker vendeur
- [ ] **Notification vendeur** - WebSocket/SSE notification temps réel
- [ ] **Réponse OUI/NON** - Deux gros boutons thumb-friendly
- [ ] **Confirmation acheteur** - Message de réponse du vendeur
- [ ] **Navigation vers vendeur** - Leaflet Routing Machine

#### **5. Realtime WebSocket**
- [ ] **WebSocket server** - `/api/realtime/route.js`
- [ ] **Notifications push** - Nouvelle demande produit
- [ ] **Chat messages** - Communication transactionnelle
- [ ] **Mise à jour statut** - Vendeur online/offline temps réel

### **🟡 Priorité MOYENNE - Accessibilité**

#### **6. PWA Complet**
- [ ] **Installer vite-plugin-pwa** - npm install vite-plugin-pwa workbox
- [ ] **Service Worker** - Cache stratégie cache-first pour catalogue
- [ ] **Manifest.json** - Icônes et shortcuts
- [ ] **Offline catalogue** - Dernière version accessible sans connexion
- [ ] **Cache map tiles** - Stratégie agressive pour zones fréquentées

#### **7. Recherche Multimodale**
- [ ] **Web Speech API** - Recherche vocale français + langues locales
- [ ] **Transformers.js** - Reconnaissance image MobileNet
- [ ] **Photo recherche** - Camera/galerie → identification produit
- [ ] **TTS notifications** - Text-to-Speech vendeur en langue locale
- [ ] **Phrases pré-enregistrées** - 5 langues prioritaires

#### **8. Navigation Avancée**
- [ ] **Leaflet Routing Machine** - npm install leaflet-routing-machine
- [ ] **Itinéraire piéton** - Calcul route vers vendeur
- [ ] **Mode transport** - Marche vs véhicule
- [ ] **Estimation temps** - Distance + durée trajet

### **🟢 Priorité FAIBLE - Polish**

#### **9. Performance & Monitoring**
- [ ] **Lighthouse audit** - Score > 85 PWA
- [ ] **Optimisation images** - WebP, lazy loading, thumbnails 150px
- [ ] **FCP < 3s** - First Contentful Paint sur 3G simulée
- [ ] **Sentry monitoring** - Alertes erreurs critiques

#### **10. CI/CD & Déploiement**
- [ ] **Vercel auto-déploiement** - Push main → déployer
- [ ] **Environment variables** - Production vs développement
- [ ] **Tests E2E** - Playwright pour flows critiques

---

## 🎯 **Prochaines Étapes Recommandées**

### **Semaine 1: Base de Données**
1. Créer compte Neon + configurer PostGIS
2. Implémenter schema SQL complet
3. Remplacer API mock par vraies requêtes

### **Semaine 2: Auth + Dashboard**
1. Implémenter auth OTP SMS
2. Créer page onboarding vendeur
3. Dashboard avec toggle online/offline

### **Semaine 3: Flow Transaction**
1. Notifications WebSocket
2. Flow vérification disponibilité
3. Navigation vers vendeur

---

## 📈 **Progression Globale**

- **Core MVP**: 30% (2/7 éléments majeurs)
- **Accessibilité**: 10% (0/4 éléments)
- **Polish**: 0% (0/2 éléments)
- **Total**: ~20% du PRD complet

---

## 🔄 **Dépendances**

```
Base de Données → Auth → Dashboard → Flow Transaction → Realtime
PWA → Performance → CI/CD
Recherche Multimodale → Accessibilité complète
```

---

*Dernière mise à jour: 26 Mars 2026*
*Prochaine revue: Après setup Neon Database*

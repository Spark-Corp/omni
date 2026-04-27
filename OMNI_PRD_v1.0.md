# OMNI PRD v1.0 - Markdown Version

## SPARK x OMNI | PRD v1.0 | Confidentiel
Construire des solutions logicielles pour le développement de l'Afrique.
Mars 2026

---

## Flow Onboarding Acheteur (moins de 30 secondes)

Ouvre Omni -> Géolocalisation automatique -> Carte avec vendeurs proches
Tap sur vendeur -> Popup 3 produits + prix -> Tap produit -> "Vérifier disponibilité"
Notification vendeur -> Réponse OUI/NON -> Navigation vers vendeur

## Flow Onboarding Vendeur (moins de 3 min)

Ouvre Omni -> Devenir vendeur
Numero de telephone -> OTP SMS -> verification
Nom de la boutique/stand + categorie principale
Localisation GPS automatique (ou saisie manuelle du quartier en fallback)
Ajout d'au moins 1 produit : nom + prix. Photo optionnelle.
Choix de la langue locale preferee pour les notifications vocales
Dashboard vendeur actif. Pret a passer Online.

---

## 5. Stack Technique — Zero Cout Bootstrap

Chaque couche a ete choisie pour sa gratuite au bootstrap, sa scalabilite future, et son adequation aux contraintes reseau africaines (faible bande passante, connexion intermittente).

**Note : Africa's Talking offre un free sandbox tier pour le SMS OTP. En alternative : Twilio trial credit (15$). Supabase free tier tient largement jusqu'à 10 000 utilisateurs actifs.**

---

## 6. Architecture Technique

### 6.1 Vue d'ensemble

**Option PRD Originale :**
- **PWA React/Vite deployee sur Vercel** (CDN global, HTTPS automatique)
- **Supabase comme Backend-as-a-Service unique : Auth, DB, Realtime, Storage**
- **PostGIS active sur Supabase pour les requetes geospatiales natives**
- **Service Worker Workbox pour le cache offline (catalogue + derniere carte)**
- **Transformers.js pour la reconnaissance image cote client (zero serveur ML)**
- **Web Speech API pour la saisie vocale et les notifications TTS vendeur**

**🚀 Notre Proposition Zero-Cost Alternative :**
- **PWA React/Vite deployee sur Vercel** (CDN global, HTTPS automatique) ✅
- **Neon Database comme PostgreSQL serverless : DB, PostGIS** ✅
- **Auth custom (@auth/create) : email/password + OTP SMS** ✅
- **WebSocket intégré à Vercel : Realtime** ✅
- **Service Worker Workbox pour le cache offline (catalogue + derniere carte)** ✅
- **Transformers.js pour la reconnaissance image cote client (zero serveur ML)** ✅
- **Web Speech API pour la saisie vocale et les notifications TTS vendeur** ✅

**📊 Comparaison Zero-Cost :**

| Feature | Supabase (PRD) | Notre Alternative | Coût mensuel |
|---------|----------------|-------------------|--------------|
| Database | ✅ PostGIS free | ✅ Neon PostGIS free | $0 |
| Auth | ✅ Intégré | ✅ @auth/create custom | $0 |
| Realtime | ✅ Intégré | ✅ WebSocket Vercel | $0 |
| Storage | ✅ Intégré | ✅ Vercel Blob | $0 |
| **Total** | **$0** | **$0** | **$0** |

### 6.2 Schema Base de Donnees

**Option PRD (Supabase) :**
- Supabase PostgreSQL + PostGIS

**🚀 Notre Alternative (Neon) :**
- Neon PostgreSQL serverless + PostGIS
- Tables custom pour auth (@auth/create)

```sql
-- Tables auth custom (Neon)
CREATE TABLE auth_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  "emailVerified" TIMESTAMP,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth_accounts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES auth_users(id),
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  password TEXT, -- hash argon2
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth_sessions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES auth_users(id),
  "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tables business (identiques PRD)
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES auth_users(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  location POINT NOT NULL, -- PostGIS
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER REFERENCES auth_users(id),
  vendor_id INTEGER REFERENCES vendors(id),
  product_id INTEGER REFERENCES products(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6.3 Requete geospatiale cle

```sql
Vendeurs actifs ayant un produit correspondant dans un rayon de 5km, tries par distance :

SELECT v.*, ST_Distance(v.location, ST_Point($lon,$lat)) as dist
FROM vendors v 
JOIN products p ON p.vendor_id = v.id
WHERE v.is_online = true
  AND p.name ILIKE '%' || $search || '%'
  AND ST_DWithin(v.location, ST_Point($lon,$lat), 5000)
ORDER BY dist LIMIT 3;
```

### 6.4 Securite

**Option PRD (Supabase) :**
- **Row Level Security Supabase**
- RLS active sur toutes les tables
- Un vendeur ne peut modifier que ses propres donnees (vendor_id = auth.uid())
- Les messages d'une transaction sont visibles uniquement par buyer_id et vendor_id concernes
- Les produits et positions des vendeurs OFFLINE ne sont pas retournes par les queries publiques
- Validation des donnees cote serveur via Supabase Edge Functions si necessaire

**🚀 Notre Alternative (Custom + Middleware) :**
- **Middleware auth React Router + @auth/create**
- **Validation middleware sur toutes les routes API**
- **Policy functions SQL pour sécurité au niveau BDD**

```javascript
// Middleware auth (src/middleware.js)
import { auth } from '@/auth';

export async function middleware(request) {
  const session = await auth();
  
  // Protection routes API
  if (request.nextUrl.pathname.startsWith('/api/vendors')) {
    if (!session) return Response.redirect('/login');
    
    // Vérifier propriété vendeur
    if (request.method === 'PUT' || request.method === 'DELETE') {
      const vendorId = request.nextUrl.pathname.split('/')[3];
      const isOwner = await verifyVendorOwnership(session.user.id, vendorId);
      if (!isOwner) return Response.redirect('/unauthorized');
    }
  }
  
  return Response.next();
}
```

```sql
-- Policy functions SQL (Neon)
CREATE OR REPLACE FUNCTION check_vendor_ownership(user_id_param INTEGER, vendor_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vendors v 
    JOIN auth_users u ON v.user_id = u.id
    WHERE v.id = vendor_id_param AND u.id = user_id_param
  );
END;
$$ LANGUAGE plpgsql;

-- Sécurité messages
CREATE OR REPLACE FUNCTION check_message_access(user_id_param INTEGER, message_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_id_param 
    AND (m.buyer_id = user_id_param OR m.vendor_id IN (
      SELECT id FROM vendors WHERE user_id = user_id_param
    ))
  );
END;
$$ LANGUAGE plpgsql;
```

**📊 Comparaison Sécurité :**

| Aspect | Supabase RLS | Notre Alternative | Niveau |
|--------|---------------|-------------------|---------|
| Auth | ✅ Intégré | ✅ @auth/create | Élevé |
| Propriété données | ✅ RLS natif | ✅ Middleware + SQL | Élevé |
| Validation | ✅ Edge Functions | ✅ Middleware | Élevé |
| Flexibilité | ⚠️ Limité | ✅ Totale | Supérieur |

---

## 7. Accessibilite & Inclusion

Omni est concu pour des populations a faible litteratie digitale et ecrite. Ce n'est pas optionnel, c'est une contrainte de design fondamentale.

### 7.1 Recherche multimodale

- **Texte :** clavier + autocompletion intelligente depuis la base produits
- **Voix :** Web Speech API en francais et langues locales. L'utilisateur parle, Omni reconnait et lance la recherche.
- **Image :** Photo de l'article depuis la galerie ou camera. Transformers.js MobileNet identifie la categorie/produit.

### 7.2 Interface vendeur accessible

- **Toggle Online/Offline :** bouton geant, code couleur vert/rouge, aucun texte obligatoire pour comprendre
- **Reponse aux demandes :** deux gros boutons OUI et NON, accessibles au pouce, sans lire
- **Notification vocale :** chaque demande est lue a voix haute dans la langue locale du vendeur
- **Exemple TTS Ewe :** 'Ama, nuatsu ade do be ena sacks risi eve. Ele atsoe a ?' (Un client veut 2 sacs de riz. Disponible ?)
- **Phrases cles pre-enregistrees par locateurs natifs pour les 5 langues prioritaires**

### 7.3 Performance reseau faible

- **PWA installable, fonctionne partiellement sans connexion**
- **Images :** lazy loading, compression WebP, thumbnails 150px maximum
- **Tiles map :** cache agressif via Service Worker pour les zones frequentees
- **Catalogue offline :** derniere version consultee accessible sans connexion
- **Cible performance :** First Contentful Paint sous 3 secondes sur connexion 3G simulee

---

## 8. Plan de Developpement — 90 Jours

### Sprint 0 — Setup (Semaines 1-2)

- Creation repo GitHub + setup Vercel + setup Supabase avec PostGIS active
- Scaffolding React + Vite + TypeScript + Tailwind + PWA plugin + shadcn/ui
- Schema DB complet + RLS policies + seed data de test
- Auth OTP SMS fonctionnelle (numero de telephone -> OTP -> session)
- CI/CD : push main -> deploiement auto Vercel

### Sprint 1 — Core MVP (Semaines 3-6)

- Carte Leaflet + OSM + affichage vendeurs en ligne avec leurs produits
- Toggle Online/Offline vendeur + mise a jour GPS Supabase
- Recherche texte + PostGIS (requete vendeurs proches dans 5km)
- Popup 3 vendeurs proches + selection
- Flow verification disponibilite (demande + reponse vendeur via Realtime)
- Navigation Leaflet Routing Machine vers vendeur selectionne
- Dashboard vendeur : onboarding complet + gestion catalogue
- Notifications push via Supabase Realtime

### Sprint 2 — Accessibilite & Richesse (Semaines 7-10)

- Recherche vocale (Web Speech API, francais + Ewe prioritaire)
- Reconnaissance image (Transformers.js MobileNet, bundle browser)
- TTS notifications vendeur (Web Speech + fichiers audio langue locale)
- Chat in-app in-transaction (Supabase Realtime)
- Mode offline partiel (Workbox cache strategy : cache-first pour catalogue)
- Fallback produit introuvable + alerte disponibilite future

### Sprint 3 — Polish & Launch (Semaines 11-13)

- Tests utilisateurs terrain : 10+ acheteurs, 10+ vendeurs en conditions reelles
- Optimisation performance (Lighthouse PWA score > 85, FCP < 3s sur 3G)
- Onboarding ameliore avec walkthrough interactif pour les vendeurs
- Sentry monitoring configure + alertes critiques
- Correction bugs issus des tests terrain
- Launch beta publique

---

## 9. Roadmap Post-Bootstrap

### V2 — Vendeurs Ambulants (Mois 4-6)

- Tracking GPS temps reel des vendeurs en mouvement (mise a jour toutes les 30s)
- Animation des points sur la carte pour les vendeurs ambulants
- Notification push : un vendeur avec votre article passe pres de chez vous
- Mode moto/velo : optimisation de la precision et de la frequence GPS

### V3 — Monetisation & Fidelisation (Mois 7-12)

- Vendeurs Premium : badge confiance + priorite dans les resultats + banniere
- Systeme de notes et avis post-transaction
- Dashboard analytics vendeur : vues, clics, transactions initiees
- Omni Pro : abonnement mensuel vendeur pour visibilite etendue et analytics

### V4 — Ecosysteme (Annee 2)

- Integration Mobile Money : Orange Money, MTN MoMo, Wave pour paiement in-app
- Livraison : partenariat moto-taxis locaux pour les articles lourds
- API Omni publique : apps tierces peuvent requeter le catalogue en temps reel
- Expansion : Benin, Cote d'Ivoire, Senegal, Ghana
- Omni B2B : fournisseurs grossistes, approvisionnement pour commerçants

---

## 10. Metriques de Succes

### 10.1 KPIs Bootstrap — J+90
[Details à compléter]

### 10.2 KPIs V1 — Mois 6
[Details à compléter]

---

---

## 🚀 Implementation Zero-Cost (Notre Proposition)

### Setup Rapide - 15 minutes

#### 1. Base de données Neon
```bash
# Créer compte Neon (gratuit)
# 1. neon.tech -> New Project
# 2. Choisir PostgreSQL + PostGIS
# 3. Copier connection string

# Variables environnement
DATABASE_URL="postgresql://[user]:[pass]@[neon-host]/[db]?sslmode=require"
```

#### 2. Authentification
```bash
# Installer dépendances
npm install @auth/core @auth/create argon2

# Variables
AUTH_SECRET="openssl rand -base64 32"
AUTH_URL="http://localhost:4001"

# SMS OTP (optionnel)
AT_USERNAME="sandbox"
AT_API_KEY="[africa-talking-key]"
```

#### 3. WebSocket Realtime
```bash
# Installer WebSocket
npm install ws

# src/app/api/realtime/route.js
export async function GET(request) {
  return new Response('WebSocket upgrade needed', {
    status: 101,
    headers: { 'Upgrade': 'websocket' }
  });
}
```

#### 4. Lancer l'app
```bash
npm run dev
# http://localhost:4001
```

### Architecture Complète

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  React Router    │    │   Neon DB       │
│   (Browser)     │◄──►│   (Vercel)       │◄──►│   (Cloud)       │
│                 │    │                  │    │                 │
│ • Auth cookies  │    │ • API routes     │    │ • auth_users    │
│ • WebSocket WS  │    │ • WebSocket WSS  │    │ • auth_sessions │
│ • SSE EventSource│   │ • Auth middleware│    │ • vendors       │
│                 │    │ • PostGIS queries│    │ • products      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Coûts Réels

| Service | Plan Free | Limites | Coût |
|---------|------------|----------|------|
| **Neon Database** | ✅ | 3GB storage, 100h compute | $0 |
| **Vercel Hosting** | ✅ | 100GB bandwidth | $0 |
| **Auth Custom** | ✅ | Illimité | $0 |
| **WebSocket** | ✅ | Illimité | $0 |
| **SMS OTP** | ✅ | Sandbox Africa's Talking | $0 |
| **Total** | | | **$0/mois** |

### Avantages vs Supabase

✅ **Contrôle total** sur l'architecture  
✅ **Pas de vendor lock-in**  
✅ **Migration facile** vers n'importe quelle BDD PostgreSQL  
✅ **Apprentissage profond** de chaque couche  
✅ **Scalabilité prévisible** et transparente  

---

## 11. Risques & Mitigations

### Risques Techniques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **Neon limits atteintes** | Moyen | Migration vers autre PostgreSQL facile |
| **WebSocket scaling** | Faible | Utiliser Server-Sent Events en fallback |
| **Auth custom maintenance** | Faible | Code simple et bien documenté |
| **SMS OTP costs** | Faible | Sandbox gratuit + alternatives Twilio |

### Risques Business

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **Adoption utilisateurs** | Élevé | Design accessible PRD + tests terrain |
| **Concurrence** | Moyen | Focus sur inclusion et accessibilité |
| **Monétisation** | Moyen | Roadmap V3 déjà définie |

---

*Fin du document PRD v1.0 avec notre proposition zero-cost*

# PRD OMNI - Extraits Authentification & Stack Technique

## Stack Technique — Zero Cout Bootstrap

### Base de données
- **Supabase** comme Backend-as-a-Service unique : Auth, DB, Realtime, Storage
- **PostGIS** actif sur Supabase pour les requêtes géospatiales natives
- **Supabase free tier tient largement jusqu'à 10 000 utilisateurs actifs**

### Authentification
- **Auth OTP SMS** fonctionnelle (numero de telephone -> OTP -> session)
- **Africa's Talking** offre un free sandbox tier pour le SMS OTP
- Alternative : **Twilio trial credit (15$)**

### Sécurité
- **Row Level Security Supabase**
- RLS active sur toutes les tables
- Un vendeur ne peut modifier que ses propres données (vendor_id = auth.uid())
- Les messages d'une transaction sont visibles uniquement par buyer_id et vendor_id concernés

## Configuration recommandée selon PRD:

### Base de données Supabase (gratuite)
```bash
# Supabase fournit automatiquement ces variables
DATABASE_URL="postgresql://[supabase-provided-url]"
SUPABASE_URL="https://[project-id].supabase.co"
SUPABASE_ANON_KEY="[supabase-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[supabase-service-key]"
```

### Authentification OTP SMS
```bash
# Option 1: Africa's Talking (recommandé pour l'Afrique)
AT_USERNAME="votre-username"
AT_API_KEY="votre-api-key"

# Option 2: Twilio (alternative)
TWILIO_ACCOUNT_SID="votre-sid"
TWILIO_AUTH_TOKEN="votre-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Auth configuration
AUTH_SECRET="openssl rand -base64 32"
AUTH_URL="http://localhost:4001"
```

### Services gratuits du PRD
- **Supabase** : 10,000 utilisateurs actifs free tier
- **Africa's Talking** : Sandbox SMS gratuite
- **Vercel** : Hosting gratuit avec CDN global
- **OpenStreetMap** : Cartes gratuites
- **Transformers.js** : ML côté client gratuit

## Variables d'environnement complètes (PRD + Stack existante)
```bash
# Base de données Supabase
DATABASE_URL="postgresql://[supabase-url]"
SUPABASE_URL="https://[project-id].supabase.co" 
SUPABASE_ANON_KEY="[supabase-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[supabase-service-key]"

# Auth
AUTH_SECRET="[32-characters-secret]"
AUTH_URL="http://localhost:4001"

# SMS OTP (Africa's Talking recommandé)
AT_USERNAME="sandbox"
AT_API_KEY="your-api-key"

# Create XYZ
NEXT_PUBLIC_PROJECT_GROUP_ID=""
```

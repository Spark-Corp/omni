# Omni Next.js — Setup Guide

## Quick Start

```bash
cd omni/apps/nextjs
npm install
```

## Environment Setup

1. **Copy environment file:**
```bash
cp .env.local.example .env.local
```

2. **Configure `.env.local`:**
```env
# Database (from Neon Console)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Neon Auth (enable in Neon Console first!)
NEON_AUTH_URL=https://your-project.neonauth.region.neon.tech/dbname/auth

# Generate with: openssl rand -base64 32
AUTH_SECRET=your-generated-secret-here
```

3. **Enable Neon Auth:**
- Go to [console.neon.tech](https://console.neon.tech)
- Select your project
- Click **Auth** tab
- Click **Enable Neon Auth**
- Copy the **Auth URL**

## Database Setup

1. **Create tables in Neon:**
```bash
# Run the SQL from the web app
psql $DATABASE_URL -f ../web/scripts/create-tables.sql

# Apply RLS policies
psql $DATABASE_URL -f ../web/scripts/rls-policies.sql
```

Or use the Neon SQL Editor to run:
- `omni/apps/web/scripts/create-tables.sql`
- `omni/apps/web/scripts/rls-policies.sql`

## Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
omni/apps/nextjs/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (main)/           # Protected pages
│   │   └── page.tsx     # Map view
│   ├── api/
│   │   ├── auth/        # Neon Auth API
│   │   └── vendors/     # Vendor CRUD API
│   ├── vendor/          # Vendor dashboard pages
│   ├── layout.tsx
│   └── page.tsx        # Landing page
├── components/          # Shared components
├── hooks/               # Custom hooks
├── lib/
│   ├── auth.ts         # Neon Auth config
│   └── sql.ts          # Database client
└── package.json
```

## Features

### Auth
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Session management via Neon Auth
- ✅ Protected routes

### Map
- ✅ MapLibre GL with globe view
- ✅ Vendor markers (online/offline)
- ✅ Geolocation
- ✅ Search (text + voice)
- ✅ Route to vendor

### Vendor Dashboard
- ✅ Toggle online/offline
- ✅ Add/edit products
- ✅ View requests
- ✅ Availability responses

## Deployment to Vercel

1. **Push to GitHub:**
```bash
git add .
git commit -m "Omni Next.js ready"
git push
```

2. **Connect to Vercel:**
- Go to [vercel.com](https://vercel.com)
- Import project from GitHub
- Select `omni/apps/nextjs`

3. **Add Environment Variables in Vercel:**
- `DATABASE_URL`
- `NEON_AUTH_URL`
- `AUTH_SECRET`

4. **Deploy!**

## Troubleshooting

### "Module not found"
```bash
npm install
```

### "DATABASE_URL not set"
- Check `.env.local` exists
- Restart dev server

### "Neon Auth not working"
- Ensure Neon Auth is enabled in Neon Console
- Check `NEON_AUTH_URL` is correct

### "Unauthorized" errors
- Check user is logged in
- Verify session cookie is set

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | No | Neon Auth handlers |
| `/api/vendors/nearby` | POST | No | Get nearby vendors |
| `/api/vendors/search` | POST | No | Search vendors |
| `/api/vendors/create` | POST | Yes | Create vendor |
| `/api/vendors/my-vendor` | GET | Yes | Get user's vendor |
| `/api/vendors/toggle-status` | POST | Yes | Toggle online/offline |
| `/api/vendors/products/create` | POST | Yes | Add product |
| `/api/vendors/products/[id]` | PUT/DELETE | Yes | Update/delete product |

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** Neon Auth (Better Auth)
- **Database:** Neon PostgreSQL + PostGIS
- **Maps:** MapLibre GL
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

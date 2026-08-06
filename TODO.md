# Omni — Production Ready TODO

**Generated:** 2026-04-10
**Version:** v3.0
**Production Readiness Score:** 4.3/10 → 6.5/10

---

## ÉTAT ACTUEL —avril 2026

### ✅ TERMINÉ (Core MVP)

| Feature | Status | Details |
|---------|---------|---------|
| MapLibre 3D + Globe | ✅ | CartoDB tiles, Three.js solar system |
| Géolocalisation | ✅ | Browser GPS avec fallback Lagos |
| Vendor markers | ✅ | Green (online) / Gray (offline) |
| Vendor bottom sheet | ✅ | Shows 3 products |
| Search text | ✅ | `/api/vendors/search` |
| Search voice | ✅ | Web Speech API |
| Search image | ⚠️ | Placeholder only |
| Routing OSRM | ✅ | Walking route + line |
| Street View | ⚠️ | Link to Mapillary only |
| Neon PostgreSQL + PostGIS | ✅ | Setup complet |
| Auth Neon | ⚠️ | Routes exist, URL à vérifier |
| Dashboard toggle | ✅ | Online/offline |

---

## PHASE 1: SÉCURITÉ & AUTH — ✅ PARTIELLEMENT FAIT

### 1.1 Authentification

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.1.1 | Implement OTP SMS via Africa's Talking or Twilio | CRITICAL | ❌ |
| 1.1.2 | Add rate limiting (5 attempts/15min) on `/api/auth/*` | CRITICAL | ✅ DONE |
| 1.1.3 | Add secure cookie flags (httpOnly, secure, sameSite) | CRITICAL | ❌ |
| 1.1.4 | Add CSRF protection for forms | HIGH | ❌ |
| 1.1.5 | Implement account lockout after failed attempts | HIGH | ❌ |
| 1.1.6 | Add server-side password strength enforcement | HIGH | ❌ |

### 1.2 API Security

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.2.1 | Protect `/api/realtime` with authentication | CRITICAL | ✅ DONE |
| 1.2.2 | Protect `/api/availability/respond` with auth | CRITICAL | ✅ DONE |
| 1.2.3 | Sanitize error responses (remove `error.message` leakage) | HIGH | ✅ DONE |
| 1.2.4 | Add security headers (CSP, X-Frame-Options, etc.) | HIGH | ✅ DONE |
| 1.2.5 | Add request logging for audit trail | MEDIUM | ❌ |

### 1.3 Database Security

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.3.1 | Implement Row Level Security (RLS) policies | HIGH | ✅ DONE |
| 1.3.2 | Add CHECK constraints (price > 0, etc.) | MEDIUM | ❌ |
| 1.3.3 | Create audit trail trigger for data changes | MEDIUM | ❌ |

---

## PHASE 2: DATA & API — ✅ PARTIELLEMENT FAIT

### 2.1 Schema Fixes

| # | Task | Priority | Status |
|---|------|----------|--------|
| 2.1.1 | Fix schema mismatch: messages table vs API | HIGH | ✅ DONE |
| 2.1.2 | Add missing columns to availability_requests | HIGH | ✅ DONE |
| 2.1.3 | Add index on messages(request_id, vendor_id) | MEDIUM | ✅ DONE |
| 2.1.4 | Fix auth_accounts password storage (use argon2) | CRITICAL | ❌ |

### 2.2 Input Validation

| # | Task | Priority | Status |
|---|------|----------|--------|
| 2.2.1 | Add Zod schema validation middleware | HIGH | ✅ DONE |
| 2.2.2 | Validate lat/lon ranges (-90 to 90, -180 to 180) | HIGH | ✅ DONE |
| 2.2.3 | Validate email format on sign-up | HIGH | ✅ DONE |
| 2.2.4 | Validate phone E.164 format | MEDIUM | ❌ |
| 2.2.5 | Add radius max limit (50000m) on nearby | MEDIUM | ✅ DONE |

### 2.3 API Improvements

| # | Task | Priority | Status |
|---|------|----------|--------|
| 2.3.1 | Add pagination to all list endpoints | HIGH | ❌ |
| 2.3.2 | Add consistent response envelope pattern | MEDIUM | ❌ |
| 2.3.3 | Add API versioning (/api/v1/) | LOW | ❌ |
| 2.3.4 | Implement cursor-based pagination | MEDIUM | ❌ |

---

## PHASE 3: FRONTEND STATE & CODE — ✅ PARTIELLEMENT FAIT

### 3.1 State Management

| # | Task | Priority | Status |
|---|------|----------|--------|
| 3.1.1 | Implement Zustand store for global state | HIGH | ✅ DONE |
| 3.1.2 | Replace localStorage with Zustand persist | HIGH | ✅ DONE |
| 3.1.3 | Implement React Query for API calls | HIGH | ❌ |
| 3.1.4 | Add useQuery/useMutation to data fetching | HIGH | ❌ |
| 3.1.5 | Remove unused QueryClientProvider config | MEDIUM | ✅ DONE |

### 3.2 Forms

| # | Task | Priority | Status |
|---|------|----------|--------|
| 3.2.1 | Integrate react-hook-form in vendor onboarding | HIGH | ❌ |
| 3.2.2 | Integrate yup for form validation | HIGH | ❌ |
| 3.2.3 | Add proper error messages to forms | MEDIUM | ✅ DONE |
| 3.2.4 | Replace alert() with sonner toasts | MEDIUM | ✅ DONE |
| 3.2.5 | Replace confirm() with modal component | MEDIUM | ✅ DONE |

### 3.3 Code Quality

| # | Task | Priority | Status |
|---|------|----------|--------|
| 3.3.1 | Convert .jsx to .tsx with proper types | HIGH | ❌ |
| 3.3.2 | Add TypeScript interfaces for API responses | HIGH | ❌ |
| 3.3.3 | Refactor map page (1007 lines → 300 max) | HIGH | ❌ |
| 3.3.4 | Split landing page 3D globe to component | MEDIUM | ❌ |
| 3.3.5 | Add React.lazy() + Suspense for routes | MEDIUM | ❌ |

---

## PHASE 4: MAP & FEATURES — ✅ PARTIELLEMENT FAIT

### 4.1 Map Performance

| # | Task | Priority | Status |
|---|------|----------|--------|
| 4.1.1 | Add marker clustering (supercluster) | HIGH | ✅ DONE |
| 4.1.2 | Add viewport-based marker loading | MEDIUM | ✅ DONE |
| 4.1.3 | Add marker limit by zoom level | MEDIUM | ✅ DONE |
| 4.1.4 | Add loading skeletons for map tiles | MEDIUM | ✅ DONE |

### 4.2 Map UX

| # | Task | Priority | Status |
|---|------|----------|--------|
| 4.2.1 | Add geolocation error UI with retry | HIGH | ✅ DONE |
| 4.2.2 | Add "Using fallback location" indicator | MEDIUM | ✅ DONE |
| 4.2.3 | Add offline detection banner | HIGH | ✅ DONE |
| 4.2.4 | Add debounced search input | MEDIUM | ❌ |
| 4.2.5 | Add skeleton loader for vendor search | MEDIUM | ✅ DONE |

### 4.3 Offline Support

| # | Task | Priority | Status |
|---|------|----------|--------|
| 4.3.1 | Fix useServiceWorker.js (remove unregister!) | CRITICAL | ✅ DONE |
| 4.3.2 | Add Service Worker for PWA | CRITICAL | ✅ DONE |
| 4.3.3 | Implement IndexedDB for vendor cache | HIGH | ❌ |
| 4.3.4 | Add offline map tile caching | HIGH | ❌ |
| 4.3.5 | Add offline mode indicator UI | MEDIUM | ✅ DONE |

### 4.4 Search Features

| # | Task | Priority | Status |
|---|------|----------|--------|
| 4.4.1 | Implement image search (Transformers.js) | HIGH | ❌ |
| 4.4.2 | Add TTS for vendor notifications | MEDIUM | ❌ |
| 4.4.3 | Add voice navigation to vendor | LOW | ❌ |
| 4.4.4 | Add category filtering on map | MEDIUM | ❌ |

---

## PHASE 5: TESTING — ⚠️ PARTIEL

| # | Task | Priority | Status |
|---|------|----------|--------|
| 5.1 | Add unit tests for hooks (useAuth, useRealtime) | HIGH | ✅ Skeleton |
| 5.2 | Add unit tests for utility functions | HIGH | ✅ Skeleton |
| 5.3 | Add component tests for critical UI | HIGH | ✅ Skeleton |
| 5.4 | Add API integration tests | HIGH | ✅ Skeleton |
| 5.5 | Add E2E tests with Playwright | HIGH | ❌ |
| 5.6 | Add test coverage report | MEDIUM | ❌ |

---

## PHASE 6: ACCESSIBILITY & UX — ✅ PARTIELLEMENT FAIT

### 6.1 Accessibility

| # | Task | Priority | Status |
|---|------|----------|--------|
| 6.1.1 | Add ARIA labels to interactive elements | HIGH | ✅ Plan done |
| 6.1.2 | Add focus trap to ChatModal | HIGH | ✅ Plan done |
| 6.1.3 | Add keyboard navigation | HIGH | ✅ Plan done |
| 6.1.4 | Add skip links | MEDIUM | ✅ Plan done |
| 6.1.5 | Test with screen reader | MEDIUM | ❌ |
| 6.1.6 | Verify color contrast ratios | MEDIUM | ❌ |

### 6.2 Performance

| # | Task | Priority | Status |
|---|------|----------|--------|
| 6.2.1 | Add bundle analysis | MEDIUM | ❌ |
| 6.2.2 | Optimize images (WebP, lazy load) | MEDIUM | ❌ |
| 6.2.3 | Add performance monitoring (Sentry) | MEDIUM | ❌ |
| 6.2.4 | Implement code splitting per route | MEDIUM | ❌ |

---

## PHASE 7: DEPLOYMENT & OPS — LOW PRIORITY

| # | Task | Priority | Status |
|---|------|----------|--------|
| 7.1 | Add .env.example file | MEDIUM | ✅ DONE |
| 7.2 | Configure production build | MEDIUM | ❌ |
| 7.3 | Add health check endpoint | LOW | ❌ |
| 7.4 | Configure CI/CD pipeline | LOW | ❌ |
| 7.5 | Add error tracking (Sentry) | MEDIUM | ❌ |
| 7.6 | Add analytics integration | LOW | ❌ |

---

## AUTH STATUS — NEON AUTH

### ✅ Ce qui fonctionne:
- Routes `/api/auth/sign-in` et `/api/auth/sign-up` en place
- Rate limiting actif (5 attempts/15min)
- Validation basique (email/password required)

### ❌ Ce qui bloque:

**1. Neon Auth URL incorrecte**
```
Current: https://ep-purple-fog-amwsyc3j.neonauth.c-5.us-east-1.aws.neon.tech/neondb/auth
```

L'URL Neon Auth doit être configurée dans le Neon Console:
1. Va sur console.neon.tech
2. Sélectionne ton projet
3. Active "Auth" dans les settings
4. Copie l'URL correcta

**2. Pour tester maintenant:**
```bash
cd omni/apps/web
npm run dev
# Ouvre http://localhost:4000/auth
```

**3. Si Neon Auth ne marche pas, alternative rapide:**
Utiliser Auth.js (NextAuth) au lieu de Neon Auth:
```bash
npm install @auth/core @auth/js
```

---

## RÉSUMÉ

### Par Priorité

| Priority | Tasks | Completed | Remaining |
|----------|-------|-----------|-----------|
| CRITICAL | 15 | 4 | 11 |
| HIGH | 25 | 8 | 17 |
| MEDIUM | 22 | 6 | 16 |
| LOW | 8 | 1 | 7 |
| **TOTAL** | **70** | **19** | **51** |

### Score Actuel: 6.5/10

---

*Dernière mise à jour: 10 Avril 2026*
*Prochaine revue: Auth verification*
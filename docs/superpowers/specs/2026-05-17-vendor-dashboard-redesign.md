# Vendor Dashboard Redesign

## Scope
Redesign the entire vendor section (onboarding + dashboard layout + sub-pages) to match the Omni brand identity (`#08080f` dark theme, glass cards, emerald accents). Phase 1 focuses on the onboarding page — the most critical conversion point.

## Design Direction (Approach A)
- **Background**: `#08080f` (same as landing page) — no more light green/gray mismatch
- **Cards**: `bg-white/[0.03]` + `border border-white/[0.06]` rounded-2xl — glass effect
- **Inputs**: `bg-white/[0.04]` + `border-white/[0.08]` — subtle dark inputs
- **Accents**: Emerald-400 for CTAs, focus states, active indicators
- **Typography**: `font-space-grotesk` for headings, `font-dm-sans` for body
- **Sidebar**: Not shown during onboarding. Full-screen centered flow. Sidebar appears only in dashboard (post-onboarding).

## Onboarding Flow (2 steps)

### Step 1 — Infos boutique
- Full viewport dark bg, centered column (max-w-lg)
- Step indicator (2 dots + "Étape 1/2" label)
- Glass card with form fields: Name, Category (select), Phone, Description (textarea), Location (auto-detect)
- Input icons (Store, MapPin) for visual cues
- Submit → validates, moves to Step 2

### Step 2 — Produits
- Same layout, step indicator shows Step 2
- Product cards with Name + Price + Unit inputs
- "+ Ajouter un produit" button (dashed border)
- Remove button per product (min 1 required)
- Submit → POST to /api/vendors/create → redirect to /vendor/dashboard

### Auth gate
- If not logged in → show CTA "Connecte-toi pour continuer" with link to /auth
- If already has vendor → redirect to /vendor/dashboard

## Implementation Plan

### Files to modify
- `src/app/vendor/onboarding/page.jsx` — Complete rewrite (dark theme, glass cards, restructured form)

### Not in scope (Phase 2)
- `src/app/vendor/layout.jsx` + `layout.module.css` — Sidebar redesign (dark theme)
- `src/app/vendor/dashboard/page.jsx` — Dashboard page
- `src/app/vendor/products/page.jsx`, `requests/page.jsx`, `messages/page.jsx`

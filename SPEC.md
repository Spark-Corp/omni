# OMNI — Design Specification v2.0

**Date:** 2026-04-10
**Status:** Draft for User Approval

---

## 1. Problem Statement

### The Pain

**Buyer:** "I need [produit/service]. Where do I find that around here?"
- Walk around asking
- Call friends, family
- Go to physical market hoping it's there
- *Result: Time wasted, energy lost, sometimes just give up*

**Vendor:** "I have [produit/service]. How do people find me?"
- Physical sign only
- Word of mouth
- Facebook/WhatsApp (requires creating content)
- *Result: Customers don't know I exist, sales missed*

**The Gap:** Google Maps shows WHERE the shop is, but NOT WHAT they sell. Social media requires MARKETING which small vendors hate/don't know how to do.

---

## 2. Solution

### Omnis the local marketplace where:
- Everything available nearby is searchable
- Vendors don't need to create content - just list what they have
- Buyers find in 30 seconds what used to take hours

**Vision:** "When you need something, you search Omni. When you have something to sell, you list it on Omni."

---

## 3. Target Market

| Segment | Description |
|---------|-------------|
| **Zone initially** | 1 neighborhood, 1 city (Lomé/Togo for MVP) |
| **Expand to** | West Africa → Africa → Global |
| **TAM** | $800B+ informal commerce in Africa |
| **Serviceable Obtainable Market** | $50B+ local marketplace |

---

## 4. Business Model — Discovery First

### The CORE
- ✅ "Do you have X?" → YES/NO
- ✅ Free to use for all
- ✅ Build network FIRST

### Revenue Streams (Independent of Payment Providers)

| Revenue Stream | Model | Example |
|---------------|-------|---------|
| **Premium Listings** | Monthly: 2,500 XOF/mo | Vendor pays to appear in top 3 |
| **Featured Category** | Daily: 200 XOF/day | "Best in [category]" |
| **Brand Deals** | Per campaign | Brand sponsors "Deals near you" |
| **Promoted Search Results** | CPC | 25 XOF per tap |
| **Omni for Business** | Subscription: 5,000 XOF/mo | Dashboard + analytics |
| **Location Ads** | Per view | "Shop in [location]" displayed |

### The Real Moat = NETWORK

```
MVP: Free → 50 vendors, 100 users
    ↓
Year 1: 10K vendors, 100K users
    ↓
Year 3: Network effects = WINNER takes most
    ↓
Revenue from: everyone who wants to be found + brands
```

### Why This Works in Africa

| Problem | Our Solution |
|---------|-------------|
| No credit cards | We're free anyway |
| No payment trust | We don't touch money |
| Low smartphone for vendors | USSD fallback (optional) |
| Hard to list | Just product name + price |

### Exactly Like Google

| Google | Omni |
|--------|------|
| Search for info | Search for products nearby |
| Ads revenue (CPC) | Ads revenue (CPC) |
| Free search, paid ads | Free search, paid listing |
| Sells your attention to advertisers | Sells visibility to vendors |
| $300B+ revenue | Target: $1B+ eventually |

> "We're Google for local commerce. You search 'pate nearby', we show vendors. The ones who pay appear first. Same model, local focus."

### The Real Moat = NETWORK

```
User searches "patates" 
→ Sees 10 vendors nearby 
→ Top 3 are "Sponsored" (they pay)
→ Click = $$$ for us
→ FREE for users to see

NO PAYMENTS TO MANAGE. NO INVENTORY. NO LOGISTICS.
Just SEARCH + VISIBILITY.
```

---

## 5. Product Features

### 5.1 Buyer App

| Feature | Description |
|---------|-------------|
| **Map view** | See vendors near you on map |
| **Search** | Text, voice, image |
| **Categories** | Food, electronics, services, etc. |
| **Vendor card** | Name, location, 3 products preview |
| **Availability check** | "Do you have X?" → Vendor responds |
| **Directions** | Walking route to vendor |
| **Call/WhatsApp** | Direct contact |

### 5.2 Vendor App

| Feature | Description |
|---------|-------------|
| **Simple listing** | Add product + price (no photos required) |
| **One-tap toggle** | I'm open / I'm closed |
| **Requests** | See who's asking for what |
| **One-tap response** | YES / NO buttons |
| **Notifications** | Get notified when someone's looking |
| **Stats** | How many views, requests |

### 5.3 Key UX Principles

| Principle | Implementation |
|-----------|----------------|
| **30 seconds** | Buyer finds what looking for in <30s |
| **3 minutes** | Vendor onboarded in <3 min |
| **No content creation** | Just add product name + price |
| **Works offline** | PWA - load last search offline |
| **Works on 3G** | Lightweight, fast loading |

---

## 6. Technical Architecture

### Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router) |
| **Maps** | MapLibre GL + Three.js |
| **Database** | Neon PostgreSQL + PostGIS |
| **Auth** | Neon Auth (Better Auth) |
| **Real-time** | Server Actions + SSE |
| **Hosting** | Vercel (free tier) |

### Project Structure

```
omni/apps/nextjs/
├── app/
│   ├── (auth)/          # Sign in, Sign up
│   ├── (main)/          # Map view
│   ├── api/auth/        # Neon Auth API
│   ├── api/vendors/     # Vendor CRUD
│   └── vendor/           # Dashboard pages
├── components/          # Shared UI
├── hooks/               # useAuth, useRealtime
└── lib/                 # auth.ts, sql.ts
```

### Core Tables

```sql
vendors (id, name, category, location, is_online, user_id)
products (id, vendor_id, name, price, unit)
requests (id, product, buyer_location, status)
messages (id, request_id, sender, content)
```

---

## 7. Go-to-Market

### Phase 1: Neighborhood Launch (Months 1-3)

| Step | Action |
|------|--------|
| 1 | Identify 50 vendors in Bè, Lomé |
| 2 | List them (free) with 1-3 products each |
| 3 | Test with 10-20 buyers |
| 4 | Iterate on feedback |
| 5 | Launch publicly |

### Phase 2: City Expansion (Months 4-6)

- Expand to all of Lomé
- Add 500+ vendors
- Launch badge program

### Phase 3: Regional (Months 7-12)

- Expand to Togo, Ghana, Benin
- Add services, not just products

### Phase 4: Global (Year 2+)

- Africa first
- Then emerging markets globally

---

## 8. Competitive Advantage

| Competitor | Weakness | Omni Advantage |
|-----------|---------|--------------|
| **Google Maps** | No product catalog | Products/services searchable |
| **Facebook Marketplace** | Requires marketing | Just list, no content |
| **Jumia** | B2C focus only | Local vendors, hyperlocal |
| **Wasoko/MaxAB** | B2B only | B2C + services |
| **WhatsApp** | No discovery | Searchable marketplace |

---

## 9. Why This Can Be Big — Investor Thesis

### 1. Massive TAM
- 60%+ of African economy is informal
- 100M+ small vendors, 500M+ potential buyers
- Every city, every country = same problem

### 2. Network Effects
- More vendors → better for buyers → more buyers → more vendors
- Winner takes most (marketplace dynamics)

### 3. Data Moat
- Who buys what, where, when = valuable
- Can expand to credit, logistics, supply chain

### 4. Expandable
- Products → Services → Jobs → Housing → ...
- Each vertical = billion-dollar market

### 5. Defensible
- Local data = competitive moat
- Relationships with vendors = hard to replicate

---

## 10. Success Metrics

### KPI Targets

| Metric | Month 3 | Month 6 | Month 12 |
|-------|--------|---------|---------|
| **Vendors** | 50 | 500 | 5,000 |
| **Buyers** | 100 | 2,000 | 20,000 |
| **Searches/day** | 50 | 500 | 5,000 |
| **Revenue** | 0 (growth phase) | 50K XOF | 500K XOF |

### Growth Trajectory (for investors)

| Year | Vendors | GMV Equivalent |
|------|--------|---------------|
| Year 1 | 10,000 | $0 (building) |
| Year 2 | 100,000 | $100K MRR |
| Year 3 | 1M | $1M MRR |
| Year 5 | 10M+ | $10M+ MRR |

---

## 11. Investor Pitch — YC Combinator Style

### The Pitch (30 seconds)
> "Omni is Google Maps for what people sell, not where they sell. Every day, 500M+ Africans need to find something locally. They ask friends, walk markets, or give up. Omni is the search engine for local commerce — just search 'patates' and see every vendor within 5km who has it."

### Why Now
1. **Smartphone penetration** — 80%+ Africans have smartphones
2. **Mobile money** — Frictionless payments possible
3. **Trust building** — WhatsApp normalized digital for neighbors

### Why Us
- **Hyperlocal first** — We don't compete with Jumia (national), we own the neighborhood
- **Zero friction** — No payment required to use, no inventory to manage
- **Viral** — Every user becomes a promoter ("found X on Omni")

### The Ask
- We're raising a friends & family round to launch MVP
- Target: $50K-100K for 6 months runway
- Convert to SAFEs (YF/Y Combinator style)

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **Chicken-egg** | Free listing, manual vendor acquisition |
| **Low-tech vendors** | Extremely simple - phone number + product name only |
| **Offline** | PWA works cached |
| **Trust** | Reviews, verified badges |
| **Competition** | First mover + hyperlocal focus |

---

## 12. Next Steps

1. **User approves this design** ✅ Waiting
2. **Create implementation plan** (writing-plans skill)
3. **Build MVP** (60-90 days)
4. **Launch with 50 vendors** (neighborhood)
5. **Iterate based on data**

---

*Let me know if this design needs changes before proceeding to implementation plan.*
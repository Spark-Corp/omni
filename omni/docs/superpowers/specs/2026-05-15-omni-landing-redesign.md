# Omni Landing Redesign

**Date:** 2026-05-15
**Status:** Approved
**Sources:** Open Design (Supabase, Vercel, OpenCode design systems) + UI/UX Pro Max Skill

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#08080f` | Page background |
| `surface` | `#0f0f1a` | Cards, containers |
| `surface-elevated` | `#181825` | Hover/dropdown surfaces |
| `border` | `rgba(255,255,255,0.04)` | Subtle borders |
| `border-strong` | `rgba(255,255,255,0.06)` | Card borders, dividers |
| `accent` | `#22C55E` (emerald-500) | CTAs, badges, active states |
| `accent-hover` | `#16A34A` (emerald-600) | Button hover |
| `text-primary` | `#fafafa` | Primary text |
| `text-secondary` | `rgba(255,255,255,0.65)` | Body text |
| `text-muted` | `rgba(255,255,255,0.35)` | Captions, metadata |
| `gradient-heading` | `from-emerald-400 to-teal-300` | Hero/stat headings |

### Typography
| Role | Font | Size | Weight | Class |
|------|------|------|--------|-------|
| Display | Space Grotesk | 5xl–7xl | 700 | `font-space-grotesk font-bold tracking-tight` |
| Section heading | Space Grotesk | 3xl–5xl | 700 | `font-space-grotesk font-bold tracking-tight` |
| Card title | Space Grotesk | xl–2xl | 600 | `font-space-grotesk font-semibold` |
| Body | DM Sans | sm–base | 400 | `font-dm-sans` |
| UI/labels | DM Sans | xs–sm | 500 | `font-dm-sans font-medium` |
| Caps label | Space Grotesk | 10px–xs | 500 | `font-space-grotesk tracking-[0.25em] uppercase` |

### Effects
- Glassmorphism: `bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]`
- Buttons: emerald-500 fill, hover emerald-400, `rounded-lg` to `rounded-xl`
- Section dividers: `border-y border-white/[0.03]`
- Transitions: 300ms ease-out on all interactive elements
- Card hover: `hover:-translate-y-0.5 transition-transform duration-300`

### Layout Rhythm
- Section padding: `py-24 md:py-32`
- Container max: `max-w-6xl` (generous)
- Card padding: `p-8 md:p-10`
- Grid gap: `gap-6 md:gap-8`

## Section Designs

### 1. Nav
- Sticky `top-0 z-50 h-14 bg-[#08080f] border-b border-white/[0.04]`
- Logo: emerald gradient icon + "Omni" in Space Grotesk semibold
- Links: DM Sans, `text-white/50 hover:text-white/80 transition-colors`
- Phase dots: refined, smaller, emerald when active
- CTA: emerald-500 fill, pill `rounded-lg`

### 2. Hero / Scroll Demo
- 400vh section + sticky container (`top-0 h-screen`)
- Globe: offset-left, `w-full lg:w-1/2 h-full`, slightly larger
- Content right: `pt-10 sm:pt-12`, DM Sans body text
- Badge: refined glass pill
- Heading: Space Grotesk 5xl–7xl, emerald→teal gradient, tracking-tight
- Subtitle: Space Grotesk, `text-white/80`
- Search bar: glassmorphism, refined borders
- Marker cards: rounded-2xl, emerald first dot, amber rest
- Stars CSS: 300 dots, dimmer range (0.08–0.25)
- Mobile overlay: DM Sans
- Scroll hint: white/15, smaller

### 3. Problem Section
- `py-28 md:py-32`, no background change
- Label: Space Grotesk caps, `text-emerald-400/80`
- Heading: Space Grotesk 3xl–5xl bold
- Body: DM Sans, `text-white/50 text-base md:text-lg`
- Closing emphasis: `text-emerald-400/80 font-medium`
- Borders: `border-y border-white/[0.03]`

### 4. Market Section (Stats)
- `bg-white/[0.01]` slab with `border-y border-white/[0.04]`
- Grid: `md:grid-cols-3 gap-6 md:gap-10`
- Stat numbers: Space Grotesk 5xl–7xl bold, emerald→teal gradient
- Stat labels: DM Sans, `text-white/50`, max-w-[22ch]
- Cards: `bg-white/[0.02] border border-white/[0.04] rounded-2xl p-10 md:p-12`
- Hover: `hover:-translate-y-0.5 transition-transform duration-300`

### 5. Two Sides Section
- Same label/heading pattern
- Buyer card: `from-emerald-500/[0.04] to-transparent border-emerald-500/10`
- Seller card: `from-blue-500/[0.04] to-transparent border-blue-500/10`
- Icons: ShoppingBag (emerald-400), Store (blue-400)
- Titles: Space Grotesk xl–2xl bold
- Lists: DM Sans, `text-white/50 text-sm leading-relaxed`

### 6. CTA Section
- Premium gradient card: `rounded-[2.5rem] p-12 md:p-16`
- Background: emerald→blue gradient + soft radial
- Heading: Space Grotesk 3xl–5xl bold
- Subtitle: DM Sans
- Primary CTA: emerald-500 fill, pill rounded-2xl
- Secondary: `bg-white/[0.04] border-white/10`

### 7. Footer
- `py-10 md:py-12`, `border-t border-white/[0.03]`
- Logo + copyright (DM Sans, white/30)
- Links: Confidentialité, Conditions, Contact (DM Sans, white/35)

## Implementation Steps

1. Update Tailwind config: add DM Sans as default `font-sans`
2. Update `global.css` if needed for font loading
3. Refactor `page.jsx`: Space Grotesk on headings, DM Sans on body
4. Update section paddings, borders, hover effects
5. Polish nav heights, link styles, CTA pill radius
6. Refine hero content spacing and badge styling
7. Verify responsive behavior at 375px, 768px, 1024px, 1440px

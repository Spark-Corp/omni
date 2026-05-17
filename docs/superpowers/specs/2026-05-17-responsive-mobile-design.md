# Responsive Mobile Design — Omni Web App

**Date:** 2026-05-17
**Status:** Design Approved

## Overview

Make the Omni web app fully responsive with mobile-quality design across all pages and components. Target: seamless experience from 320px (small mobile) to 1920px+ (desktop).

## Navigation Architecture

### Hamburger Drawer Pattern (Vendor Area)
- **Desktop** (>=1024px): Current sidebar stays as-is (`w-64 fixed`, `ml-64` main content).
- **Tablet** (768-1023px): Sidebar collapses to icon-only rail. Hamburger button in top bar opens full overlay. 
- **Mobile** (<768px): Sidebar hidden by default. Hamburger button in top bar opens a slide-over drawer from left edge (z-50 overlay). Same nav links, same active states.

### Non-Vendor Pages
- Landing, Auth, Map, Settings — no sidebar. Navigation handled inline.

## Map Page Mobile Layout

- **Controls stack vertically on mobile**: Search bar spans full width below top bar. Back button pinned inside top bar. Header buttons reflow to not overlap.
- **Vendor detail bottom sheet**: `max-h-[85vh]` with drag handle, swipe-down-to-dismiss gesture.
- **Category pills**: Already scrolls horizontally (`overflow-x-auto scrollbar-hide`). Add `scroll-snap-type: x mandatory`.
- **Desktop**: Keep current layout (search centered, controls in corners).

## Landing Page

Already has good responsive coverage. Targeted fixes:
- CTA buttons: minimum 44px touch target, `touch-action: manipulation` on drag elements.
- Feature grid: verify gaps are comfortable on <360px screens.
- Testimonials: add `scroll-snap-type: x mandatory` for swipe feel.
- Globe3D: `w-[300px]` → `w-[280px] sm:w-[300px]` to prevent overflow on narrow screens.

## Other Pages

- **Auth**: Already collapses 2-col to 1-col at lg. Dark theme consistency on left panel gradient.
- **Settings (user)**: `max-w-lg mx-auto` — increase `px-4` to `px-6` on mobile.
- **User Profile**: Switch from light theme (`bg-gray-50`, `bg-white`) to dark theme matching app.
- **ChatModal**: Switch from light theme to dark. `max-w-2xl` → `max-w-[95vw]` on mobile.
- **NotificationBell**: `w-80` dropdown → `w-[90vw] max-w-80` to prevent overflow.

## Vendor Pages (Post-Sidebar Fix)

- Dashboard / Products / Requests / Messages / Settings: `md:` padding and font sizes already used. 
- Fix `grid-cols-2` → `grid-cols-1 md:grid-cols-2` in settings and onboarding forms.
- Add `min-h-[44px]` to all interactive elements for touch accessibility.

## Components

- **Globe3D**: Responsive sizing, reduce min-height on mobile.
- **FavoriteButton**: Dark theme consistency.
- **MapComponent** (Legacy Leaflet): Info panel `bottom-4 left-4` — ensure doesn't overlap viewport edge.
- **NotificationBell**: Dropdown overflow fix + touch event support.
- **ChatModal**: Dark theme, mobile-friendly width.

## Global Infrastructure

- Add `useMediaQuery` hook (SSR-safe).
- Add `useIsMobile` / `useIsTablet` derived hooks.
- Replace inline `window.innerWidth < 768` checks in `root.tsx` with hook.
- Add `prefers-reduced-motion` respect for animated elements.
- Increase touch target minimums across interactive elements.

## File Changes

| File | Changes |
|------|---------|
| `src/hooks/useMediaQuery.js` | New — SSR-safe media query hook |
| `src/app/vendor/layout.jsx` | Add hamburger toggle, responsive sidebar |
| `src/app/map/page.jsx` | Stack controls on mobile, bottom sheet drag handle, swipe dismiss |
| `src/app/page.jsx` | Globe3D sizing, CTA touch targets, testimonial snap |
| `src/app/auth/page.jsx` | Dark theme gradient consistency |
| `src/app/settings/page.jsx` | Increased mobile padding |
| `src/app/user/profile/page.jsx` | Dark theme conversion |
| `src/components/ChatModal.jsx` | Dark theme, responsive width |
| `src/components/NotificationBell.jsx` | Responsive dropdown, touch events |
| `src/components/Globe3D.jsx` | Responsive sizing |
| `src/components/FavoriteButton.jsx` | Dark theme |
| `src/app/root.tsx` | Replace inline width check with hook |
| `src/app/global.css` | Add reduced-motion media query |

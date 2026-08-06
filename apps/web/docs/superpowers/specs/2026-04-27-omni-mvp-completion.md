# Omni App - MVP Completion Spec

> **Date:** 2026-04-27
> **Project:** Omni - Local Vendor Marketplace App

## Goal

Complete the Omni MVP for a competition demo by fixing critical bugs and adding missing features for both user and vendor flows.

---

## Architecture

```
omni/apps/web
├── src/
│   ├── app/
│   │   ├── vendor/
│   │   │   ├── dashboard/page.jsx     ← Add navigation + stats
│   │   │   ├── products/page.jsx      ← Add products link
│   │   │   ├── layout.jsx             ← NEW: Vendor layout with nav menu
│   │   │   └── layout.module.css       ← NEW: Sidebar styles
│   │   ├── account/                   ← Remove duplicate /account page
│   │   └── user/                      ← NEW: User profile page
│   │       └── profile/page.jsx
│   ├── components/
│   │   ├── Notifications.jsx          ← NEW: Notification bell + dropdown
│   │   ├── Sidebar.jsx                ← NEW: Vendor sidebar navigation
│   │   └── FavoriteButton.jsx         ← NEW: Heart icon for vendors
│   ├── app/api/
│   │   ├── user/profile/route.js      ← NEW: User profile API
│   │   ├── notifications/route.js     ← NEW: Notifications API
│   │   └── favorites/route.js         ← NEW: Favorites API
│   └── lib/
│       └── notifications.js            ← NEW: Notification store
├── scripts/
│   └── add-missing-columns.sql         ← DB schema for new tables
└── package.json
```

---

## Database Schema Additions

### users table (existing, needs columns)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
```

### NEW: favorites table
```sql
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vendor_id)
);
```

### NEW: notifications table
```sql
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'request', 'response', 'message', 'system'
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### NEW: vendor_stats table (for analytics)
```sql
CREATE TABLE IF NOT EXISTS vendor_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    requests INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0,
    UNIQUE(vendor_id, date)
);
```

---

## Feature Requirements

### 1. Vendor Navigation & Layout

**Problem:** No sidebar/menu on vendor pages, "Add product" button missing from dashboard.

**Solution:**
- Create `vendor/layout.jsx` with sidebar navigation
- Sidebar links: Dashboard, Products, Requests, Messages, Profile
- Dashboard shows: Online toggle, Stats cards, Products list with "Add" link

**Dashboard Stats Cards (fake for MVP):**
- Requests today (count from API)
- Messages (count from API)
- Products (from vendor data)

### 2. User Profile Page

**Route:** `/user/profile` or `/profile`

**Features:**
- View/edit name, email, phone
- View saved favorites (vendors)
- Sign out button

**Access:** From map page, show user avatar/icon that links to profile.

### 3. Notifications System

**Components:**
- Bell icon in header (both user map and vendor pages)
- Dropdown showing recent notifications
- Mark as read on click

**Notification Types:**
- When user sends request: "Request sent to [vendor]"
- When vendor responds: "[Vendor] responded to your request"
- New message from vendor

**API:** `/api/notifications` with GET (list) and PUT (mark read)

### 4. Favorites System

**Features:**
- Heart icon on vendor cards/details
- Toggle favorite on click
- View favorites in user profile
- Show favorite count on vendor

**API:** `/api/favorites` with GET (list), POST (add), DELETE (remove)

### 5. Cleanup: Remove Duplicate `/account`

**Problem:** `/account` page is a duplicate of `/auth` using non-existent `/account/signin` route.

**Solution:** Either delete `/account` page or redirect it to `/auth`.

---

## User Flows

### User Flow
1. Land on `/` → Login at `/auth` → Go to `/map`
2. Browse vendors on map
3. Tap vendor → View details
4. Favorite vendor (heart icon)
5. Request availability → Wait for response
6. Receive notification → Chat with vendor
7. View profile at `/user/profile` → See favorites, sign out

### Vendor Flow
1. Land on `/` → Login at `/auth` → Go to `/vendor/onboarding`
2. Create vendor → Dashboard
3. Dashboard shows stats, products, quick links
4. Navigate via sidebar: Products, Requests, Messages
5. Receive request notification → Respond
6. View profile at `/vendor/dashboard` profile icon

---

## Tech Decisions

1. **No backend notifications queue** - Store in DB, poll every 30s
2. **Favorites stored in DB** - Simple relationship table
3. **Vendor stats** - Increment on actions (views, requests, messages)
4. **CSS Modules for vendor layout** - Keep scoped styles

---

## API Contracts

### GET /api/notifications
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "request|response|message|system",
      "title": "string",
      "message": "string",
      "link": "string",
      "is_read": false,
      "created_at": "timestamp"
    }
  ],
  "unread_count": 3
}
```

### PUT /api/notifications/:id
```json
{ "is_read": true }
```

### GET /api/favorites
```json
{
  "favorites": [
    {
      "id": "vendor-uuid",
      "name": "string",
      "category": "string",
      "lat": 6.1319,
      "lon": 1.2228
    }
  ]
}
```

### POST /api/favorites
```json
{ "vendorId": "uuid" }
```

### DELETE /api/favorites/:vendorId
(no body)

### GET /api/user/profile
```json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string"
  }
}
```

### PUT /api/user/profile
```json
{
  "name": "string",
  "phone": "string"
}
```

---

## Testing Checklist

- [ ] Vendor can login → sees dashboard with sidebar
- [ ] Dashboard shows "Add product" button → navigates to products page
- [ ] Vendor can toggle online/offline
- [ ] User can favorite a vendor → shows in profile
- [ ] User can unfavorite → removed from profile
- [ ] Notifications bell shows count → dropdown lists notifications
- [ ] Click notification → navigates to relevant page
- [ ] User profile shows favorites list
- [ ] /account redirects to /auth (no duplicate page error)
- [ ] Map loads without errors
- [ ] Vendor onboarding creates vendor correctly

---

## Priority Order

1. **P0 - Critical:** Vendor layout + navigation sidebar + "Add product" on dashboard
2. **P0 - Critical:** Cleanup duplicate /account page
3. **P1 - High:** User profile page + favorites
4. **P1 - High:** Notifications system (bell + dropdown)
5. **P2 - Medium:** Dashboard stats (requests/messages count)
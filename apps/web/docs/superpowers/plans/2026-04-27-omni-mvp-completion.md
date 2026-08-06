# Omni MVP Completion - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Omni MVP by adding vendor navigation, user profile, notifications, favorites, and fixing critical bugs.

**Architecture:** React Router v7 with API routes. Vendor pages get a sidebar layout. User map page gets notification bell. Favorites and notifications stored in Neon DB.

**Tech Stack:** React, React Router, Tailwind CSS, Neon PostgreSQL, MapLibre

---

## File Structure

```
omni/apps/web/src/
├── app/
│   ├── vendor/
│   │   ├── layout.jsx              ← NEW: Sidebar layout
│   │   ├── layout.module.css      ← NEW: Sidebar styles
│   │   ├── dashboard/page.jsx     ← MODIFY: Add nav links + stats
│   │   └── page.jsx               ← MODIFY: Use x-user-id header
│   ├── user/
│   │   └── profile/page.jsx        ← NEW: User profile
│   └── api/
│       ├── user/profile/route.js  ← NEW
│       ├── notifications/route.js ← NEW
│       └── favorites/route.js      ← NEW
├── components/
│   ├── VendorSidebar.jsx          ← NEW
│   ├── NotificationBell.jsx       ← NEW
│   └── FavoriteButton.jsx          ← NEW
├── app/api/vendors/my-vendor/     ← MODIFY: Return request count
└── scripts/
    └── add-mvp-tables.sql         ← NEW: DB schema
```

---

## Task 1: Database Schema - Create Missing Tables

**Files:**
- Create: `omni/apps/web/scripts/add-mvp-tables.sql`

```sql
-- Add columns to users if not exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vendor_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

- [ ] **Step 1: Create add-mvp-tables.sql file**
- [ ] **Step 2: Run SQL in Neon console or via psql** (user must execute manually)
- [ ] **Step 3: Commit** - `git add scripts/add-mvp-tables.sql && git commit -m "feat: add favorites, notifications, user columns"`

---

## Task 2: Vendor Layout with Sidebar Navigation

**Files:**
- Create: `omni/apps/web/src/app/vendor/layout.module.css`
- Create: `omni/apps/web/src/app/vendor/layout.jsx`
- Modify: `omni/apps/web/src/app/vendor/dashboard/page.jsx`

```jsx
// omni/apps/web/src/app/vendor/layout.jsx
"use client";

import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Bell,
  LogOut,
  Store,
} from "lucide-react";
import styles from "./layout.module.css";

export default function VendorLayout({ children }) {
  const location = useLocation();
  
  const navItems = [
    { path: "/vendor/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/vendor/products", label: "Mes produits", icon: Package },
    { path: "/vendor/requests", label: "Demandes", icon: Bell },
    { path: "/vendor/messages", label: "Messages", icon: MessageCircle },
  ];

  const handleSignOut = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    localStorage.removeItem("omni_user");
    window.location.href = "/";
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Store size={24} />
          <span>Boutique</span>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button onClick={handleSignOut} className={styles.signOut}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
```

```css
/* omni/apps/web/src/app/vendor/layout.module.css */
.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.logo {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1.125rem;
  color: #059669;
  border-bottom: 1px solid #e5e7eb;
}

.nav {
  flex: 1;
  padding: 1rem 0;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
}

.navItem:hover {
  color: #059669;
  background: #f0fdf4;
}

.navItem.active {
  color: #059669;
  background: #f0fdf4;
  border-right: 3px solid #059669;
}

.footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.signOut {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.5rem;
}

.signOut:hover {
  background: #fef2f2;
}

.main {
  flex: 1;
  margin-left: 260px;
  background: #f9fafb;
  min-height: 100vh;
}
```

- [ ] **Step 1: Create layout.module.css**
- [ ] **Step 2: Create layout.jsx**
- [ ] **Step 3: Verify vendor pages render with sidebar**
- [ ] **Step 4: Commit** - `git add src/app/vendor/layout.jsx src/app/vendor/layout.module.css && git commit -m "feat: add vendor layout with sidebar navigation"`

---

## Task 3: Add "Add Product" Button to Dashboard

**Files:**
- Modify: `omni/apps/web/src/app/vendor/dashboard/page.jsx`

In the products section, add a link to products page:

```jsx
// Add to the products section header:
<div className="flex items-center justify-between">
  <h2 className="text-xl font-bold text-gray-900">Mes produits</h2>
  <Link 
    to="/vendor/products"
    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
  >
    <Plus size={20} />
    Ajouter
  </Link>
</div>
```

Add Plus import: `import { Plus, Power, PowerOff, Package, MessageCircle, TrendingUp, Loader2 } from "lucide-react";`

- [ ] **Step 1: Add Plus import**
- [ ] **Step 2: Add button in products section header**
- [ ] **Step 3: Verify button navigates to /vendor/products**
- [ ] **Step 4: Commit** - `git add src/app/vendor/dashboard/page.jsx && git commit -m "feat: add products link to dashboard"`

---

## Task 4: User Profile Page with Favorites

**Files:**
- Create: `omni/apps/web/src/app/user/profile/page.jsx`
- Create: `omni/apps/web/src/app/api/favorites/route.js`
- Create: `omni/apps/web/src/app/api/user/profile/route.js`

```jsx
// omni/apps/web/src/app/user/profile/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Heart, MapPin, Loader2, LogOut } from "lucide-react";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("omni_user");
    if (!storedUser) {
      navigate("/auth");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Load favorites
    fetch(`/api/favorites?userId=${userData.id}`, {
      headers: { 'x-user-id': userData.id }
    })
      .then(res => res.json())
      .then(data => setFavorites(data.favorites || []))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSignOut = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    localStorage.removeItem("omni_user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Nom:</span>
              <span className="ml-2">{user?.name || "Non défini"}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>

        {/* Favorites */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Heart className="text-red-500" size={20} />
            Mes boutiques favorites
          </h2>
          
          {favorites.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune boutique favorite. Explorez la carte pour en trouver!
            </p>
          ) : (
            <div className="space-y-4">
              {favorites.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{vendor.name}</h3>
                    <p className="text-sm text-gray-500">{vendor.category}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/map?vendor=${vendor.id}`)}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <MapPin size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

```js
// omni/apps/web/src/app/api/favorites/route.js
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ favorites: [] });
    }

    const favorites = await sql`
      SELECT 
        v.id, v.name, v.category,
        ST_Y(v.location::geometry) as lat,
        ST_X(v.location::geometry) as lon
      FROM favorites f
      JOIN vendors v ON v.id = f.vendor_id
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
    `;

    return Response.json({ favorites });
  } catch (err) {
    console.error("GET /api/favorites error:", err);
    return Response.json({ favorites: [] });
  }
}

export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await request.json();
    
    await sql`
      INSERT INTO favorites (user_id, vendor_id)
      VALUES (${userId}, ${vendorId})
      ON CONFLICT (user_id, vendor_id) DO NOTHING
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/favorites error:", err);
    return Response.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const vendorId = url.searchParams.get("vendorId");
    
    await sql`
      DELETE FROM favorites 
      WHERE user_id = ${userId} AND vendor_id = ${vendorId}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/favorites error:", err);
    return Response.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
```

```js
// omni/apps/web/src/app/api/user/profile/route.js
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ user: null });
    }

    const result = await sql`
      SELECT id, name, email FROM users WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return Response.json({ user: null });
    }

    return Response.json({ user: result[0] });
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    return Response.json({ user: null });
  }
}
```

- [ ] **Step 1: Create user/profile/page.jsx**
- [ ] **Step 2: Create api/favorites/route.js**
- [ ] **Step 3: Create api/user/profile/route.js**
- [ ] **Step 4: Test profile page loads and shows favorites**
- [ ] **Step 5: Commit** - `git add src/app/user src/app/api/favorites src/app/api/user && git commit -m "feat: add user profile page with favorites"`

---

## Task 5: Favorite Button Component

**Files:**
- Create: `omni/apps/web/src/components/FavoriteButton.jsx`

```jsx
// omni/apps/web/src/components/FavoriteButton.jsx
"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({ vendorId, initialFavorited = false }) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    const storedUser = localStorage.getItem("omni_user");
    if (!storedUser) {
      window.location.href = "/auth";
      return;
    }

    const userId = JSON.parse(storedUser).id;
    setLoading(true);

    try {
      if (favorited) {
        await fetch(`/api/favorites?vendorId=${vendorId}`, {
          method: "DELETE",
          headers: { 'x-user-id': userId }
        });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            'x-user-id': userId
          },
          body: JSON.stringify({ vendorId })
        });
      }
      setFavorited(!favorited);
    } catch (err) {
      console.error("Favorite error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        favorited 
          ? "text-red-500 bg-red-50 hover:bg-red-100" 
          : "text-gray-400 hover:text-red-500 hover:bg-red-50"
      }`}
    >
      <Heart 
        size={24} 
        fill={favorited ? "currentColor" : "none"} 
      />
    </button>
  );
}
```

- [ ] **Step 1: Create FavoriteButton.jsx**
- [ ] **Step 2: Commit** - `git add src/components/FavoriteButton.jsx && git commit -m "feat: add FavoriteButton component"`

---

## Task 6: Notification Bell Component

**Files:**
- Create: `omni/apps/web/src/components/NotificationBell.jsx`
- Create: `omni/apps/web/src/app/api/notifications/route.js`

```jsx
// omni/apps/web/src/components/NotificationBell.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, MessageCircle, Package, Check } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    const storedUser = localStorage.getItem("omni_user");
    if (!storedUser) return;
    
    const userId = JSON.parse(storedUser).id;
    
    try {
      const res = await fetch("/api/notifications", {
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Load notifications error:", err);
    }
  };

  const markAsRead = async (id) => {
    const storedUser = localStorage.getItem("omni_user");
    const userId = JSON.parse(storedUser).id;
    
    await fetch(`/api/notifications?id=${id}`, {
      method: "PUT",
      headers: { 'x-user-id': userId }
    });
    loadNotifications();
  };

  const getIcon = (type) => {
    switch (type) {
      case "message": return <MessageCircle size={16} />;
      case "request": return <Package size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">Aucune notification</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id);
                    if (notif.link) window.location.href = notif.link;
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    !notif.is_read ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      {notif.message && (
                        <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                      )}
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

```js
// omni/apps/web/src/app/api/notifications/route.js
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ notifications: [], unread_count: 0 });
    }

    const notifications = await sql`
      SELECT id, type, title, message, link, is_read, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const unread_count = notifications.filter(n => !n.is_read).length;

    return Response.json({ notifications, unread_count });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return Response.json({ notifications: [], unread_count: 0 });
  }
}

export async function PUT(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${id} AND user_id = ${userId}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT /api/notifications error:", err);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}
```

- [ ] **Step 1: Create NotificationBell.jsx**
- [ ] **Step 2: Create api/notifications/route.js**
- [ ] **Step 3: Add to map page header (see Task 7)**
- [ ] **Step 4: Test notification dropdown works**
- [ ] **Step 5: Commit** - `git add src/components/NotificationBell.jsx src/app/api/notifications && git commit -m "feat: add notification bell component"`

---

## Task 7: Add Notification Bell to Map Page

**Files:**
- Modify: `omni/apps/web/src/app/map/page.jsx`

Add to the header/search bar area:

```jsx
import NotificationBell from "@/components/NotificationBell";
import FavoriteButton from "@/components/FavoriteButton";
```

Add in the header where user info shows:

```jsx
<div className="flex items-center gap-4">
  <NotificationBell />
  <a href="/user/profile" className="text-gray-600 hover:text-emerald-600">
    Mon compte
  </a>
</div>
```

- [ ] **Step 1: Add imports for NotificationBell and FavoriteButton**
- [ ] **Step 2: Add notification bell and profile link to header**
- [ ] **Step 3: Test bell shows on map page**
- [ ] **Step 4: Commit** - `git add src/app/map/page.jsx && git commit -m "feat: add notification bell to map page"`

---

## Task 8: Add FavoriteButton to Vendor Details

**Files:**
- Modify: `omni/apps/web/src/app/map/page.jsx`

Find the vendor detail panel (where vendor name and info shows) and add:

```jsx
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-xl font-bold">{vendor.name}</h2>
    <p className="text-gray-500">{vendor.category}</p>
  </div>
  <FavoriteButton vendorId={vendor.id} />
</div>
```

- [ ] **Step 1: Find vendor detail section in map page**
- [ ] **Step 2: Add FavoriteButton next to vendor name**
- [ ] **Step 3: Test favoriting a vendor**
- [ ] **Step 4: Commit** - `git add src/app/map/page.jsx && git commit -m "feat: add favorite button to vendor details"`

---

## Task 9: Remove Duplicate /account Page

**Files:**
- Modify: `omni/apps/web/src/app/account/page.jsx` (redirect to /auth)

```jsx
// Replace entire file content
"use client";
import { useEffect } from "react";

export default function AccountPage() {
  useEffect(() => {
    window.location.href = "/auth";
  }, []);
  
  return null;
}
```

- [ ] **Step 1: Replace /account page content with redirect**
- [ ] **Step 2: Verify no errors on /account**
- [ ] **Step 3: Commit** - `git add src/app/account/page.jsx && git commit -m "fix: redirect /account to /auth"`

---

## Task 10: Add Create Notification When Request Sent

**Files:**
- Modify: `omni/apps/web/src/app/api/availability/request/route.js`

After creating request, create notification for vendor:

```js
// After successful request creation, add:
const vendor = await sql`
  SELECT v.user_id FROM vendors v WHERE v.id = ${vendorId}
`;

if (vendor.length > 0) {
  await sql`
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      ${vendor[0].user_id},
      'request',
      'Nouvelle demande',
      ${`Quelqu'un demande: ${quantity} articles`},
      '/vendor/requests'
    )
  `;
}
```

- [ ] **Step 1: Add notification insert after request creation**
- [ ] **Step 2: Test request flow creates notification**
- [ ] **Step 3: Commit** - `git add src/app/api/availability/request/route.js && git commit -m "feat: send notification when request created"`

---

## Verification Checklist

- [ ] Run `npm run dev` - no errors
- [ ] Navigate to `/vendor/dashboard` - sidebar shows
- [ ] Click "Ajouter" on dashboard - goes to products page
- [ ] Go to `/map` - notification bell shows
- [ ] Click notification bell - dropdown shows
- [ ] Go to `/user/profile` - page loads with favorites section
- [ ] On map, click vendor heart - toggles favorite
- [ ] Go to `/account` - redirects to `/auth`
- [ ] Vendor receives request - notification appears

---

## Execution Options

**Plan complete.** Two execution approaches:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
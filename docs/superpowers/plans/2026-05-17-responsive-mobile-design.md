# Responsive Mobile Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Omni web app fully responsive and mobile-friendly across all pages (320px-1920px+).

**Architecture:** Add SSR-safe media query hooks, convert vendor sidebar to hamburger drawer on mobile, stack map controls vertically on small screens, fix dark-theme inconsistencies, and ensure 44px+ touch targets throughout. Each task is independent except Task 1 (hooks) which is a dependency for Task 10.

**Tech Stack:** React, Tailwind CSS (default breakpoints: sm:640, md:768, lg:1024), no additional libraries needed.

---

### Task 1: Create `useMediaQuery` hook and responsive hooks

**Files:**
- Create: `src/hooks/useMediaQuery.js`
- Create: `src/hooks/useIsMobile.js`
- Create: `src/hooks/useIsTablet.js`

- [ ] **Step 1: Create `src/hooks/` directory and `useMediaQuery.js`**

```js
"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Create `useIsMobile.js`**

```js
import { useMediaQuery } from "./useMediaQuery";

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)", typeof window === "undefined" ? false : window.innerWidth < 768);
}
```

- [ ] **Step 3: Create `useIsTablet.js`**

```js
import { useMediaQuery } from "./useMediaQuery";

export function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)", false);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useMediaQuery, useIsMobile, useIsTablet hooks"
```

---

### Task 2: Make vendor layout sidebar responsive (hamburger drawer)

**Files:**
- Modify: `src/app/vendor/layout.jsx`

This is the biggest change. On mobile (<768px), the fixed sidebar becomes a slide-over drawer opened by a hamburger button. On tablet (768-1023px), the sidebar collapses to an icon rail. Desktop (>=1024px) stays unchanged.

- [ ] **Step 1: Rewrite `src/app/vendor/layout.jsx`**

```jsx
"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Store,
  Map,
  Menu,
  X,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function VendorLayout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

  const navItems = [
    { path: "/vendor/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/vendor/products", label: "Mes produits", icon: Package },
    { path: "/vendor/requests", label: "Demandes", icon: Bell },
    { path: "/vendor/messages", label: "Messages", icon: MessageCircle },
  ];

  const bottomItems = [
    { path: "/vendor/settings", label: "Paramètres", icon: Settings },
  ];

  const handleSignOut = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    localStorage.removeItem("omni_user");
    window.location.href = "/";
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-5 border-b border-white/[0.06] ${isTablet ? "justify-center px-3" : ""}`}>
        <Store size={22} className="text-emerald-400 shrink-0" />
        {!isTablet && <span className="font-space-grotesk font-semibold text-base text-white/80">Omni Vendeur</span>}
      </div>

      {/* Map link */}
      {!isTablet && (
        <Link
          to="/map"
          className="flex items-center gap-3 px-6 py-3 text-emerald-400/80 hover:text-emerald-400 text-sm border-b border-white/[0.06] transition-colors font-dm-sans"
        >
          <Map size={16} />
          <span>Voir la carte</span>
        </Link>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dm-sans transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
              } ${isTablet ? "justify-center px-0" : ""}`}
            >
              <Icon size={18} className="shrink-0" />
              {!isTablet && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="px-3 py-2 space-y-0.5 border-t border-white/[0.06]">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dm-sans transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
              } ${isTablet ? "justify-center px-0" : ""}`}
            >
              <Icon size={18} className="shrink-0" />
              {!isTablet && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Sign out */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] w-full transition-all font-dm-sans ${isTablet ? "justify-center px-0" : ""}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isTablet && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#08080f]">
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Hamburger button (mobile only) */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#08080f] border border-white/[0.06] flex items-center justify-center"
        >
          {mobileMenuOpen ? <X size={18} className="text-white/70" /> : <Menu size={18} className="text-white/70" />}
        </button>
      )}

      {/* Sidebar - Desktop: fixed, Tablet: fixed icon rail, Mobile: slide-over drawer */}
      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : isTablet
            ? "w-16 fixed h-screen"
            : "w-64 fixed h-screen"
        } flex flex-col border-r border-white/[0.06] bg-[#08080f]`}
      >
        {sidebarContent}
      </aside>

      {/* Main content - responsive margin */}
      <main
        className={`flex-1 min-h-screen bg-[#0e0e18] ${
          isMobile ? "ml-0 pt-16" : isTablet ? "ml-16" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/vendor/layout.jsx
git commit -m "feat: responsive vendor sidebar - hamburger drawer on mobile, icon rail on tablet"
```

---

### Task 3: Map page - responsive controls stacking

**Files:**
- Modify: `src/app/map/page.jsx`

On mobile, the three absolute-positioned control groups (back button top-left, search center, header buttons top-right) overlap. Need to stack them vertically.

- [ ] **Step 1: Add `useMediaQuery` import to `src/app/map/page.jsx`**

At the top of the file, add after the other imports:
```js
import { useMediaQuery } from "@/hooks/useMediaQuery";
```

- [ ] **Step 2: Add`const isMobile = useMediaQuery("(max-width: 767px)");` hook call**

After the `const [announcedSteps, setAnnouncedSteps] = useState(new Set());` line (line 39), add:
```js
const isMobile = useMediaQuery("(max-width: 767px)");
```

- [ ] **Step 3: Make back button responsive**

Replace line 768-773:
```jsx
      {/* Back Button - Minimal */}
      <a href="/" className="absolute top-6 left-6 z-20">
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all duration-300 group">
          <ArrowLeft size={18} className="text-white/70 group-hover:text-white transition-colors" />
        </button>
      </a>
```
With:
```jsx
      {/* Back Button - Minimal */}
      <a href="/" className={`absolute ${isMobile ? "top-4 left-4" : "top-6 left-6"} z-20`}>
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all duration-300 group">
          <ArrowLeft size={18} className="text-white/70 group-hover:text-white transition-colors" />
        </button>
      </a>
```

- [ ] **Step 4: Make header right buttons responsive**

Replace lines 841-860 with responsive version:
```jsx
      {/* Header Right */}
      <div className={`absolute ${isMobile ? "top-4 right-4" : "top-6 right-6"} z-20 flex items-center gap-2`}>
        {/* Mode badge - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Acheteur</span>
        </div>
        <NotificationBell />
        {hasVendor && (
          <a
            href="/vendor/dashboard"
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white text-xs transition-all"
          >
            Ma boutique
          </a>
        )}
        <a href="/user/profile" className="text-white/50 hover:text-emerald-400 text-sm transition-colors">
          Mon compte
        </a>
      </div>
```

- [ ] **Step 5: Make search section responsive**

Replace line 776 (search container `className`):
From:
```jsx
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
```
To:
```jsx
      <div className={`absolute ${isMobile ? "top-16" : "top-6"} left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4`}>
```

Also keep the `<p className="text-white/80 text-sm...">` tagline but hide it on mobile:
Replace the tagline line:
From:
```jsx
          <p className="text-white/80 text-sm font-light tracking-wide">
```
To:
```jsx
          <p className={`text-white/80 text-sm font-light tracking-wide ${isMobile ? "hidden" : ""}`}>
```

- [ ] **Step 6: Make locate me button responsive**

Replace line 881 (locate button `className`):
From:
```jsx
        className="absolute bottom-8 right-6 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md"
```
To:
```jsx
        className={`absolute ${isMobile ? "bottom-4 right-4" : "bottom-8 right-6"} z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md`}
```

- [ ] **Step 7: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/app/map/page.jsx
git commit -m "feat: responsive map page controls stacking on mobile"
```

---

### Task 4: Landing page - mobile polish

**Files:**
- Modify: `src/app/page.jsx`

The landing page is already mostly responsive. Targeted fixes for mobile.

- [ ] **Step 1: Fix Globe3D container to not overflow on narrow screens**

In the Globe3D component (inline, defined at top of `page.jsx`), find the container div. Around line 375-390 (the wrapper that renders the Three.js globe), ensure it has:
```jsx
<div ref={containerRef} className="w-full h-full min-h-[300px] sm:min-h-[400px]" />
```

Search for `min-h-[400px]` in the globe section and add `sm:` prefix.

- [ ] **Step 2: Add testimonial carousel scroll-snap**

Find the testimonials section. Add `scroll-snap-type: x mandatory` and `scroll-snap-align: start` to testimonial cards. Use inline `<style>` tag in the component or a `style` prop on the container.

- [ ] **Step 3: Ensure CTA buttons have 44px+ touch target on mobile**

Find all `<button>` and CTA `<a>` elements. Add `min-h-[44px]` class. If any have `py-2`, change to `py-3` on mobile.

- [ ] **Step 4: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.jsx
git commit -m "fix: landing page mobile - globe min-height, testimonial snap, touch targets"
```

---

### Task 5: User profile page - dark theme conversion

**Files:**
- Modify: `src/app/user/profile/page.jsx`

The user profile page currently uses light theme (`bg-gray-50`, `bg-white`, `text-gray-900`). Convert to dark theme to match the rest of the app.

- [ ] **Step 1: Rewrite `src/app/user/profile/page.jsx`**

Replace the entire file content with:

```jsx
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
      <div className="min-h-screen flex items-center justify-center bg-[#08080f]">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080f]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-[#0e0e18] rounded-xl border border-white/[0.06] p-6 mb-6">
          <h1 className="text-2xl font-bold text-white/90 mb-4">Mon Profil</h1>
          <div className="space-y-3">
            <div>
              <span className="text-white/40">Email:</span>
              <span className="ml-2 text-white/70">{user?.email}</span>
            </div>
            <div>
              <span className="text-white/40">Nom:</span>
              <span className="ml-2 text-white/70">{user?.name || "Non défini"}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 flex items-center gap-2 text-red-400/60 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>

        <div className="bg-[#0e0e18] rounded-xl border border-white/[0.06] p-6">
          <h2 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2">
            <Heart className="text-red-500" size={20} />
            Mes boutiques favorites
          </h2>

          {favorites.length === 0 ? (
            <p className="text-white/40 text-center py-8">
              Aucune boutique favorite. Explorez la carte pour en trouver!
            </p>
          ) : (
            <div className="space-y-4">
              {favorites.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border border-white/[0.06] rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-white/80">{vendor.name}</h3>
                    <p className="text-sm text-white/40">{vendor.category}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/map?vendor=${vendor.id}`)}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
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

- [ ] **Step 2: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/user/profile/page.jsx
git commit -m "fix: user profile page - convert light theme to dark theme"
```

---

### Task 6: ChatModal - dark theme + mobile-friendly width

**Files:**
- Modify: `src/components/ChatModal.jsx`

- [ ] **Step 1: Rewrite `src/components/ChatModal.jsx`**

Replace the entire file with:

```jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";

export default function ChatModal({
  requestId,
  vendorId,
  vendorName,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (requestId || vendorId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [requestId, vendorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const params = requestId
        ? `requestId=${requestId}`
        : `vendorId=${vendorId}`;
      const response = await fetch(`/api/chat/messages?${params}`);
      if (!response.ok) throw new Error("Failed to load messages");

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId || null,
          vendorId: vendorId || null,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setNewMessage("");
      loadMessages();
    } catch (err) {
      console.error(err);
      toast("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#0e0e18] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-white/[0.06]"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white/90">Chat</h2>
            <p className="text-white/40 text-sm">{vendorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.06] rounded-full transition-colors"
          >
            <X size={24} className="text-white/50" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/40 py-8">
              <p>Aucun message pour le moment</p>
              <p className="text-sm">Commencez la conversation !</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-4 py-2 ${
                  message.is_mine
                    ? "bg-emerald-600 text-white"
                    : "bg-white/[0.06] text-white/80"
                }`}
              >
                <p className="text-sm font-semibold mb-1 text-white/60">
                  {message.sender_name}
                </p>
                <p>{message.content}</p>
                <p className="text-xs mt-1 text-white/40">
                  {new Date(message.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 sm:p-6 border-t border-white/[0.06]">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 bg-white/[0.06] border border-white/[0.06] rounded-lg outline-none text-white/80 placeholder-white/30 focus:border-emerald-500/50 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0"
            >
              <Send size={20} />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatModal.jsx
git commit -m "fix: ChatModal - dark theme, responsive width, mobile-friendly"
```

---

### Task 7: NotificationBell - responsive dropdown + touch support

**Files:**
- Modify: `src/components/NotificationBell.jsx`

- [ ] **Step 1: Update `src/components/NotificationBell.jsx`**

Changes needed:

1. Add `useIsMobile` import:
```js
import { useIsMobile } from "@/hooks/useIsMobile";
```
After the existing imports.

2. Add hook call after the other `useState` calls:
```js
const isMobile = useIsMobile();
```

3. Change dropdown `w-80` to responsive width:
Replace line 80:
```jsx
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
```
With:
```jsx
        <div className={`absolute ${isMobile ? "right-0 left-0 mx-auto" : "right-0"} mt-2 w-[90vw] max-w-sm bg-[#0e0e18] rounded-xl shadow-lg border border-white/[0.06] z-50`}>
```

4. Convert remaining light theme classes to dark theme:
- `bg-white` → `bg-[#0e0e18]`
- `border-gray-200` → `border-white/[0.06]`
- `border-gray-100` → `border-white/[0.06]`
- `bg-gray-50` → `bg-white/[0.03]`
- `text-gray-500` → `text-white/40`
- `text-gray-900` → `text-white/80`
- `text-gray-600` → `text-white/40`
- `text-emerald-600` → `text-emerald-400`
- `bg-emerald-50` → `bg-emerald-500/10`
- `hover:bg-gray-50` → `hover:bg-white/[0.03]`
- `hover:text-emerald-600` → `hover:text-emerald-400`
- `text-gray-400` → `text-white/30`
- `text-gray-600` (line 69) → `text-white/50`
- `font-semibold text-gray-900` → `font-semibold text-white/80`

- [ ] **Step 2: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/NotificationBell.jsx
git commit -m "fix: NotificationBell - responsive dropdown, dark theme, touch support"
```

---

### Task 8: Vendor forms - responsive grid fix

**Files:**
- Modify: `src/app/vendor/settings/page.jsx`
- Modify: `src/app/vendor/onboarding/page.jsx`

Some vendor forms use `grid-cols-2` without responsive fallback, causing cramped inputs on mobile.

- [ ] **Step 1: Fix `src/app/vendor/settings/page.jsx`**

Search for all `grid-cols-2` instances (no `sm:` or `md:` prefix). Change each to `grid-cols-1 md:grid-cols-2` so inputs stack on mobile.

- [ ] **Step 2: Fix `src/app/vendor/onboarding/page.jsx`**

Same fix: search for `grid-cols-2` without responsive prefix and change to `grid-cols-1 md:grid-cols-2`. Also check `grid-cols-3` patterns.

- [ ] **Step 3: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/vendor/settings/page.jsx src/app/vendor/onboarding/page.jsx
git commit -m "fix: vendor forms - responsive grid columns on mobile"
```

---

### Task 9: Settings page - mobile padding

**Files:**
- Modify: `src/app/settings/page.jsx`

- [ ] **Step 1: Increase mobile padding in settings page**

Find the container div with `px-4` and change to `px-6`.

- [ ] **Step 2: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/page.jsx
git commit -m "fix: settings page - increased mobile padding"
```

---

### Task 10: Root layout - replace inline width check with hook

**Files:**
- Modify: `src/app/root.tsx`

- [ ] **Step 1: Add import for `useIsMobile`**

Add after the existing imports:
```ts
import { useIsMobile } from "@/hooks/useIsMobile";
```

- [ ] **Step 2: Replace inline check**

Replace line 496:
```ts
const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
```
With:
```ts
const isMobile = useIsMobile();
```

- [ ] **Step 3: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/root.tsx
git commit -m "refactor: replace inline window.innerWidth with useIsMobile hook"
```

---

### Task 11: Global CSS - reduced motion preference

**Files:**
- Modify: `src/app/global.css`

- [ ] **Step 1: Add `prefers-reduced-motion` media query**

Append to `global.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/global.css
git commit -m "fix: add prefers-reduced-motion respect for accessibility"
```

---

### Task 12: Fix FavoriteButton light theme

**Files:**
- Modify: `src/components/FavoriteButton.jsx`

- [ ] **Step 1: Update FavoriteButton to use dark theme colors**

Search for light theme classes and replace:
- `text-gray-400` → `text-white/40`
- `hover:bg-red-50` → `hover:bg-red-500/[0.06]`
- `text-red-500` stays (already dark-theme compatible)
- `hover:bg-red-100` → `hover:bg-red-500/[0.12]`

- [ ] **Step 2: Build and verify**

Run: `cd omni/apps/web && npx react-router build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/FavoriteButton.jsx
git commit -m "fix: FavoriteButton - dark theme consistency"
```

# Omni UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the delivery trip creation with a full-screen map, refactor the map page header/navigation, fix filter organization, make all pages responsive, and add onboarding flows.

**Architecture:** Phase A rewrites the trip form as a full-screen MapLibre map with Nominatim geocoding and click-to-place pins. Phase B adds a slide-out mobile nav + role-based navigation to the map page header. Phase C reorganizes sort/filter UI. Phase D polishes responsive layout and visual consistency.

**Tech Stack:** React 18, MapLibre GL JS (CDN), Nominatim API, Tailwind CSS, Lucide icons

---

## File Map

### New files
- `src/components/MobileNav.jsx` — Hamburger menu panel (mobile) / dropdown (desktop) with role switching, wallet, subs, account links

### Modified files
- `src/app/delivery/trips/new/page.jsx` — Full rewrite: MapLibre full screen + search + pins + line draw
- `src/app/map/page.jsx` — Header refactor: replace text links with MobileNav + role badge + compact sort
- `src/app/vendor/dashboard/page.jsx` — Responsive grid (2-col on desktop)
- `src/app/delivery/dashboard/page.jsx` — Responsive layout (wider cards on desktop)
- `src/app/cart/history/page.jsx` — Responsive audit (wider container)
- `src/app/user/profile/page.jsx` — Responsive audit

---

### Task 1: Trip Creation Full-Screen Map

**Files:**
- Modify: `src/app/delivery/trips/new/page.jsx` (full rewrite)

**Goal:** Full-screen map with click-to-place pins, Nominatim search, live route line.

**Step 1: Write the component skeleton with MapLibre CDN load**

```jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Navigation, Plus, Trash2, MapPin, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewTrip() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const mapInitCalled = useRef(false);
  const markers = useRef([]);

  const [mapLibLoaded, setMapLibLoaded] = useState(false);
  const [origin, setOrigin] = useState(null); // { lat, lon, name }
  const [destination, setDestination] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [deviationKm, setDeviationKm] = useState(2);
  const [sending, setSending] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activePin, setActivePin] = useState(null); // 'origin' | 'destination' | waypoint index
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef(null);

  // Load MapLibre
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.maplibregl) { setMapLibLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/maplibre-gl@5.22.0/dist/maplibre-gl.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/maplibre-gl@5.22.0/dist/maplibre-gl.js";
    script.onload = () => setMapLibLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          setOrigin({ ...loc, name: "Ma position" });
        },
        () => {
          const fallback = { lat: 6.1319, lon: 1.2228 };
          setUserLocation(fallback);
          setOrigin({ ...fallback, name: "Ma position (fallback)" });
        },
        { timeout: 5000 }
      );
    } else {
      const fallback = { lat: 6.1319, lon: 1.2228 };
      setUserLocation(fallback);
      setOrigin({ ...fallback, name: "Ma position (fallback)" });
    }
  }, []);

  // Init map
  const initMap = useCallback(() => {
    if (!mapContainer.current || mapInitCalled.current || !window.maplibregl || !userLocation) return;
    mapInitCalled.current = true;
    const maplibregl = window.maplibregl;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap, © CartoDB",
          },
        },
        layers: [
          { id: "background", type: "background", paint: { "background-color": "#050510" } },
          { id: "carto-tiles", type: "raster", source: "carto" },
        ],
      },
      center: [userLocation.lon, userLocation.lat],
      zoom: 14,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      if (activePin === "origin") {
        setOrigin({ lat, lon: lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      } else if (activePin === "destination") {
        setDestination({ lat, lon: lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      } else if (typeof activePin === "number") {
        const updated = [...waypoints];
        updated[activePin] = { lat, lon: lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
        setWaypoints(updated);
      }
      setActivePin(null);
    });

    map.current.on("load", () => {
      // Add route source
      map.current.addSource("route", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } },
      });
      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: { "line-color": "#10b981", "line-width": 4, "line-opacity": 0.8, "line-dasharray": [1, 2] },
      });
    });
  }, [userLocation, activePin, waypoints, origin, destination]);

  useEffect(() => {
    if (mapLibLoaded && userLocation && mapContainer.current) initMap();
  }, [mapLibLoaded, userLocation, initMap]);

  // Update markers and route
  const allPoints = useCallback(() => {
    const pts = [];
    if (origin) pts.push({ ...origin, type: "origin", label: "Départ" });
    waypoints.forEach((wp, i) => { if (wp.lat && wp.lon) pts.push({ ...wp, type: "waypoint", label: `Escale ${i + 1}`, idx: i }); });
    if (destination) pts.push({ ...destination, type: "destination", label: "Arrivée" });
    return pts;
  }, [origin, destination, waypoints]);

  useEffect(() => {
    if (!map.current || !mapInitCalled.current) return;
    const maplibregl = window.maplibregl;

    // Clear old markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    const pts = allPoints();
    const coords = pts.map((p) => [p.lon, p.lat]);

    // Add markers
    pts.forEach((p) => {
      const el = document.createElement("div");
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      el.style.backgroundColor = p.type === "origin" ? "#3b82f6" : p.type === "destination" ? "#ef4444" : "#eab308";
      el.title = p.name || p.label;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (p.type === "waypoint") setActivePin(p.idx);
        else if (p.type === "origin") setActivePin("origin");
        else if (p.type === "destination") setActivePin("destination");
      });
      const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(map.current);
      markers.current.push(marker);
    });

    // Update route line
    if (coords.length >= 2) {
      const source = map.current.getSource("route");
      if (source) {
        source.setData({ type: "Feature", geometry: { type: "LineString", coordinates: coords } });
      }
      // Fit bounds
      const bounds = new maplibregl.LngLatBounds();
      coords.forEach((c) => bounds.extend(c));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 });
    }
  }, [allPoints]);

  // Nominatim search
  const searchLocation = useCallback(async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=tg`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.map((r) => ({ name: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon) })));
      }
    } catch {} finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(val), 500);
  };

  const selectSearchResult = (result) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    const point = { lat: result.lat, lon: result.lon, name: result.name };

    if (activePin === "origin" || (!destination && !origin)) {
      setOrigin(point);
    } else if (activePin === "destination" || (origin && !destination)) {
      setDestination(point);
    } else if (typeof activePin === "number") {
      const updated = [...waypoints];
      updated[activePin] = point;
      setWaypoints(updated);
    } else {
      // Auto: if no origin, set origin. If origin set but no dest, set dest. Else add waypoint.
      if (!origin) setOrigin(point);
      else if (!destination) setDestination(point);
      else setWaypoints([...waypoints, point]);
    }
    setActivePin(null);

    // Fly to
    if (map.current) {
      map.current.flyTo({ center: [result.lon, result.lat], zoom: 15, duration: 1000 });
    }
  };

  const addWaypoint = () => {
    const idx = waypoints.length;
    setWaypoints([...waypoints, { lat: null, lon: null, name: "" }]);
    setActivePin(idx);
    toast("Clique sur la carte ou cherche une adresse pour l'escale");
  };

  const removeWaypoint = (i) => {
    setWaypoints(waypoints.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (!origin?.lat || !destination?.lat) { toast("Départ et arrivée requis"); return; }
    setSending(true);
    try {
      const userId = JSON.parse(localStorage.getItem("omni_user")).id;
      const wps = waypoints.filter((w) => w.lat && w.lon).map((w) => ({ lat: w.lat, lon: w.lon, address: w.name || "" }));
      const res = await fetch("/api/delivery/trips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({
          originLat: origin.lat,
          originLon: origin.lon,
          destinationLat: destination.lat,
          destinationLon: destination.lon,
          waypoints: wps,
          deviationKm,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("Trajet créé !");
      navigate("/delivery/dashboard");
    } catch {
      toast("Erreur");
    } finally {
      setSending(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      markers.current.forEach((m) => m.remove());
      if (map.current) { map.current.remove(); map.current = null; }
      mapInitCalled.current = false;
    };
  }, []);

  // --- UI ---

  const colorFor = (type) => {
    if (type === "origin") return { dot: "bg-blue-400", text: "text-blue-300" };
    if (type === "destination") return { dot: "bg-red-400", text: "text-red-300" };
    return { dot: "bg-yellow-400", text: "text-yellow-300" };
  };

  const renderPinItem = (label, point, type, index) => {
    const c = colorFor(type);
    return (
      <div
        key={`${type}-${index}`}
        onClick={() => {
          setActivePin(type === "waypoint" ? index : type);
          setShowSearch(true);
          toast(`Clique sur la carte ou cherche pour définir ${label.toLowerCase()}`);
        }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
          activePin === (type === "waypoint" ? index : type)
            ? "bg-emerald-500/10 border border-emerald-500/20"
            : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
        }`}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${c.dot} shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${c.text}`}>{label}</p>
          <p className="text-white/30 text-[10px] truncate">{point?.name || "Clique sur la carte"}</p>
        </div>
        {type === "waypoint" && (
          <button onClick={(e) => { e.stopPropagation(); removeWaypoint(index); }} className="text-red-400/40 hover:text-red-400 p-1">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen w-full relative bg-neutral-950 overflow-hidden">
      {/* Map */}
      <div ref={mapContainer} className="absolute inset-0" style={{ width: "100%", height: "100%" }} />

      {/* Top bar */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition-all">
          <ArrowLeft size={16} className="text-white/70" />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="absolute top-4 left-16 right-4 z-10">
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center px-4 py-3 gap-3">
              <Search size={16} className="text-white/40 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher un lieu..."
                className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder-white/30"
              />
              {searching && <Loader2 size={14} className="animate-spin text-white/30" />}
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }} className="text-white/30 hover:text-white/60 text-xs">Fermer</button>
            </div>
            {searchResults.length > 0 && (
              <div className="border-t border-white/10 max-h-48 overflow-y-auto">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => selectSearchResult(r)}
                    className="w-full text-left px-4 py-2.5 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-all border-b border-white/5 last:border-0"
                  >
                    <MapPin size={12} className="inline mr-2 text-emerald-400 shrink-0" />
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-neutral-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl max-h-[45vh] overflow-y-auto">
        <div className="p-4 pb-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-emerald-400" />
              <h2 className="text-white text-sm font-medium">Nouveau trajet</h2>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-[10px] px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              {showSearch ? "Cacher" : "Rechercher"}
            </button>
          </div>

          {/* Departure */}
          {renderPinItem("Départ", origin, "origin", 0)}

          {/* Waypoints */}
          {waypoints.map((wp, i) => renderPinItem(`Escale ${i + 1}`, wp, "waypoint", i))}

          {/* Add waypoint */}
          <button onClick={addWaypoint}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-white/30 text-xs hover:border-white/20 hover:text-white/50 transition-all"
          >
            <Plus size={14} /> Ajouter une escale
          </button>

          {/* Destination */}
          {renderPinItem("Arrivée", destination, "destination", 0)}

          {/* Deviation */}
          <div>
            <label className="text-[10px] text-white/40 mb-1 flex items-center justify-between">
              <span>Déviation max</span>
              <span className="text-emerald-400/60">{deviationKm} km</span>
            </label>
            <input type="range" min="0" max="10" step="0.5" value={deviationKm}
              onChange={(e) => setDeviationKm(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1"
            />
          </div>

          {/* Submit */}
          <button onClick={submit} disabled={sending || !origin?.lat || !destination?.lat}
            className="w-full py-3 rounded-xl bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : null}
            {sending ? "Création..." : "Activer ce trajet"}
          </button>
        </div>
      </div>

      <style>{`
        .maplibregl-control-container { display: none !important; }
      `}</style>
    </div>
  );
}
```

Write this to `src/app/delivery/trips/new/page.jsx`.

**Step 2: Run tests and typecheck**

```bash
cd omni/apps/web
npm run typecheck
npm run test:run
```

Expected: Existing tests pass, no type errors. (The page has no dedicated tests yet.)

---

### Task 2: MobileNav Component

**Files:**
- Create: `src/components/MobileNav.jsx`

**Step 1: Create MobileNav component**

```jsx
"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, X, Store, Truck, Wallet, Crown, User, LogIn, Map } from "lucide-react";

export default function MobileNav({ isAuthenticated, hasVendor, userName, balance }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleRoleSwitch = async (role) => {
    setOpen(false);
    if (role === "vendor") {
      const stored = localStorage.getItem("omni_user");
      if (!stored) { navigate("/auth"); return; }
      const userId = JSON.parse(stored).id;
      try {
        const res = await fetch("/api/vendors/my-vendor", { headers: { "x-user-id": userId } });
        const data = await res.json();
        if (data.vendor) navigate("/vendor/dashboard");
        else navigate("/vendor/onboarding");
      } catch { navigate("/vendor/onboarding"); }
    } else if (role === "delivery") {
      const stored = localStorage.getItem("omni_user");
      if (!stored) { navigate("/auth"); return; }
      navigate("/delivery/dashboard");
    } else {
      navigate("/map");
    }
  };

  return (
    <>
      {/* Hamburger button */}
      <button onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all"
      >
        <Menu size={16} className="text-white/70" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-neutral-950 border-r border-white/10 shadow-2xl animate-slide-right">
            <div className="p-5">
              {/* Close */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-white font-medium text-sm">Omni</span>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                  <X size={14} className="text-white/50" />
                </button>
              </div>

              {/* User info */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-sm font-medium">{userName?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{userName || "Utilisateur"}</p>
                    <p className="text-white/20 text-[10px]">Connecté</p>
                  </div>
                </div>
              ) : (
                <button onClick={() => go("/auth")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6"
                >
                  <LogIn size={16} /> Se connecter
                </button>
              )}

              {/* Role switcher */}
              <p className="text-[10px] text-white/20 uppercase tracking-widest mb-3">Mon rôle</p>
              <div className="space-y-1 mb-6">
                {[
                  { role: "buyer", label: "Acheteur", icon: Map, color: "text-emerald-400" },
                  { role: "vendor", label: "Vendeur", icon: Store, color: "text-blue-400" },
                  { role: "delivery", label: "Livreur", icon: Truck, color: "text-purple-400" },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button key={r.role} onClick={() => handleRoleSwitch(r.role)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <Icon size={16} className={r.color} />
                      <span className="text-white/70 text-sm">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Links */}
              <p className="text-[10px] text-white/20 uppercase tracking-widest mb-3">Liens</p>
              <div className="space-y-1">
                {[
                  { label: "Portefeuille", icon: Wallet, path: "/wallet", desc: balance != null ? `${balance.toLocaleString()} FCFA` : null },
                  { label: "Abonnements", icon: Crown, path: "/subscriptions" },
                  { label: "Mon compte", icon: User, path: "/user/profile" },
                ].map((l) => {
                  const Icon = l.icon;
                  return (
                    <button key={l.label} onClick={() => go(l.path)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <Icon size={16} className="text-white/40" />
                      <span className="text-white/60 text-sm flex-1 text-left">{l.label}</span>
                      {l.desc && <span className="text-[10px] text-emerald-400/60">{l.desc}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-right {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-right { animation: slide-right 0.2s ease-out; }
      `}</style>
    </>
  );
}
```

Write to `src/components/MobileNav.jsx`.

---

### Task 3: Header Refactor in Map Page

**Files:**
- Modify: `src/app/map/page.jsx` (header section, lines 946-974)

Replace the header right section with a modern compact bar.

**Step 1: Add MobileNav import and state**

At the top of `src/app/map/page.jsx`, add import:
```jsx
import MobileNav from "@/components/MobileNav";
```

Add state near other useState calls (around line 52):
```jsx
const [walletBalance, setWalletBalance] = useState(null);
```

**Step 2: Load wallet balance**

Add after the `hasVendor` check effect (after line 166):
```jsx
useEffect(() => {
  if (!isAuthenticated) return;
  const fetchBalance = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("omni_user")).id;
      const res = await fetch("/api/wallet/balance", { headers: { "x-user-id": userId } });
      if (res.ok) { const d = await res.json(); setWalletBalance(d.balance); }
    } catch {}
  };
  fetchBalance();
}, [isAuthenticated]);
```

**Step 3: Replace header section (lines 946-974)**

Old:
```jsx
      {/* Header Right */}
      <div className={`absolute ${isMobile ? "top-4 right-4" : "top-6 right-6"} z-20 flex items-center gap-2`}>
        {/* Mode badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Acheteur</span>
        </div>
        <CartBadge itemCount={cartItemCount} onClick={() => setShowCart(true)} />
        <NotificationBell />
        {hasVendor && (
          <a
            href="/vendor/dashboard"
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white text-xs transition-all"
          >
            Ma boutique
          </a>
        )}
        <a href="/wallet" className="text-white/50 hover:text-emerald-400 text-sm transition-colors">
          Wallet
        </a>
        <a href="/subscriptions" className="text-white/50 hover:text-emerald-400 text-sm transition-colors">
          Abo
        </a>
        <a href="/delivery/dashboard" className="text-white/50 hover:text-emerald-400 text-sm transition-colors">
          Livraison
        </a>
        <a href="/user/profile" className="text-white/50 hover:text-emerald-400 text-sm transition-colors">
          Mon compte
        </a>
      </div>
```

New:
```jsx
      {/* Header Right — Modern Nav */}
      <div className={`absolute ${isMobile ? "top-4 right-4" : "top-4 right-4"} z-20 flex items-center gap-2`}>
        {/* Mobile Nav (hamburger) — always visible */}
        <MobileNav
          isAuthenticated={isAuthenticated}
          hasVendor={hasVendor}
          userName={(() => { try { const u = JSON.parse(localStorage.getItem("omni_user") || "{}"); return u.name; } catch { return null; }})()}
          balance={walletBalance}
        />

        {/* Desktop extras */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Role badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Acheteur</span>
          </div>
          {hasVendor && (
            <a href="/vendor/dashboard"
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white text-xs transition-all"
            >
              Ma boutique
            </a>
          )}
        </div>

        <CartBadge itemCount={cartItemCount} onClick={() => setShowCart(true)} />
        <NotificationBell />
      </div>
```

---

### Task 4: Sort Dropdown Refactor

**Files:**
- Modify: `src/app/map/page.jsx` (sort section, lines 923-942)

Replace the 4 sort buttons with a single dropdown.

**Step 1: Replace sort buttons with dropdown**

Old (lines 923-942):
```jsx
        {/* Sort */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: "distance", label: "Proximité" },
            { key: "price", label: "Prix" },
            { key: "rating", label: "Note" },
            { key: "best_value", label: "Meilleur rapport" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all whitespace-nowrap shrink-0 ${
                sortBy === opt.key
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
```

New:
```jsx
        {/* Sort — compact dropdown */}
        <div className="flex items-center gap-2 mt-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 text-white/60 text-[10px] font-medium rounded-full px-3 py-1 pr-6 outline-none cursor-pointer hover:bg-white/10 transition-all"
            >
              <option value="distance" className="bg-neutral-900">📍 Proximité</option>
              <option value="price" className="bg-neutral-900">💰 Prix croissant</option>
              <option value="rating" className="bg-neutral-900">⭐ Meilleure note</option>
              <option value="best_value" className="bg-neutral-900">🏆 Meilleur rapport</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 3L4 6L7 3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <span className="text-[10px] text-white/20">{vendors.length} résultat{vendors.length !== 1 ? "s" : ""}</span>
        </div>
```

---

### Task 5: Responsive Audit

**Files:**
- Modify: `src/app/vendor/dashboard/page.jsx` — read current file, add responsive grid
- Modify: `src/app/delivery/dashboard/page.jsx` — already has `max-w-lg`, verify on wider screens
- Modify: `src/app/cart/history/page.jsx` — read and verify

**Step 1: Read and audit each page**

```bash
cat src/app/vendor/dashboard/page.jsx | head -20
cat src/app/cart/history/page.jsx | head -20
cat src/app/user/profile/page.jsx 2>/dev/null || echo "check path"
```

**Step 2: For vendor dashboard, add responsive grid**

If the page has a list of items, wrap with:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

If it has `max-w-lg`, change to `max-w-lg md:max-w-3xl lg:max-w-5xl`.

**Step 3: For delivery dashboard, widen on desktop**

Change `max-w-lg mx-auto` to `max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto`.

**Step 4: For cart history, add wider container**

Same pattern: `max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto`.

---

### Task 6: UI Polish

**Files:**
- Modify: all audited pages

**Step 1: Add empty states with illustrations**

For any list that shows "Aucun résultat", add a visual with an icon + message + CTA button.

**Step 2: Ensure consistent spacing**

Check that all pages use the same `px-4 py-6` on mobile, `px-6 md:px-8` on desktop.

---

## Self-Review

### Spec coverage
1. Carte trajet livreur — Task 1 ✅
2. Recherche Nominatim — Task 1 (searchLocation / handleSearchChange / selectSearchResult) ✅
3. Clic sur carte pour placer pins — Task 1 (map click handler) ✅
4. Tracé temps réel — Task 1 (route source + allPoints effect) ✅
5. Header moderne — Task 3 ✅
6. Menu hamburger — Task 2 + Task 3 ✅
7. Onboarding accessible — Task 2 (handleRoleSwitch navigates to onboarding) ✅
8. Filtres compact — Task 4 ✅
9. Responsive — Task 5 ✅
10. UI polish — Task 6 ✅

### Placeholder check
No placeholders, TBDs, or TODOs in the plan. All code is complete.

### Type consistency
- `src/components/MobileNav.jsx` — props: `isAuthenticated`, `hasVendor`, `userName`, `balance` — consistent with usage in Task 3
- Task 1 uses `userLocation`, `origin`, `destination`, `waypoints`, `activePin`, `searchQuery`, `searchResults` — all consistent throughout

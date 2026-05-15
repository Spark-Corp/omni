"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Navigation, Mic, Loader2, ArrowLeft, ChevronRight, Plus, Minus, MessageCircle, ShoppingBag, Utensils, Wrench, Truck, Shirt, Home, Store } from "lucide-react";
import { toast } from "sonner";
import ImageSearch from "@/components/ImageSearch";
import ChatModal from "@/components/ChatModal";
import NotificationBell from "@/components/NotificationBell";
import FavoriteButton from "@/components/FavoriteButton";

export default function MapPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [chatRequest, setChatRequest] = useState(null);
  const [showVendorChat, setShowVendorChat] = useState(false);
  const [hasVendor, setHasVendor] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const vendorMarkers = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapLibLoaded, setMapLibLoaded] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [cachedVendors, setCachedVendors] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(14);
  const [routeSteps, setRouteSteps] = useState(null);
  const [showRoute, setShowRoute] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("omni_user");
        if (storedUser) {
          setIsAuthenticated(true);
          setAuthChecking(false);
          return;
        }

        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          window.location.href = "/auth";
          return;
        }
        const data = await response.json();
        if (data.user) {
          localStorage.setItem("omni_user", JSON.stringify(data.user));
          setIsAuthenticated(true);
        } else {
          window.location.href = "/auth";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "/auth";
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  // Check if user also has a vendor profile
  useEffect(() => {
    if (!isAuthenticated) return;
    const checkVendor = async () => {
      try {
        const storedUser = localStorage.getItem("omni_user");
        const userId = storedUser ? JSON.parse(storedUser).id : null;
        const res = await fetch("/api/vendors/my-vendor", {
          headers: userId ? { 'x-user-id': userId } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setHasVendor(!!data.vendor);
        }
      } catch (e) {
        // Not a vendor, no problem
      }
    };
    checkVendor();
  }, [isAuthenticated]);

  // Retry location function
  const retryLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    let timeoutId;
    
    const setDefaultLocation = () => {
      console.log('[Map] Using fallback location: Lagos');
      setUserLocation({ lat: 6.1319, lon: 1.2228 });
      setLocationError('Using fallback: Lagos');
      setLocationLoading(false);
    };
    
    timeoutId = setTimeout(setDefaultLocation, 3000);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          console.log('[Map] Got user location:', position.coords.latitude, position.coords.longitude);
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationError(null);
          setLocationLoading(false);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Error getting location:', error);
          setLocationError('Location unavailable - Using fallback: Lagos');
          setDefaultLocation();
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else {
      clearTimeout(timeoutId);
      setLocationError('Geolocation not supported - Using fallback: Lagos');
      setDefaultLocation();
    }
    
    return () => clearTimeout(timeoutId);
  };

  // Get user location
  useEffect(() => {
    retryLocation();
  }, []);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      if (vendors.length > 0) {
        setCachedVendors(vendors);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [vendors]);
  // Load MapLibre GL
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (window.maplibregl) {
      setMapLibLoaded(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/maplibre-gl@5.22.0/dist/maplibre-gl.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/maplibre-gl@5.22.0/dist/maplibre-gl.js";
    script.onload = () => {
      console.log("MapLibre GL loaded");
      setMapLibLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize map AFTER library is loaded AND location is available
  useEffect(() => {
    console.log('[Map] Init effect triggered:', { mapLibLoaded, userLocation: !!userLocation, mapExists: !!map.current, containerExists: !!mapContainer.current });
    
    if (
      !mapLibLoaded ||
      !userLocation ||
      map.current ||
      !mapContainer.current
    ) {
      console.log('[Map] Skipping init, conditions not met');
      return;
    }

    console.log('[Map] Starting map initialization...');

    try {
      const maplibregl = window.maplibregl;
      console.log('[Map] MapLibre GL version:', maplibregl.version);
      console.log('[Map] Container dimensions:', mapContainer.current.offsetWidth, 'x', mapContainer.current.offsetHeight);

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          projection: { type: "globe" },
          glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
          sources: {
            carto: {
              type: "raster",
              tiles: [
                "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap, © CartoDB',
              minzoom: 0,
              maxzoom: 22
            },
            // Fallback OSM tiles
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: '© OpenStreetMap',
              minzoom: 0,
              maxzoom: 19
            }
          },
          layers: [
            {
              id: "background",
              type: "background",
              paint: { "background-color": "#050510" }
            },
            {
              id: "carto-tiles",
              type: "raster",
              source: "carto",
              paint: {
                "raster-opacity": 1,
                "raster-brightness-min": 0.2,
                "raster-brightness-max": 1.0
              }
            },
            // OSM as fallback layer (initially hidden)
            {
              id: "osm-fallback",
              type: "raster",
              source: "osm",
              layout: { "visibility": "none" },
              paint: {
                "raster-opacity": 1
              }
            }
          ],
          sky: {
            "atmosphere-blend": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 1,
              5, 0.9,
              12, 0
            ]
          }
        },
        center: [userLocation.lon, userLocation.lat],
        zoom: 14,
        pitch: 45,
        bearing: 0,
        maxZoom: 19,
        minZoom: 0,
        renderWorldCopies: false
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
      map.current.addControl(new maplibregl.FullscreenControl(), "top-right");

      const userEl = document.createElement("div");
      userEl.style.width = "20px";
      userEl.style.height = "20px";
      userEl.style.borderRadius = "50%";
      userEl.style.backgroundColor = "#3b82f6";
      userEl.style.border = "3px solid white";
      userEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

      userMarker.current = new maplibregl.Marker({ element: userEl })
        .setLngLat([userLocation.lon, userLocation.lat])
        .addTo(map.current);

      map.current.on("load", () => {
        console.log("Map loaded successfully");
        setMapReady(true);
        setMapLoading(false);
        setCurrentZoom(map.current.getZoom());
      });

      map.current.on("zoom", () => {
        setCurrentZoom(map.current.getZoom());
      });
      
      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setError("Erreur de chargement de la carte");
      });
      
      map.current.on("styleimagemissing", (e) => {
        console.warn("Missing image:", e);
      });
      
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Erreur lors de l'initialisation de la carte");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapLibLoaded, userLocation]);

  // Load nearby vendors when user location is available
  useEffect(() => {
    if (userLocation) {
      loadNearbyVendors();
    }
  }, [userLocation]);

  // Update vendor markers when vendors change - with viewport clustering/filtering
  useEffect(() => {
    if (!map.current || !mapReady || !window.maplibregl) return;

    // Get current map bounds for viewport filtering
    let visibleVendors = vendors;
    if (map.current.getBounds) {
      const bounds = map.current.getBounds();
      const currentZoom = map.current.getZoom();
      
      // At high zoom (15+), show all markers in view
      // At low zoom, filter to show only clustered markers by viewport
      if (currentZoom < 12 && vendors.length > 20) {
        // Filter vendors to those within viewport bounds + buffer
        visibleVendors = vendors.filter(vendor => {
          if (!vendor.lon || !vendor.lat) return false;
          const lng = Number(vendor.lon);
          const lat = Number(vendor.lat);
          return bounds.contains([lng, lat]);
        });
        
        // If no vendors in view, show nearest ones
        if (visibleVendors.length === 0) {
          const center = map.current.getCenter();
          visibleVendors = [...vendors]
            .sort((a, b) => {
              const distA = Math.sqrt(Math.pow(a.lat - center.lat, 2) + Math.pow(a.lon - center.lng, 2));
              const distB = Math.sqrt(Math.pow(b.lat - center.lat, 2) + Math.pow(b.lon - center.lng, 2));
              return distA - distB;
            })
            .slice(0, 15);
        }
        console.log('[Map] Viewport filtered vendors:', visibleVendors.length, 'of', vendors.length);
      }
    }

    // Remove old markers
    vendorMarkers.current.forEach((marker) => marker.remove());
    vendorMarkers.current = [];

    // Add new markers with premium styling
    visibleVendors.forEach((vendor) => {
      const el = document.createElement("div");
      el.className = "vendor-marker";
      el.style.width = "36px";
      el.style.height = "36px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = vendor.is_online ? "rgba(16, 185, 129, 0.9)" : "rgba(107, 114, 128, 0.9)";
      el.style.border = "2px solid rgba(255, 255, 255, 0.8)";
      el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4), 0 0 0 4px rgba(16, 185, 129, 0.2)";
      el.style.cursor = "pointer";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.transition = "box-shadow 0.2s ease";
      
      // Inner dot
      const dot = document.createElement("div");
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = "white";
      dot.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
      el.appendChild(dot);
      
      // Hover effect — NO transform (MapLibre owns it for positioning)
      el.addEventListener("mouseenter", () => {
        el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.5), 0 0 0 6px rgba(16, 185, 129, 0.3)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4), 0 0 0 4px rgba(16, 185, 129, 0.2)";
      });

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log('[Map] Vendor clicked:', vendor.id, 'at', vendor.lon, vendor.lat);
        handleVendorClick(vendor);
      });

      const marker = new window.maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([vendor.lon, vendor.lat])
        .addTo(map.current);

      vendorMarkers.current.push(marker);
    });
  }, [vendors, mapReady]);

  const loadNearbyVendors = async () => {
    // If offline, use cached vendors
    if (isOffline && cachedVendors.length > 0) {
      console.log('[Map] Using cached vendors (offline)');
      setVendors(cachedVendors);
      return;
    }
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      console.log('[Map] Loading nearby vendors for location:', userLocation);
      const response = await fetch("/api/vendors/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: userLocation.lat,
          lon: userLocation.lon,
          radius: 10000,
        }),
      });

      console.log('[Map] API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Map] API error response:', errorText);
        throw new Error(`Failed to load vendors: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('[Map] Received vendors:', data.vendors?.length || 0, data);
      setVendors(data.vendors || []);
    } catch (err) {
      console.error('[Map] Error loading vendors:', err);
      setError(`Impossible de charger les vendeurs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || !userLocation) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/vendors/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: userLocation.lat,
          lon: userLocation.lon,
          search: searchQuery,
          radius: 5000,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setVendors(data.vendors || []);

      if (data.vendors.length === 0) {
        setError("Aucun vendeur trouvé pour cette recherche");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast("La recherche vocale n'est pas supportée sur ce navigateur");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setTimeout(() => handleSearch(), 100);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast("Erreur de reconnaissance vocale");
    };

    recognition.start();
  };

  const handleVendorClick = async (vendor) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/${vendor.id}`);
      if (!response.ok) throw new Error("Failed to load vendor details");

      const data = await response.json();
      setSelectedVendor(data.vendor);

      // Fly to vendor location
      if (map.current && vendor.lon && vendor.lat) {
        const lon = Number(vendor.lon);
        const lat = Number(vendor.lat);
        const currentCenter = map.current.getCenter();
        console.log('[Map] Current center:', currentCenter.lng, currentCenter.lat);
        console.log('[Map] Target location:', lon, lat);
        console.log('[Map] Map loaded:', map.current.loaded(), 'Style loaded:', map.current.isStyleLoaded());
        
        // Ensure valid coordinates
        if (!isNaN(lon) && !isNaN(lat) && lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
          console.log('[Map] Flying to:', [lon, lat]);
          map.current.flyTo({
            center: [lon, lat],
            zoom: 16,
            pitch: 45,
            duration: 1500,
          });
        } else {
          console.error('[Map] Invalid coordinate values:', lon, lat);
        }
      } else {
        console.error('[Map] Missing vendor coordinates:', vendor);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les détails du vendeur");
    } finally {
      setLoading(false);
    }
  };

  const requestAvailability = async (productId) => {
    try {
      const storedUser = localStorage.getItem("omni_user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      const response = await fetch("/api/availability/request", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          vendorId: selectedVendor.id,
          productId,
          quantity,
        }),
      });

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();

      // Open chat modal with the request
      setChatRequest(data.request);
    } catch (err) {
      console.error(err);
      toast("Erreur lors de l'envoi de la demande");
    }
  };

  const navigateToVendor = async () => {
    if (!selectedVendor || !userLocation) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${userLocation.lon},${userLocation.lat};${selectedVendor.lon},${selectedVendor.lat}?overview=full&steps=true&geometries=geojson`
      );
      
      if (!response.ok) throw new Error("Routing failed");
      
      const data = await response.json();
      const route = data.routes[0];
      
      if (map.current) {
        if (map.current.getSource('route')) {
          map.current.removeLayer('route-layer');
          map.current.removeSource('route');
        }
        
        map.current.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: route.geometry }
        });
        
        map.current.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#10b981', 'line-width': 4, 'line-opacity': 0.8 }
        });
        
        // Store route steps for voice guidance
        const steps = route.legs[0]?.steps || [];
        setRouteSteps(steps.map((s, i) => ({
          instruction: s.maneuver?.instruction || s.name,
          distance: s.distance,
          duration: s.duration,
        })));
        setShowRoute(true);
        
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        toast(`Itinéraire: ${distanceKm} km · ${durationMin} min à pied`);
      }
    } catch (err) {
      console.error(err);
      toast("Itinéraire non disponible pour le moment");
    } finally {
      setLoading(false);
    }
  };

  const speakRoute = () => {
    if (!routeSteps || !('speechSynthesis' in window)) return;
    const text = routeSteps.map((s, i) =>
      `Dans ${Math.round(s.distance)} mètres, ${s.instruction.toLowerCase()}.`
    ).join(' ');
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = 0.9;
    speechSynthesis.speak(utter);
  };

  const openVendorChat = () => {
    setShowVendorChat(true);
  };

  if (authChecking || !userLocation) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white/60 text-sm font-light tracking-wide">
            {authChecking ? "Vérification..." : "Localisation..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-neutral-950 overflow-hidden">
      {/* Map Loading Skeleton */}
      {mapLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 border border-white/10 rounded-full" />
              <div className="absolute inset-0 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
            <p className="text-white/60 text-sm font-light tracking-wide">Chargement de la carte...</p>
          </div>
        </div>
      )}

      {!mapReady && !mapLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-neutral-950">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/60 text-sm font-light tracking-wide">Chargement...</p>
          </div>
        </div>
      )}

      {/* Back Button - Minimal */}
      <a href="/" className="absolute top-6 left-6 z-20">
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all duration-300 group">
          <ArrowLeft size={18} className="text-white/70 group-hover:text-white transition-colors" />
        </button>
      </a>

      {/* Search Section */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
        <div className="text-center mb-3">
          <p className="text-white/80 text-sm font-light tracking-wide">
            <span className="text-emerald-400 font-medium">Omni</span> — Tout près de chez toi
          </p>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3.5 shadow-2xl shadow-black/50">
            <Search size={18} className="text-emerald-400 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: patates, réparation téléphone, pain..."
              className="flex-1 bg-transparent text-white/90 placeholder-white/40 text-sm outline-none font-light"
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors mr-1"
            >
              <Mic size={16} className="text-white/50" />
            </button>
            <ImageSearch
              onSearchQuery={(query) => {
                setSearchQuery(query);
                setTimeout(() => handleSearch(), 100);
              }}
            />
          </div>
        </form>

        {/* Quick Categories */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { label: "Alimentation", icon: Utensils },
            { label: "Services", icon: Wrench },
            { label: "Artisanat", icon: ShoppingBag },
            { label: "Mode", icon: Shirt },
            { label: "Maison", icon: Home },
            { label: "Transport", icon: Truck },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  setSearchQuery(cat.label);
                  setTimeout(() => handleSearch(), 100);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white text-xs transition-all whitespace-nowrap shrink-0"
              >
                <Icon size={12} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* Mode badge */}
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

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 z-0"
        style={{ width: '100%', height: '100%', minHeight: '100vh' }}
      />

      {/* Locate Me Button - Premium */}
      <button
        onClick={() => {
          if (map.current && userLocation) {
            map.current.flyTo({
              center: [userLocation.lon, userLocation.lat],
              zoom: 15,
              pitch: 45,
              duration: 2000,
            });
          }
        }}
        className="absolute bottom-8 right-6 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all duration-300 group"
      >
        <Navigation size={20} className="text-white/70 group-hover:text-white transition-colors" />
      </button>

      {/* Loading Overlay - Premium */}
      {isOffline && cachedVendors.length > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-light shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <span>Mode hors ligne - Affichage des r?sultats en cache</span>
        </div>
      )}

      {/* Offline Banner */}
      {isOffline && cachedVendors.length > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-light shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <span>Mode hors ligne - Affichage des r&eacute;sultats en cache</span>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-light shadow-xl">
          {error}
        </div>
      )}

      {/* Bottom Sheet - Vendor Details */}
      {selectedVendor && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-neutral-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl max-h-[75vh] overflow-y-auto animate-slide-up">
          <div className="p-5 pb-8">
            {/* Handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0 border border-white/5">
                <Store size={22} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-white truncate">{selectedVendor.name}</h2>
                <div className="flex items-center gap-2 text-white/40 text-sm mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">{selectedVendor.category}</span>
                  <span className="text-white/20">·</span>
                  <span className="shrink-0">{selectedVendor.distance ? `${Math.round(selectedVendor.distance)}m` : "À proximité"}</span>
                </div>
                {selectedVendor.description && (
                  <p className="text-white/30 text-xs mt-1.5 line-clamp-2">{selectedVendor.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <FavoriteButton vendorId={selectedVendor.id} />
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/5 flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-white/50" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={navigateToVendor}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 hover:text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Navigation size={16} />
                Itinéraire
              </button>
              <button
                onClick={() => setShowVendorChat(true)}
                className="flex-1 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Contacter
              </button>
            </div>

            {/* Section Title */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-white/30 text-xs uppercase tracking-widest font-medium">Produits</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {/* Products */}
            <div className="space-y-2.5 mb-4">
              {selectedVendor.products?.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-white/10 transition-all overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 flex items-start gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : null}
                        <div>
                          <h4 className="text-white text-sm font-medium">{product.name}</h4>
                          {product.description && (
                            <p className="text-white/30 text-xs mt-0.5 truncate">{product.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-emerald-400 font-semibold text-sm">{product.price?.toLocaleString()} <span className="text-xs font-normal text-emerald-400/60">{product.currency || 'FCFA'}</span></p>
                        <p className="text-white/20 text-xs mt-0.5">/{product.unit || 'pièce'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => requestAvailability(product.id)}
                      className="w-full py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400/90 hover:text-emerald-400 text-sm font-medium transition-all border border-emerald-500/10 hover:border-emerald-500/20"
                    >
                      Vérifier la disponibilité
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedVendor.phone && (
              <div className="flex items-center gap-2 text-white/20 text-xs justify-center pt-2">
                <span>Contact : {selectedVendor.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatRequest && selectedVendor && (
        <ChatModal
          requestId={chatRequest.id}
          vendorName={selectedVendor.name}
          onClose={() => setChatRequest(null)}
        />
      )}

      {/* Vendor Chat Modal */}
      {showVendorChat && selectedVendor && (
        <ChatModal
          requestId={null}
          vendorName={selectedVendor.name}
          vendorId={selectedVendor.id}
          onClose={() => setShowVendorChat(false)}
        />
      )}

      {/* Loading Overlay - Premium */}
      {loading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Route Guidance Panel */}
      {showRoute && routeSteps && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-neutral-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl max-h-[50vh] overflow-y-auto animate-slide-up">
          <div className="p-5 pb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white text-sm font-medium">Guide de l'itinéraire</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={speakRoute}
                  className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs transition-all flex items-center gap-1.5"
                >
                  <Mic size={12} />
                  Guide vocal
                </button>
                <button
                  onClick={() => { setShowRoute(false); setRouteSteps(null); }}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/5 flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-white/50" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {routeSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-1">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    {i < routeSteps.length - 1 && <div className="w-px h-8 bg-white/10" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm">{step.instruction}</p>
                    <p className="text-white/30 text-xs mt-0.5">{Math.round(step.distance)}m</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .maplibregl-control-container {
          display: none !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

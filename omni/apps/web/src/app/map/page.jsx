"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Navigation, Mic, Loader2, ArrowLeft, ChevronRight, Plus, Minus, MessageCircle } from "lucide-react";
import ImageSearch from "@/components/ImageSearch";
import ChatModal from "@/components/ChatModal";

export default function MapPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [chatRequest, setChatRequest] = useState(null);
  const [showVendorChat, setShowVendorChat] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [streetViewPosition, setStreetViewPosition] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const vendorMarkers = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapLibLoaded, setMapLibLoaded] = useState(false);

  // Get user location
  useEffect(() => {
    let timeoutId;
    
    const setDefaultLocation = () => {
      console.log('[Map] Using default location');
      setUserLocation({ lat: 6.1319, lon: 1.2228 });
    };
    
    // Set fallback after 3 seconds if geolocation hangs
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
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error("Error getting location:", error);
          setDefaultLocation();
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else {
      clearTimeout(timeoutId);
      setDefaultLocation();
    }
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Load MapLibre GL and Three.js libraries
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (window.maplibregl && window.THREE) {
      setMapLibLoaded(true);
      return;
    }

    // Load MapLibre GL
    if (!window.maplibregl) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@5.22.0/dist/maplibre-gl.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/maplibre-gl@5.22.0/dist/maplibre-gl.js";
      script.onload = () => {
        console.log("MapLibre GL loaded");
        if (window.THREE) setMapLibLoaded(true);
      };
      document.head.appendChild(script);
    }

    // Load Three.js for solar system
    if (!window.THREE) {
      const threeScript = document.createElement("script");
      threeScript.src = "https://unpkg.com/three@0.160.0/build/three.min.js";
      threeScript.onload = () => {
        console.log("Three.js loaded");
        if (window.maplibregl) setMapLibLoaded(true);
      };
      document.head.appendChild(threeScript);
    }
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
          sources: {
            // CartoDB Dark Matter - CORS-friendly, free tiles
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
        zoom: 0,
        pitch: 0,
        bearing: 0,
        maxZoom: 19,
        minZoom: 0,
        renderWorldCopies: false,
        preserveDrawingBuffer: true
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
        
        if (window.THREE && map.current) {
          initSolarSystem();
        }
      });
      
      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setError("Erreur de chargement de la carte");
      });
      
      map.current.on("styleimagemissing", (e) => {
        console.warn("Missing image:", e);
      });
      
      // Solar System with Three.js
      const initSolarSystem = () => {
        const canvas = map.current.getCanvas();
        const width = canvas.width;
        const height = canvas.height;
        
        // Create Three.js scene
        const scene = new window.THREE.Scene();
        const camera = new window.THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        const renderer = new window.THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        canvas.parentElement.appendChild(renderer.domElement);
        
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.pointerEvents = 'none';
        renderer.domElement.style.zIndex = '-1';
        
        // Create stars
        const starsGeometry = new window.THREE.BufferGeometry();
        const starsCount = 3000;
        const posArray = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 2000;
        }
        
        starsGeometry.setAttribute('position', new window.THREE.BufferAttribute(posArray, 3));
        const starsMaterial = new window.THREE.PointsMaterial({
          size: 2,
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        });
        const starsMesh = new window.THREE.Points(starsGeometry, starsMaterial);
        scene.add(starsMesh);
        
        // Create Sun
        const sunGeometry = new window.THREE.SphereGeometry(30, 32, 32);
        const sunMaterial = new window.THREE.MeshStandardMaterial({
          color: 0xffaa00,
          emissive: 0xff4400,
          emissiveIntensity: 0.5,
          roughness: 0.4,
          metalness: 0.1
        });
        const sun = new window.THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(-400, 200, -500);
        scene.add(sun);
        
        // Sun glow effect
        const glowGeometry = new window.THREE.SphereGeometry(40, 32, 32);
        const glowMaterial = new window.THREE.MeshBasicMaterial({
          color: 0xff4400,
          transparent: true,
          opacity: 0.3
        });
        const sunGlow = new window.THREE.Mesh(glowGeometry, glowMaterial);
        sunGlow.position.copy(sun.position);
        scene.add(sunGlow);
        
        // Create planets
        const planets = [
          { color: 0x8c7853, size: 8, distance: 100, speed: 0.02 }, // Mercury
          { color: 0xffc649, size: 12, distance: 150, speed: 0.015 }, // Venus
          { color: 0x6b93d6, size: 13, distance: 200, speed: 0.01 }, // Earth
          { color: 0xc1440e, size: 10, distance: 250, speed: 0.008 }, // Mars
        ];
        
        const planetMeshes = planets.map(p => {
          const geometry = new window.THREE.SphereGeometry(p.size, 16, 16);
          const material = new window.THREE.MeshStandardMaterial({
            color: p.color,
            roughness: 0.8
          });
          const mesh = new window.THREE.Mesh(geometry, material);
          mesh.userData = { distance: p.distance, speed: p.speed, angle: Math.random() * Math.PI * 2 };
          scene.add(mesh);
          return mesh;
        });
        
        // Add ambient and directional light
        const ambientLight = new window.THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new window.THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-400, 200, -500);
        scene.add(directionalLight);
        
        // Animation loop
        let animationId;
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          // Rotate stars slowly
          starsMesh.rotation.y += 0.0002;
          
          // Rotate sun
          sun.rotation.y += 0.005;
          sunGlow.rotation.y += 0.005;
          
          // Orbit planets
          planetMeshes.forEach(planet => {
            planet.userData.angle += planet.userData.speed;
            planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance - 200;
            planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance - 300;
            planet.position.y = 100;
            planet.rotation.y += 0.02;
          });
          
          renderer.render(scene, camera);
        };
        
        // Start animation only when zoomed out (globe view)
        const checkZoom = () => {
          const zoom = map.current.getZoom();
          if (zoom < 4) {
            if (!animationId) animate();
            renderer.domElement.style.opacity = '1';
          } else {
            if (animationId) {
              cancelAnimationFrame(animationId);
              animationId = null;
            }
            renderer.domElement.style.opacity = '0';
          }
        };
        
        map.current.on('zoom', checkZoom);
        checkZoom();
        
        // Handle resize
        const handleResize = () => {
          const newWidth = canvas.width;
          const newHeight = canvas.height;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };
        
        map.current.on('resize', handleResize);
      };
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

  // Update vendor markers when vendors change
  useEffect(() => {
    if (!map.current || !mapReady || !window.maplibregl) return;

    // Remove old markers
    vendorMarkers.current.forEach((marker) => marker.remove());
    vendorMarkers.current = [];

    // Add new markers with premium styling
    vendors.forEach((vendor) => {
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
      el.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
      
      // Inner dot
      const dot = document.createElement("div");
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = "white";
      dot.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
      el.appendChild(dot);
      
      // Hover effect
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.15)";
        el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.5), 0 0 0 6px rgba(16, 185, 129, 0.3)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
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
      alert("La recherche vocale n'est pas supportée sur ce navigateur");
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
      alert("Erreur de reconnaissance vocale");
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
          console.log('[Map] Using setCenter to:', [lon, lat]);
          // Use setCenter + setZoom instead of easeTo for globe projection
          map.current.setCenter([lon, lat]);
          map.current.setZoom(16);
          map.current.setPitch(45);
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
      const response = await fetch("/api/availability/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      alert("Erreur lors de l'envoi de la demande");
    }
  };

  const navigateToVendor = async () => {
    if (!selectedVendor || !userLocation) return;
    
    setLoading(true);
    try {
      // Use OSRM free routing API (Open Source Routing Machine)
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${userLocation.lon},${userLocation.lat};${selectedVendor.lon},${selectedVendor.lat}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) throw new Error("Routing failed");
      
      const data = await response.json();
      const route = data.routes[0];
      
      // Add route to map
      if (map.current) {
        // Remove existing route layer if any
        if (map.current.getSource('route')) {
          map.current.removeLayer('route-layer');
          map.current.removeSource('route');
        }
        
        // Add route source
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route.geometry
          }
        });
        
        // Add route layer
        map.current.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#10b981',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });
        
        // Show route info
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        alert(`Distance: ${distanceKm} km\nDurée à pied: ${durationMin} min`);
      }
    } catch (err) {
      console.error(err);
      // Fallback to Google Maps if OSRM fails
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedVendor.lat},${selectedVendor.lon}`;
      window.open(url, '_blank');
    } finally {
      setLoading(false);
    }
  };

  const openVendorChat = () => {
    setShowVendorChat(true);
  };

  if (!userLocation) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white/60 text-sm font-light tracking-wide">Localisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-neutral-950 overflow-hidden">
      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950">
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

      {/* Search Bar - Floating Minimal */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-black/40 backdrop-blur-xl rounded-full border border-white/10 px-4 py-3 shadow-2xl shadow-black/50">
            <Search size={18} className="text-white/50 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
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

      {/* Street View Button */}
      <button
        onClick={() => {
          if (map.current) {
            const center = map.current.getCenter();
            setStreetViewPosition({
              lat: center.lat,
              lon: center.lng
            });
            setShowStreetView(true);
          }
        }}
        className="absolute bottom-24 right-6 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all duration-300 group"
        title="Street View"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="text-white/70 group-hover:text-white transition-colors"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      </button>

      {/* Error Toast - Premium */}
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-light shadow-xl">
          {error}
        </div>
      )}

      {/* Bottom Sheet - Vendor Details - Premium Dark */}
      {selectedVendor && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-neutral-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up">
          <div className="p-6">
            {/* Handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-light text-white mb-1">{selectedVendor.name}</h2>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="text-emerald-400">●</span>
                  <span>{selectedVendor.category}</span>
                  <span className="mx-1">·</span>
                  <span>{selectedVendor.distance ? `${Math.round(selectedVendor.distance)}m` : "À proximité"}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={16} className="text-white/70" />
              </button>
            </div>

            {/* Products */}
            <div className="space-y-3 mb-6">
              <h3 className="text-white/40 text-xs uppercase tracking-wider font-medium">Produits</h3>
              {selectedVendor.products?.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-light mb-1">{product.name}</h4>
                      <p className="text-white/40 text-sm">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">{product.price} {product.currency}</p>
                      <p className="text-white/30 text-xs">{product.unit}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => requestAvailability(product.id)}
                    className="mt-3 w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Vérifier disponibilité
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <button
              onClick={navigateToVendor}
              className="w-full py-4 bg-white text-neutral-900 rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <Navigation size={18} />
              Itinéraire
            </button>
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

      {/* Street View Modal - Mapillary */}
      {showStreetView && streetViewPosition && (
        <div className="absolute inset-0 z-50 bg-neutral-950">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-neutral-900/80 backdrop-blur-md">
              <h3 className="text-white font-light">Street View</h3>
              <button
                onClick={() => setShowStreetView(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={20} className="text-white/70" />
              </button>
            </div>
            
            {/* Mapillary Viewer - Direct link approach */}
            <div className="flex-1 relative flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/60 mb-4">Ouvrir Street View à cette position :</p>
                <p className="text-white/40 text-sm mb-6">
                  {streetViewPosition.lat.toFixed(6)}, {streetViewPosition.lon.toFixed(6)}
                </p>
                <a
                  href={`https://www.mapillary.com/app/?lat=${streetViewPosition.lat}&lng=${streetViewPosition.lon}&z=17&mapStyle=OpenStreetMap`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#00BCF5] text-white rounded-lg font-medium hover:bg-[#00a8db] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                  </svg>
                  Voir dans Mapillary
                </a>
                <p className="text-white/30 text-xs mt-4 max-w-xs mx-auto">
                  L'embed Mapillary nécessite un compte API pour fonctionner correctement.
                  Cliquez pour ouvrir l'application Mapillary directement.
                </p>
              </div>
            </div>
            
            {/* Info footer */}
            <div className="p-4 bg-neutral-900/80 backdrop-blur-md text-center">
              <p className="text-white/50 text-sm">
                Images fournies par Mapillary (CC BY-SA)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Street View Hint */}
      {!showStreetView && mapReady && (
        <div className="absolute bottom-36 left-6 z-20 bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
          <p className="text-white/50 text-xs">
            Bouton ◉ = Street View à la position centre carte
          </p>
        </div>
      )}

      {/* Loading Overlay - Premium */}
      {loading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
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
        .vendor-marker:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

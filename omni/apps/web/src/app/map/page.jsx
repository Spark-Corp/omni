"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import {
  Search,
  MapPin,
  X,
  Navigation,
  MessageCircle,
  Mic,
  Loader2,
  ArrowLeft,
} from "lucide-react";
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
  const fileInputRef = useRef(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Lome, Togo if geolocation fails
          setUserLocation({ lat: 6.1319, lon: 1.2228 });
        },
      );
    } else {
      // Default to Lome, Togo
      setUserLocation({ lat: 6.1319, lon: 1.2228 });
    }
  }, []);

  // Load nearby vendors when user location is available
  useEffect(() => {
    if (userLocation) {
      loadNearbyVendors();
    }
  }, [userLocation]);

  const loadNearbyVendors = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/vendors/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: userLocation.lat,
          lon: userLocation.lon,
          radius: 10000,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load vendors");
      }

      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les vendeurs");
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

  const handleImageSearch = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target.result;

        const response = await fetch("/api/image-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) throw new Error("Image search failed");

        const data = await response.json();
        setSearchQuery(data.searchText || "");

        if (data.searchText) {
          setTimeout(() => handleSearch(), 100);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la recherche par image");
    } finally {
      setLoading(false);
    }
  };

  const handleVendorClick = async (vendor) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/${vendor.id}`);
      if (!response.ok) throw new Error("Failed to load vendor details");

      const data = await response.json();
      setSelectedVendor(data.vendor);
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

  const navigateToVendor = () => {
    if (!selectedVendor) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedVendor.lat},${selectedVendor.lon}`;
    window.location.href = url; // Open in same window/app instead of new tab
  };

  const openVendorChat = () => {
    setShowVendorChat(true);
  };

  if (!userLocation) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            className="mx-auto mb-4 text-emerald-600"
            size={48}
            style={{
              animation: "spin 1s linear infinite",
            }}
          />
          <p className="text-gray-600">Chargement de votre position...</p>
          <style jsx global>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative">
      {/* Back Button */}
      <a href="/" className="absolute top-4 left-4 z-10">
        <button className="bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      </a>

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-full shadow-lg flex items-center gap-2 p-2 pr-4"
        >
          <button
            type="submit"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Search size={20} className="text-gray-600" />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Riz, téléphone, pagne..."
            className="flex-1 outline-none px-2"
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <Mic size={20} className="text-emerald-600" />
          </button>
          <ImageSearch
            onSearchQuery={(query) => {
              setSearchQuery(query);
              setTimeout(() => handleSearch(), 100);
            }}
          />
        </form>
      </div>

      {/* Map with 3D Globe when zoomed out */}
      <div className="flex-1 relative">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={{ lat: userLocation.lat, lng: userLocation.lon }}
            defaultZoom={15}
            defaultTilt={45}
            defaultHeading={0}
            mapId="omni-map"
            style={{ width: "100%", height: "100%" }}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={true}
            fullscreenControl={true}
            rotateControl={true}
            zoomControl={true}
            streetViewControl={false}
            restriction={{
              latLngBounds: {
                north: 85,
                south: -85,
                west: -180,
                east: 180,
              },
              strictBounds: false,
            }}
            minZoom={2}
          >
            {/* User Location */}
            <AdvancedMarker
              position={{ lat: userLocation.lat, lng: userLocation.lon }}
              title="Votre position"
            >
              <Pin
                background="#3b82f6"
                borderColor="#1e40af"
                glyphColor="#ffffff"
              />
            </AdvancedMarker>

            {/* Vendor Markers */}
            {vendors.map((vendor) => (
              <AdvancedMarker
                key={vendor.id}
                position={{ lat: vendor.lat, lng: vendor.lon }}
                onClick={() => handleVendorClick(vendor)}
                title={vendor.name}
              >
                <Pin
                  background={vendor.is_online ? "#10b981" : "#6b7280"}
                  borderColor={vendor.is_online ? "#059669" : "#4b5563"}
                  glyphColor="#ffffff"
                />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-md">
          {error}
        </div>
      )}

      {/* Bottom Sheet - Vendor Details */}
      {selectedVendor && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-20 max-h-[70vh] overflow-y-auto">
          <div className="p-6">
            {/* Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedVendor.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span className="text-sm">
                    {selectedVendor.distance
                      ? `${Math.round(selectedVendor.distance)}m`
                      : "À proximité"}{" "}
                    • {selectedVendor.category}
                  </span>
                </div>
                {selectedVendor.description && (
                  <p className="text-gray-600 text-sm">
                    {selectedVendor.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Status */}
            <div className="mb-6">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedVendor.is_online
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${selectedVendor.is_online ? "bg-emerald-500" : "bg-gray-400"}`}
                ></span>
                {selectedVendor.is_online ? "En ligne" : "Hors ligne"}
              </span>
            </div>

            {/* Products */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Produits disponibles
              </h3>
              <div className="space-y-3">
                {selectedVendor.products?.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">
                          {product.price} FCFA
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.unit}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Input */}
                    <div className="flex items-center gap-3 mt-3">
                      <label className="text-sm text-gray-600">Quantité:</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.max(1, parseInt(e.target.value) || 1),
                            )
                          }
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                          min="1"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => requestAvailability(product.id)}
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold transition-colors"
                      disabled={!selectedVendor.is_online}
                    >
                      Vérifier la disponibilité
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={navigateToVendor}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation size={20} />Y aller
              </button>
              <button
                onClick={openVendorChat}
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={20} />
                Message
              </button>
            </div>
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

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <Loader2
              className="animate-spin mx-auto text-emerald-600"
              size={48}
            />
          </div>
        </div>
      )}
    </div>
  );
}

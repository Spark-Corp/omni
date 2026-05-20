'use client'

import { useState, useEffect, useRef } from 'react';

export default function MapPage() {
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="h-screen" ref={mapRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white">Chargement de la carte...</div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Carte des vendeurs</h2>
              <p className="text-neutral-400">
                {vendors.length > 0 
                  ? `${vendors.length} vendeurs trouvés`
                  : 'Aucun vendeur à proximité'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

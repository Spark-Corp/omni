import { useEffect, useRef } from "react";

export default function DeliveryLiveMap({
  origin, destination, waypoints = [],
  height = "100%", className = "",
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let map = mapRef.current;
    if (map || !mapContainer.current) return;

    const script = document.createElement("script");
    script.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";
    script.onload = () => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
      document.head.appendChild(link);

      const ml = window.maplibregl;
      if (!ml) return;

      map = new ml.Map({
        container: mapContainer.current,
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [1.2228, 6.1319],
        zoom: 13,
      });

      map.addControl(new ml.NavigationControl(), "top-right");

      map.on("load", () => {
        const points = [];
        if (origin) {
          new ml.Marker({ color: "#10b981" })
            .setLngLat([origin.lon, origin.lat])
            .addTo(map);
          points.push([origin.lon, origin.lat]);
        }
        if (destination) {
          new ml.Marker({ color: "#ef4444" })
            .setLngLat([destination.lon, destination.lat])
            .addTo(map);
          points.push([destination.lon, destination.lat]);
        }
        waypoints.forEach((wp) => {
          new ml.Marker({ color: "#f59e0b" })
            .setLngLat([wp.lon, wp.lat])
            .addTo(map);
          points.push([wp.lon, wp.lat]);
        });

        if (points.length > 0) {
          const bounds = points.reduce((b, p) => b.extend(p), new ml.LngLatBounds(points[0], points[0]));
          map.fitBounds(bounds, { padding: 60 });
        }
      });

      mapRef.current = map;
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div ref={mapContainer} className={`rounded-xl overflow-hidden ${className}`} style={{ height }} />
  );
}

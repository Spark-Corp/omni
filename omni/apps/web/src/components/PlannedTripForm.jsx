import { useState } from "react";
import { Plus, X, MapPin } from "lucide-react";

export default function PlannedTripForm({ onSubmit, isLoading }) {
  const [origin, setOrigin] = useState({ lat: "", lon: "" });
  const [destination, setDestination] = useState({ lat: "", lon: "" });
  const [waypoints, setWaypoints] = useState([]);
  const [deviationKm, setDeviationKm] = useState(2);
  const [newWp, setNewWp] = useState({ lat: "", lon: "" });

  const addWaypoint = () => {
    if (newWp.lat && newWp.lon) {
      setWaypoints([...waypoints, { ...newWp }]);
      setNewWp({ lat: "", lon: "" });
    }
  };

  const removeWaypoint = (i) => {
    setWaypoints(waypoints.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      originLat: parseFloat(origin.lat),
      originLon: parseFloat(origin.lon),
      destinationLat: parseFloat(destination.lat),
      destinationLon: parseFloat(destination.lon),
      waypoints: waypoints.map(w => ({ lat: parseFloat(w.lat), lon: parseFloat(w.lon) })),
      deviationKm,
    });
  };

  const isReady = origin.lat && origin.lon && destination.lat && destination.lon;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-white/50 mb-1 flex items-center gap-1"><MapPin size={10} /> Départ</label>
        <div className="flex gap-2">
          <input type="text" placeholder="Latitude" value={origin.lat}
            onChange={e => setOrigin({ ...origin, lat: e.target.value })}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-500/50"
          />
          <input type="text" placeholder="Longitude" value={origin.lon}
            onChange={e => setOrigin({ ...origin, lon: e.target.value })}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-500/50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-white/50 mb-1 flex items-center gap-1"><MapPin size={10} /> Arrivée</label>
        <div className="flex gap-2">
          <input type="text" placeholder="Latitude" value={destination.lat}
            onChange={e => setDestination({ ...destination, lat: e.target.value })}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-500/50"
          />
          <input type="text" placeholder="Longitude" value={destination.lon}
            onChange={e => setDestination({ ...destination, lon: e.target.value })}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Waypoints */}
      <div>
        <label className="text-xs text-white/50 mb-1">Escales</label>
        <div className="flex gap-2 mb-2">
          <input type="text" placeholder="Lat" value={newWp.lat}
            onChange={e => setNewWp({ ...newWp, lat: e.target.value })}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-500/50"
          />
          <input type="text" placeholder="Lon" value={newWp.lon}
            onChange={e => setNewWp({ ...newWp, lon: e.target.value })}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-500/50"
          />
          <button type="button" onClick={addWaypoint}
            className="px-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
        {waypoints.length > 0 && (
          <div className="space-y-1">
            {waypoints.map((wp, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5">
                <span className="text-[10px] text-white/40">Escale {i + 1}: {wp.lat}, {wp.lon}</span>
                <button type="button" onClick={() => removeWaypoint(i)} className="text-red-400/60 hover:text-red-400">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Déviation */}
      <div>
        <label className="text-xs text-white/50 mb-1">Déviation max: {deviationKm} km</label>
        <input type="range" min="0.5" max="10" step="0.5" value={deviationKm}
          onChange={e => setDeviationKm(parseFloat(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <button type="submit" disabled={!isReady || isLoading}
        className="w-full py-3 rounded-xl bg-emerald-500 text-black text-xs font-medium hover:bg-emerald-400 transition-all disabled:opacity-30"
      >
        {isLoading ? "Création..." : "Créer le trajet"}
      </button>
    </form>
  );
}

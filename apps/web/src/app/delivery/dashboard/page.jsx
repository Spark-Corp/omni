import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Clock, Navigation, Loader2, Settings } from "lucide-react";
import toast from "react-hot-toast";

export default function DeliveryDashboard() {
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [allMatches, setAllMatches] = useState({});
  const [accepting, setAccepting] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = JSON.parse(localStorage.getItem("omni_user")).id;
      const headers = { "x-user-id": userId };

      const [profRes, tripsRes] = await Promise.all([
        fetch("/api/delivery/profile", { headers }),
        fetch("/api/delivery/trips/active", { headers }),
      ]);

      if (!profRes.ok || !tripsRes.ok) throw new Error();

      const profData = await profRes.json();
      const tripsData = await tripsRes.json();
      setProfile(profData.profile || null);
      setTrips(tripsData.trips || []);

      // Fetch matches for each active trip
      const matchResults = {};
      for (const trip of (tripsData.trips || [])) {
        try {
          const mRes = await fetch("/api/delivery/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tripId: trip.id }),
          });
          if (mRes.ok) {
            const mData = await mRes.json();
            matchResults[trip.id] = mData.matches || [];
          }
        } catch {}
      }
      setAllMatches(matchResults);
    } catch {
      toast("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const deactivateTrip = async (tripId) => {
    const userId = JSON.parse(localStorage.getItem("omni_user")).id;
    const res = await fetch(`/api/delivery/trips/${tripId}/deactivate`, {
      method: "POST", headers: { "x-user-id": userId },
    });
    if (res.ok) { toast("Trajet désactivé"); loadData(); }
  };

  const acceptMatch = async (requestId, tripId) => {
    setAccepting(requestId);
    try {
      const userId = JSON.parse(localStorage.getItem("omni_user")).id;
      const res = await fetch("/api/delivery/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ requestId, tripId }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast("Livraison acceptée !");
      loadData();
    } catch (err) { toast(err.message || "Erreur"); } finally { setAccepting(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">Dashboard Livraison</h1>
            <p className="text-xs text-white/30 mt-0.5">
              {profile?.full_name || "Livreur"}
              {profile?.service_area ? ` · ${profile.service_area}` : ""}
            </p>
          </div>
          <Link to="/delivery/trips/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-medium hover:bg-emerald-400 transition-all"
          >
            <Plus size={14} />
            Nouveau trajet
          </Link>
          <Link to="/delivery/settings"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <Settings size={14} className="text-white/50" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/[0.02] rounded-xl border border-white/10 p-3 text-center transition-all">
            <p className="text-xl font-medium text-emerald-400">{trips.length}</p>
            <p className="text-[10px] text-white/30">Trajets actifs</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/10 p-3 text-center transition-all">
            <p className="text-xl font-medium text-emerald-400">0</p>
            <p className="text-[10px] text-white/30">Livré aujourd'hui</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/10 p-3 text-center transition-all">
            <p className="text-xl font-medium text-emerald-400">
              {profile?.vehicles?.[0]?.type === "pedestrian" ? "À pied" :
               profile?.vehicles?.[0]?.type === "bicycle" ? "Vélo" :
               profile?.vehicles?.[0]?.type === "motorcycle" ? "Moto" :
               profile?.vehicles?.[0]?.type === "car" ? "Voiture" :
               profile?.vehicles?.[0]?.type === "truck" ? "Camion" : "—"}
            </p>
            <p className="text-[10px] text-white/30">Véhicule</p>
          </div>
        </div>

        {/* Active Trips */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm text-white/60 font-medium">Tes trajets</h2>
          {trips.length > 0 && <span className="text-[10px] text-white/20">{trips.length} actif{trips.length > 1 ? "s" : ""}</span>}
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <Navigation size={24} className="text-white/30" />
            </div>
            <p className="text-white/30 text-sm">Aucun trajet actif</p>
            <p className="text-white/10 text-xs mt-1">Définit un trajet pour matcher des livraisons</p>
            <Link to="/delivery/trips/new"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 transition-all"
            >
              <Plus size={14} />
              Créer un trajet
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => {
              const wps = trip.waypoints || [];
              return (
                <div key={trip.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/20">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex flex-col items-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      {wps.map((_, i) => <div key={i} className="w-px h-4 bg-white/10" />)}
                      {wps.length > 0 && <div className="w-px h-4 bg-white/10" />}
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs">Départ</p>
                      <p className="text-white/30 text-[10px] mb-2">{trip.origin_lat?.toFixed(4)}, {trip.origin_lon?.toFixed(4)}</p>
                      {wps.map((wp, i) => (
                        <div key={i}>
                          <p className="text-white text-xs">Escale {i + 1}{wp.address ? ` — ${wp.address}` : ""}</p>
                          <p className="text-white/30 text-[10px] mb-2">{wp.lat?.toFixed(4)}, {wp.lon?.toFixed(4)}</p>
                        </div>
                      ))}
                      <p className="text-white text-xs">Arrivée</p>
                      <p className="text-white/30 text-[10px]">{trip.destination_lat?.toFixed(4)}, {trip.destination_lon?.toFixed(4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-white/20">
                      <Clock size={10} />
                      <span>Déviation: {trip.deviation_km} km</span>
                    </div>
                    <button onClick={() => deactivateTrip(trip.id)}
                      className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
                    >
                      Désactiver
                    </button>
                  </div>

                  {/* Matches */}
                  {(allMatches[trip.id] || []).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-[10px] text-emerald-400/60 font-medium mb-2">{allMatches[trip.id].length} livraison{allMatches[trip.id].length > 1 ? "s" : ""} sur ton trajet</p>
                      <div className="space-y-2">
                        {allMatches[trip.id].slice(0, 3).map((match) => (
                          <div key={match.request.id} className="flex items-center justify-between bg-emerald-500/5 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-white/60 text-xs">{match.request.facility_name}</p>
                              <p className="text-white/20 text-[10px]">À {match.distanceToRoute}m du trajet</p>
                            </div>
                            <button
                              onClick={() => acceptMatch(match.request.id, trip.id)}
                              disabled={accepting === match.request.id}
                              className="px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-medium hover:bg-emerald-400 transition-all disabled:opacity-30 flex items-center gap-1"
                            >
                              {accepting === match.request.id ? <Loader2 size={10} className="animate-spin" /> : null}
                              Accepter
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

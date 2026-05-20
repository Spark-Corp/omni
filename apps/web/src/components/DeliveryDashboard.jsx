import { Link } from "react-router";
import { Plus, Clock, Navigation, Loader2, Settings, Power, PowerOff, MapPin, CheckCircle } from "lucide-react";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import VehicleSelector from "@/components/VehicleSelector";
import DeliveryMatchCard from "@/components/DeliveryMatchCard";

export default function DeliveryDashboard({
  profile, trips, allMatches, available, myDeliveries,
  accepting, confirming, toggling,
  onToggle, onSwitchMode, onDeactivateTrip, onAcceptMatch, onConfirmDelivery, onSwitchVehicle,
}) {
  const isActive = profile?.is_active;
  const activeMode = profile?.active_mode || "radius";
  const dailyCount = profile?.daily_delivery_count || 0;
  const isFree = profile?.delivery_tier === 'free' || !profile?.delivery_tier;

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Dashboard Livraison</h1>
            <p className="text-xs text-white/30 mt-0.5 flex items-center gap-2">
              {profile?.full_name || "Livreur"}
              <SubscriptionBadge tier={profile?.delivery_tier} compact />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VehicleSelector vehicles={profile?.vehicles} onSwitch={onSwitchVehicle} />
            <button
              onClick={onToggle} disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                isActive ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {toggling ? <Loader2 size={12} className="animate-spin" /> : isActive ? <Power size={12} /> : <PowerOff size={12} />}
              {isActive ? "Actif" : "Inactif"}
            </button>
            <Link to="/delivery/settings"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <Settings size={14} className="text-white/50" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/[0.02] rounded-xl border border-white/10 p-3 text-center">
            <p className="text-xl font-medium text-emerald-400">{trips.length}</p>
            <p className="text-[10px] text-white/30">Trajets</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/10 p-3 text-center">
            <p className="text-xl font-medium text-emerald-400">{dailyCount}</p>
            <p className="text-[10px] text-white/30">Livré auj.</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/10 p-3 text-center">
            <p className="text-xl font-medium text-emerald-400">{available.length}</p>
            <p className="text-[10px] text-white/30">Disponibles</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/10 p-3 text-center">
            <p className="text-xs font-medium text-emerald-400 truncate">
              {profile?.vehicles?.[0]?.type === "pedestrian" ? "À pied" :
               profile?.vehicles?.[0]?.type === "bicycle" ? "Vélo" :
               profile?.vehicles?.[0]?.type === "motorcycle" ? "Moto" :
               profile?.vehicles?.[0]?.type === "car" ? "Voiture" :
               profile?.vehicles?.[0]?.type === "truck" ? "Camion" : "—"}
            </p>
            <p className="text-[10px] text-white/30">Véhicule</p>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="bg-white/[0.02] rounded-xl border border-white/10 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-white/60 font-medium">Mode de livraison</h2>
            {isFree && <span className="text-[10px] text-amber-400/60">{dailyCount}/3 aujourd'hui</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onSwitchMode("radius")} disabled={!isActive}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeMode === "radius" ? "bg-emerald-500 text-black" : "bg-white/5 text-white/40 hover:bg-white/10"
              } disabled:opacity-30`}
            >
              🎯 Rayon ({profile?.active_radius_km || 5} km)
            </button>
            <button onClick={() => onSwitchMode("route")} disabled={!isActive || isFree}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeMode === "route" ? "bg-emerald-500 text-black" : "bg-white/5 text-white/40 hover:bg-white/10"
              } disabled:opacity-30`}
            >
              🗺️ Trajet {isFree ? "(abonné)" : ""}
            </button>
          </div>
          {isFree && (
            <div className="mt-2 text-center">
              <Link to="/subscriptions" className="text-[10px] text-emerald-400/60 hover:text-emerald-400 underline">
                Mode trajet disponible dès 1 000 FCFA/mois
              </Link>
            </div>
          )}
        </div>

        {/* Available deliveries */}
        {isActive && activeMode === "radius" && available.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm text-white/60 font-medium mb-3">Livraisons disponibles</h2>
            <div className="space-y-2">
              {available.map((req) => (
                <div key={req.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium">{req.facility_name}</p>
                    <p className="text-white/20 text-[10px] truncate">{req.dropoff_address}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-white/20">
                      <MapPin size={8} /> {req.distance_km} km · {req.delivery_fee} FCFA
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-[10px] text-black font-medium hover:bg-emerald-400 transition-all">
                    Accepter
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active deliveries */}
        {myDeliveries.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm text-white/60 font-medium mb-3">Livraisons en cours ({myDeliveries.length})</h2>
            <div className="space-y-2">
              {myDeliveries.map((del) => (
                <div key={del.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-medium">{del.facility_name}</p>
                    <p className="text-white/20 text-[10px] truncate">{del.dropoff_address || "Adresse non spécifiée"}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-white/20">
                      <span className="text-emerald-400/60">{del.delivery_fee} FCFA</span>
                      {del.distance_km ? <span>· {del.distance_km} km</span> : null}
                    </div>
                  </div>
                  <button
                    onClick={() => onConfirmDelivery(del.id)}
                    disabled={confirming === del.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-[10px] text-black font-medium hover:bg-emerald-400 transition-all disabled:opacity-30"
                  >
                    {confirming === del.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />}
                    Confirmer livraison
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trips header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm text-white/60 font-medium">
            {activeMode === "route" ? "Tes trajets" : "Trajets actifs"}
          </h2>
          <div className="flex items-center gap-2">
            {activeMode === "route" && (
              <Link to="/delivery/trips/new"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-medium hover:bg-emerald-400 transition-all"
              >
                <Plus size={14} /> Nouveau trajet
              </Link>
            )}
            {trips.length > 0 && <span className="text-[10px] text-white/20">{trips.length} actif{trips.length > 1 ? "s" : ""}</span>}
          </div>
        </div>

        {/* Trip list */}
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <Navigation size={24} className="text-white/30" />
            </div>
            <p className="text-white/30 text-sm">Aucun trajet actif</p>
            <p className="text-white/10 text-xs mt-1">
              {activeMode === "radius"
                ? "Les livraisons disponibles apparaîtront dans ton rayon"
                : "Définit un trajet pour matcher des livraisons"}
            </p>
            {activeMode === "route" && (
              <Link to="/delivery/trips/new"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 transition-all"
              >
                <Plus size={14} /> Créer un trajet
              </Link>
            )}
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
                    <div className="flex items-center gap-2">
                      <Link to={`/delivery/trips/new?editTripId=${trip.id}`}
                        className="text-[10px] text-emerald-400/60 hover:text-emerald-400 transition-colors"
                      >
                        Modifier
                      </Link>
                      <button onClick={() => onDeactivateTrip(trip.id)}
                        className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        Désactiver
                      </button>
                    </div>
                  </div>

                  {/* Matches */}
                  {(allMatches[trip.id] || []).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-[10px] text-emerald-400/60 font-medium mb-2">
                        {allMatches[trip.id].length} livraison{allMatches[trip.id].length > 1 ? "s" : ""} sur ton trajet
                      </p>
                      <div className="space-y-2">
                        {allMatches[trip.id].slice(0, 3).map((match) => (
                          <DeliveryMatchCard
                            key={match.request.id}
                            match={match}
                            tripId={trip.id}
                            accepting={accepting}
                            onAccept={onAcceptMatch}
                          />
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

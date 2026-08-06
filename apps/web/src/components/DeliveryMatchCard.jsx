import { Loader2 } from "lucide-react";

export default function DeliveryMatchCard({ match, tripId, accepting, onAccept }) {
  const isLoading = accepting === match.request.id;

  return (
    <div className="flex items-center justify-between bg-emerald-500/5 rounded-lg px-3 py-2">
      <div>
        <p className="text-white/60 text-xs">{match.request.facility_name}</p>
        <p className="text-white/20 text-[10px]">À {match.distanceToRoute}m du trajet</p>
      </div>
      <button
        onClick={() => onAccept(match.request.id, tripId)}
        disabled={isLoading}
        className="px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-medium hover:bg-emerald-400 transition-all disabled:opacity-30 flex items-center gap-1"
      >
        {isLoading ? <Loader2 size={10} className="animate-spin" /> : null}
        Accepter
      </button>
    </div>
  );
}

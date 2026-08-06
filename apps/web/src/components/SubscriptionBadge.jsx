import { Crown, Zap } from "lucide-react";
import { Link } from "react-router";

export default function SubscriptionBadge({ tier, compact }) {
  const isFree = tier === "free" || !tier;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${isFree ? "text-zinc-500" : "text-emerald-400"}`}>
        {isFree ? <Zap size={10} /> : <Crown size={10} />}
        {isFree ? "Free" : "Abonné"}
      </span>
    );
  }

  return (
    <Link
      to="/subscriptions"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        isFree
          ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
      }`}
    >
      {isFree ? <Zap size={12} /> : <Crown size={12} />}
      {isFree ? "S'abonner" : "Abonné ✓"}
    </Link>
  );
}

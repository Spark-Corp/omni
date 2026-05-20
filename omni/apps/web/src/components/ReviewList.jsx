import { Star } from "lucide-react";

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-white/20 text-xs text-center py-6">Aucun avis pour le moment</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/60 text-xs font-medium">{r.user_name}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={10} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-white/10"} />
              ))}
            </div>
          </div>
          {r.comment && <p className="text-white/50 text-xs leading-relaxed">{r.comment}</p>}
          <p className="text-white/20 text-[10px] mt-1.5">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
        </div>
      ))}
    </div>
  );
}

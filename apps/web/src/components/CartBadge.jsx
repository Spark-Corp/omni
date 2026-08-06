import { ShoppingBag } from "lucide-react";

export default function CartBadge({ itemCount, onClick }) {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all duration-300 group"
    >
      <ShoppingBag size={18} className="text-white/70 group-hover:text-white transition-colors" />
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
        {itemCount > 9 ? '9+' : itemCount}
      </span>
    </button>
  );
}

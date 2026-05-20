const VEHICLE_DATA = {
  pedestrian: { emoji: "🚶", label: "À pied" },
  bicycle: { emoji: "🚲", label: "Vélo" },
  motorcycle: { emoji: "🏍️", label: "Moto" },
  car: { emoji: "🚗", label: "Voiture" },
  truck: { emoji: "🚛", label: "Camion" },
};

export default function VehicleSelector({ vehicles, onSwitch }) {
  if (!vehicles || vehicles.length <= 1) return null;

  const activeV = vehicles.find(v => v.is_active) || vehicles[0];
  const ad = VEHICLE_DATA[activeV?.type] || { emoji: "—", label: "—" };

  return (
    <div className="relative group">
      <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-[10px] text-white/50">
        {ad.emoji}
      </button>
      <div className="absolute right-0 top-full mt-1 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 min-w-[140px] hidden group-hover:block">
        {vehicles.map(v => {
          const d = VEHICLE_DATA[v.type] || { emoji: "—", label: v.type };
          return (
            <button key={v.id}
              onClick={() => onSwitch(v.type)}
              className={`w-full text-left px-3 py-2 text-xs transition-all ${
                v.is_active ? "text-emerald-400 bg-emerald-500/10" : "text-white/50 hover:bg-white/5"
              }`}
            >
              {d.emoji} {d.label}
              {v.is_active ? " ✓" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

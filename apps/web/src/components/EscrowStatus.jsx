export default function EscrowStatus({ escrow }) {
  if (!escrow) return null;

  const { amount, fee, status, created_at, released_at, refunded_at, delivery_confirmed_at } = escrow;

  const steps = [
    { label: "En escrow", done: status === "held" || released_at || refunded_at || delivery_confirmed_at, time: created_at },
    { label: "Livré", done: !!delivery_confirmed_at, time: delivery_confirmed_at },
    { label: status === "refunded" ? "Remboursé" : "Libéré", done: !!released_at || !!refunded_at, time: released_at || refunded_at },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="text-xs text-white/60 font-medium mb-3">Statut Escrow</h3>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${step.done ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${step.done ? "text-white/70" : "text-white/30"}`}>{step.label}</p>
              {step.time && <p className="text-[10px] text-white/20">{new Date(step.time).toLocaleDateString("fr-FR")}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-[10px]">
        <span className="text-white/30">Montant</span>
        <span className="text-white/70">{parseFloat(amount).toLocaleString()} FCFA</span>
      </div>
      {fee > 0 && (
        <div className="flex justify-between text-[10px] mt-1">
          <span className="text-white/30">Frais (1%)</span>
          <span className="text-white/50">{parseFloat(fee).toLocaleString()} FCFA</span>
        </div>
      )}
    </div>
  );
}

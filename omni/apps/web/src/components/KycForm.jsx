import { useState } from "react";
import { Upload, Check } from "lucide-react";

export default function KycForm({ data, onChange, onComplete }) {
  const [simulating, setSimulating] = useState(false);

  const handleSimulateUpload = async () => {
    setSimulating(true);
    await new Promise(r => setTimeout(r, 1000));
    onChange({ ...data, kycUploaded: true });
    setSimulating(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-white/50 mb-1 block">Type de pièce d'identité</label>
        <select
          value={data.idType || "national"}
          onChange={e => onChange({ ...data, idType: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
        >
          <option value="national" className="bg-neutral-900">Carte nationale</option>
          <option value="passport" className="bg-neutral-900">Passeport</option>
          <option value="driving" className="bg-neutral-900">Permis de conduire</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-white/50 mb-1 block">Numéro de pièce</label>
        <input type="text" value={data.idNumber || ""}
          onChange={e => onChange({ ...data, idNumber: e.target.value })}
          placeholder="Entrez le numéro"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-500/50"
        />
      </div>

      <div>
        <label className="text-xs text-white/50 mb-1 block">Adresse de résidence</label>
        <input type="text" value={data.address || ""}
          onChange={e => onChange({ ...data, address: e.target.value })}
          placeholder="Quartier, ville"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-500/50"
        />
      </div>

      <button onClick={handleSimulateUpload} disabled={simulating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 text-xs text-white/40 hover:border-white/20 hover:text-white/60 transition-all"
      >
        {simulating ? (
          "Vérification en cours..."
        ) : data.kycUploaded ? (
          <><Check size={14} className="text-emerald-400" /> Pièce vérifiée ✓</>
        ) : (
          <><Upload size={14} /> Simuler l'upload de la pièce</>
        )}
      </button>

      {data.kycUploaded && onComplete && (
        <button onClick={onComplete}
          className="w-full py-3 rounded-xl bg-emerald-500 text-black text-xs font-medium hover:bg-emerald-400 transition-all"
        >
          Continuer
        </button>
      )}
    </div>
  );
}

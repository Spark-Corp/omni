export default function PremiumPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Premium</h1>
      <div className="bg-white rounded-xl border-2 border-ai-accent p-8 text-center">
        <h2 className="text-xl font-bold text-ai-accent mb-4">⚡ Omni AI Premium</h2>
        <p className="text-neutral-600 mb-6">Activez l'IA pour répondre automatiquement à vos clients 24h/24.</p>
        <button className="px-8 py-3 bg-ai-accent text-white rounded-lg font-semibold hover:bg-ai-accent/90 transition-colors">
          Activer l'essai gratuit — 14 jours
        </button>
      </div>
    </div>
  )
}

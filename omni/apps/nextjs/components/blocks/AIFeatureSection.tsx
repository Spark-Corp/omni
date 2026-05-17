import { AIBadge } from '@/components/ui/AIBadge'

export function AIFeatureSection() {
  const features = [
    { title: 'Une carte en temps réel', desc: 'Voyez tous les vendeurs ouverts autour de vous. D\'un coup d\'œil.' },
    { title: 'Demandez la disponibilité', desc: '"Tu as des tomates ?" Envoyez la question, recevez la réponse. Plus besoin de deviner.' },
    { title: 'L\'IA répond pour les vendeurs', desc: 'Même quand le vendeur est occupé, notre IA confirme la disponibilité basée sur son catalogue. Immédiatement.' },
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <AIBadge variant="badge" />
        </div>
        <h2 className="text-3xl font-bold text-center text-neutral-800 mb-4">
          Omni change tout
        </h2>
        <p className="text-neutral-500 text-center mb-12">⚡ Propulsé par Omni AI</p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <h3 className="font-semibold text-neutral-800 mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

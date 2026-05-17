import { PricingCard } from './PricingCard'

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-neutral-800 mb-4">
          Tarifs
        </h2>
        <p className="text-neutral-500 text-center mb-12">Pour les vendeurs</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <PricingCard
            title="Gratuit"
            price="0 XOF"
            features={['Profil vendeur', 'Visible sur la carte', 'Jusqu\'à 10 produits', 'Notifications de demande']}
            cta="Commencer gratuitement"
          />
          <PricingCard
            title="Premium"
            price="À venir"
            features={['Tout du plan Gratuit', 'Réponse IA automatique', 'Statistiques avancées', 'Produits illimités', 'Support prioritaire']}
            cta="Essai gratuit 14 jours"
            highlighted
          />
        </div>
      </div>
    </section>
  )
}

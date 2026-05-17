export function BuyerSteps() {
  const steps = [
    { step: 1, title: 'Ouvrez la carte', desc: 'Voyez tous les vendeurs ouverts autour de vous.' },
    { step: 2, title: 'Trouvez votre produit', desc: 'Cherchez un produit ou parcourez les catégories.' },
    { step: 3, title: 'Contactez le vendeur', desc: 'Demandez la disponibilité et recevez une réponse immédiate.' },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-neutral-800 mb-4">
          Comment ça marche ?
        </h2>
        <p className="text-neutral-500 text-center mb-12">Pour les acheteurs</p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">{s.step}</span>
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2">{s.title}</h3>
              <p className="text-sm text-neutral-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

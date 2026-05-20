export function VendorSteps() {
  const steps = [
    { step: 1, title: 'Créez votre boutique', desc: 'Inscrivez-vous en 2 minutes. Ajoutez vos produits.' },
    { step: 2, title: 'Activez la visibilité', desc: 'Soyez visible sur la carte pour les clients à proximité.' },
    { step: 3, title: 'Recevez des demandes', desc: 'Les clients vous contactent directement. L\'IA peut répondre pour vous.' },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <p className="text-neutral-500 text-center mb-12">Pour les vendeurs</p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
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

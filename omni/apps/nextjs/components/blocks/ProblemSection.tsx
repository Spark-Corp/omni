export function ProblemSection() {
  const pains = [
    {
      title: 'Combien de fois avez-vous...',
      description: '...marché jusqu\'au marché pour découvrir que le vendeur est fermé ?',
    },
    {
      title: 'Combien de fois avez-vous...',
      description: '...cherché un produit dans tout le quartier sans savoir où il est disponible ?',
    },
    {
      title: 'Combien de fois avez-vous...',
      description: '...été vendeur et vu des clients passer devant votre stand sans savoir que vous aviez exactement ce qu\'ils cherchent ?',
    },
  ]

  return (
    <section id="problem" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-neutral-800 mb-12">
          Combien de fois avez-vous...
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {pains.map((pain, i) => (
            <div key={i} className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-error font-bold">!</span>
              </div>
              <p className="text-neutral-600">{pain.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

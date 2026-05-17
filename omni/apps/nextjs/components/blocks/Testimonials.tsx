export function Testimonials() {
  const testimonials = [
    { quote: 'Grâce à Omni, je trouve facilement les produits dont j\'ai besoin sans parcourir tout le marché.', name: 'Ama', role: 'Acheteuse, Lomé' },
    { quote: 'Mes clients me trouvent maintenant sur la carte. Mon chiffre d\'affaires a augmenté.', name: 'Kofi', role: 'Vendeur, Lomé' },
  ]

  return (
    <section className="py-20 px-4 bg-neutral-800 text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Ce qu\'ils disent</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 bg-neutral-700 rounded-xl">
              <p className="text-neutral-200 mb-4 italic">"{t.quote}"</p>
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-neutral-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

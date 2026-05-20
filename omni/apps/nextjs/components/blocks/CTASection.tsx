import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-primary to-primary-dark text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Arrêtez de chercher. Trouvez.</h2>
        <Link
          href="/auth/signin"
          className="inline-block px-8 py-4 bg-white text-primary-dark rounded-lg font-bold text-lg hover:bg-neutral-100 transition-colors"
        >
          Voir les vendeurs autour de moi
        </Link>
        <p className="mt-4 text-primary-light text-sm">
          Gratuit. Pas de carte bancaire requise. Disponible maintenant à Lomé.
        </p>
      </div>
    </section>
  )
}

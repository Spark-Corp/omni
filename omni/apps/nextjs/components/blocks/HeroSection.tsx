import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800 text-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
        Trouvez tout près de chez vous
      </h1>
      <p className="text-lg md:text-xl text-neutral-300 text-center max-w-2xl mb-8">
        Omni vous connecte aux vendeurs de votre quartier en temps réel. Voyez qui est ouvert, ce qui est disponible, et contactez-les directement.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/auth/signin"
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-center"
        >
          Voir les vendeurs autour de moi
        </Link>
        <Link
          href="#how-it-works"
          className="px-6 py-3 border border-neutral-400 text-neutral-200 rounded-lg font-semibold hover:bg-neutral-700 transition-colors text-center"
        >
          Comment ça marche ?
        </Link>
      </div>
      <p className="mt-6 text-neutral-400 text-sm">
        Déjà 50+ vendeurs dans votre quartier
      </p>
    </section>
  )
}

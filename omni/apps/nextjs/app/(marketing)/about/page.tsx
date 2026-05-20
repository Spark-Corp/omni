import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos — Omni',
  description: 'Découvrez Omni, la plateforme qui connecte acheteurs et vendeurs locaux.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-neutral-800 mb-8">
          À propos d'Omni
        </h1>
        <div className="prose prose-neutral max-w-none">
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Notre vision</h2>
            <p className="text-neutral-600 leading-relaxed">
              Omni est né d'un constat simple : dans les villes africaines, l'économie locale est dynamique mais l'information est fragmentée. Les acheteurs passent des heures à chercher des produits, tandis que les vendeurs peinent à se faire connaître.
            </p>
            <p className="text-neutral-600 leading-relaxed mt-4">
              Notre mission est de créer un pont numérique entre les acheteurs et les vendeurs locaux, en rendant l'information disponible en temps réel, sur une carte simple et intuitive.
            </p>
          </section>
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Contact</h2>
            <p className="text-neutral-600">
              Vous pouvez nous contacter à l'adresse suivante :<br />
              contact@omni.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

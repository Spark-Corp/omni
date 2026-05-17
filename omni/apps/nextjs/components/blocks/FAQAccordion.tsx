'use client'

import { useState } from 'react'

const faqs = [
  { q: 'Qu\'est-ce qu\'Omni ?', a: 'Omni est une plateforme qui connecte les acheteurs aux vendeurs locaux en temps réel via une carte interactive.' },
  { q: 'Combien ça coûte ?', a: 'Omni est gratuit pour les acheteurs. Les vendeurs peuvent commencer gratuitement avec un profil de base.' },
  { q: 'Comment fonctionne la carte ?', a: 'La carte affiche les vendeurs ouverts autour de vous. Vous pouvez voir leurs produits et les contacter directement.' },
  { q: 'Puis-je vendre sur Omni ?', a: 'Oui ! Créez votre profil vendeur gratuitement, ajoutez vos produits et soyez visible sur la carte.' },
  { q: 'Comment fonctionne l\'IA ?', a: 'L\'IA Omni utilise le catalogue du vendeur pour répondre automatiquement aux questions des clients, même quand le vendeur est occupé.' },
  { q: 'Omni est disponible à Lomé ?', a: 'Oui, Omni a été lancé à Lomé et s\'étend progressivement à d\'autres villes.' },
  { q: 'Comment contacter un vendeur ?', a: 'Cliquez sur un vendeur sur la carte, puis envoyez-lui un message ou une demande de disponibilité.' },
  { q: 'Puis-je modifier mes produits ?', a: 'Oui, les vendeurs peuvent gérer leurs produits depuis leur tableau de bord.' },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-neutral-50 transition-colors"
          >
            <span className="font-medium text-neutral-800">{faq.q}</span>
            <span className={`text-neutral-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-4 text-neutral-600 text-sm">{faq.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}

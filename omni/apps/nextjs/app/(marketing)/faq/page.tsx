import type { Metadata } from 'next'
import { FAQAccordion } from '@/components/blocks/FAQAccordion'

export const metadata: Metadata = {
  title: 'Questions fréquentes — Omni',
  description: 'Trouvez les réponses aux questions les plus courantes sur Omni.',
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-neutral-800 mb-12">
          Questions fréquentes
        </h1>
        <FAQAccordion />
      </div>
    </div>
  )
}

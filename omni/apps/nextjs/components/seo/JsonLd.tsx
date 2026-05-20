export function JsonLdOrganization() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Omni',
    description: 'Omni vous connecte aux vendeurs de votre quartier en temps réel.',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://omni.app',
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export function JsonLdFAQ() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: "Qu'est-ce qu'Omni ?", acceptedAnswer: { '@type': 'Answer', text: 'Omni est une plateforme qui connecte les acheteurs aux vendeurs locaux en temps réel via une carte interactive.' } },
      { '@type': 'Question', name: 'Combien ça coûte ?', acceptedAnswer: { '@type': 'Answer', text: 'Omni est gratuit pour les acheteurs. Les vendeurs peuvent commencer gratuitement.' } },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

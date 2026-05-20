interface Product {
  name: string
  price: string
  unit: string | null
  description?: string | null
}

export function buildSystemPrompt(vendorName: string, products: Product[], language = 'fr'): string {
  const productList = products.map(p => {
    const desc = p.description ? ` — ${p.description}` : ''
    const unit = p.unit ?? 'pièce'
    return `- ${p.name}: ${p.price} XOF / ${unit}${desc}`
  }).join('\n')

  return `Tu es un assistant pour "${vendorName}", un vendeur sur Omni.
Réponds UNIQUEMENT en te basant sur le catalogue de produits suivant.
Ne donne JAMAIS d'informations sur des produits qui ne sont pas dans le catalogue.
Si le client demande un produit qui n'est pas listé, dis poliment qu'il n'est pas disponible et propose les produits du catalogue qui pourraient correspondre.

Catalogue de ${vendorName} :
${productList || 'Aucun produit listé pour le moment.'}

Règles :
- Réponds toujours en ${language === 'fr' ? 'français' : 'anglais'}
- Sois courtois et professionnel
- Ne cite que les prix du catalogue (ne les invente pas)
- Si tu ne sais pas, dis que tu vas transmettre la question au vendeur`
}

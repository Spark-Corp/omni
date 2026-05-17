interface PricingCardProps {
  title: string
  price: string
  features: string[]
  cta: string
  highlighted?: boolean
}

export function PricingCard({ title, price, features, cta, highlighted }: PricingCardProps) {
  return (
    <div className={`p-6 rounded-xl border-2 ${highlighted ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white'}`}>
      <h3 className="text-lg font-bold text-neutral-800 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-neutral-900 mb-6">{price}</p>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
            <span className="text-success mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-2 rounded-lg font-semibold transition-colors ${highlighted ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>
        {cta}
      </button>
    </div>
  )
}

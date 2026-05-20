'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', category: '', phone: '', description: '', neighborhood: '' })
  const [products, setProducts] = useState<{ name: string; price: string; unit: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, location: { lat: 6.1319, lng: 1.2228 } }),
      })
      if (!res.ok) throw new Error('Failed')
      const { vendor } = await res.json()
      for (const p of products) {
        await fetch(`/api/vendors/${vendor.id}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        })
      }
      router.push('/vendor/dashboard')
    } catch {
      alert('Erreur lors de la création de votre boutique.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-neutral-200 p-8">
        <div className="flex justify-center mb-8 gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-500'}`}>
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-800">Informations de la boutique</h2>
            <input placeholder="Nom de la boutique" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 border border-neutral-300 rounded-lg" />
            <input placeholder="Catégorie (ex: Alimentation, Artisanat)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 border border-neutral-300 rounded-lg" />
            <input placeholder="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-3 border border-neutral-300 rounded-lg" />
            <textarea placeholder="Description (optionnelle)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 border border-neutral-300 rounded-lg" rows={3} />
            <button onClick={() => setStep(2)} className="w-full py-3 bg-primary text-white rounded-lg font-semibold">Suivant</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-800">Localisation</h2>
            <input placeholder="Quartier" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} className="w-full px-4 py-3 border border-neutral-300 rounded-lg" />
            <p className="text-sm text-neutral-500">Votre position sera détectée automatiquement.</p>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-neutral-300 rounded-lg font-semibold">Retour</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold">Suivant</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-800">Ajoutez vos produits</h2>
            {products.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-sm flex-1">{p.name} — {p.price} XOF</span>
                <button onClick={() => setProducts(ps => ps.filter((_, j) => j !== i))} className="text-error text-sm">Supprimer</button>
              </div>
            ))}
            <div className="flex gap-2">
              <input placeholder="Produit" id="new-name" className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
              <input placeholder="Prix" id="new-price" type="number" className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
              <input placeholder="Unité" id="new-unit" className="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
              <button onClick={() => {
                const name = (document.getElementById('new-name') as HTMLInputElement).value
                const price = (document.getElementById('new-price') as HTMLInputElement).value
                const unit = (document.getElementById('new-unit') as HTMLInputElement).value
                if (name && price) { setProducts(ps => [...ps, { name, price, unit: unit || 'pièce' }])
                  ;(document.getElementById('new-name') as HTMLInputElement).value = ''
                  ;(document.getElementById('new-price') as HTMLInputElement).value = ''
                  ;(document.getElementById('new-unit') as HTMLInputElement).value = ''
                }
              }} className="px-3 py-2 bg-secondary text-white rounded-lg text-sm">+</button>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border border-neutral-300 rounded-lg font-semibold">Retour</button>
              <button onClick={handleSubmit} disabled={isSubmitting || products.length === 0} className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold disabled:opacity-50">
                {isSubmitting ? 'Création...' : 'Créer ma boutique'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

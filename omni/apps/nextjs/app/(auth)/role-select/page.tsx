'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RoleSelectPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'vendor' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!selectedRole) return
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/role-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Une erreur est survenue')
        return
      }
      router.push(selectedRole === 'vendor' ? '/vendor/onboarding' : '/map')
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl">
      <h1 className="text-2xl font-bold text-white text-center mb-8">
        Comment souhaitez-vous utiliser Omni ?
      </h1>

      {error && (
        <div className="bg-error/10 text-error p-3 rounded-lg mb-6 text-center text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-8">
        <button
          onClick={() => setSelectedRole('buyer')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
            selectedRole === 'buyer'
              ? 'border-primary bg-primary/10 text-white'
              : 'border-neutral-600 text-neutral-300 hover:border-neutral-500'
          }`}
        >
          <div className="font-semibold">Acheteur</div>
          <div className="text-sm text-neutral-400 mt-1">
            Je cherche des produits près de chez moi
          </div>
        </button>

        <button
          onClick={() => setSelectedRole('vendor')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
            selectedRole === 'vendor'
              ? 'border-primary bg-primary/10 text-white'
              : 'border-neutral-600 text-neutral-300 hover:border-neutral-500'
          }`}
        >
          <div className="font-semibold">Vendeur</div>
          <div className="text-sm text-neutral-400 mt-1">
            Je vends des produits et je veux être trouvé
          </div>
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedRole || isLoading}
        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Chargement...' : 'Continuer'}
      </button>
    </div>
  )
}

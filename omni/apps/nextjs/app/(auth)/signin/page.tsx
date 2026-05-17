'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue')
        return
      }
      router.push(`/auth/verify?phone=${encodeURIComponent(phone)}`)
    } catch {
      setError('Problème de connexion. Réessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl">
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Bienvenue sur Omni
      </h1>
      <p className="text-neutral-400 text-center mb-8">
        Entrez votre numéro de téléphone pour continuer
      </p>

      {error && (
        <div className="bg-error/10 text-error p-3 rounded-lg mb-6 text-center text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-neutral-300 text-sm mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+228 12 34 56 78"
            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-primary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Envoi...' : 'Envoyer le code'}
        </button>
      </form>

      <p className="text-neutral-500 text-xs text-center mt-6">
        Vous recevrez un code par SMS. Valide 10 minutes.
      </p>

      <p className="text-neutral-400 text-sm text-center mt-4">
        Pas de compte ? Créez-en un en 30 secondes →
      </p>
    </div>
  )
}

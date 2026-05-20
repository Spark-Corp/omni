'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') ?? ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otp.join('') }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Code incorrect. Réessayez.'); return }
      router.push(data.needsRole ? '/auth/role-select' : '/map')
    } catch { setError('Une erreur est survenue') }
    finally { setIsLoading(false) }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  const maskedPhone = phone.replace(/(\+\d{3})\s?\d{2}\s?\d{2}/, '$1 XX XX XX')

  return (
    <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl">
      <h1 className="text-2xl font-bold text-white text-center mb-2">Entrez le code de vérification</h1>
      <p className="text-neutral-400 text-center mb-8">Envoyé à {maskedPhone}</p>
      {error && <div className="bg-error/10 text-error p-3 rounded-lg mb-6 text-center text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 justify-center">
          {otp.map((digit, i) => (
            <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              className="w-12 h-14 text-center text-xl bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          ))}
        </div>
        <button type="submit" disabled={isLoading || otp.join('').length !== 6}
          className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Vérification...' : 'Vérifier'}
        </button>
      </form>
      <div className="text-center mt-6">
        {countdown > 0 ? (
          <p className="text-neutral-500 text-sm">Renvoyer dans {countdown}s</p>
        ) : (
          <button onClick={() => { setCountdown(30); setOtp(['', '', '', '', '', '']); setError('') }}
            className="text-primary hover:underline text-sm">Renvoyer le code</button>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-neutral-400">Chargement...</div>}>
      <VerifyContent />
    </Suspense>
  )
}

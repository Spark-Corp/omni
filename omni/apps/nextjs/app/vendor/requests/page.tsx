'use client'

import { useState } from 'react'

export default function VendorRequestsPage() {
  const [tab, setTab] = useState<'new' | 'responded' | 'expired'>('new')
  const tabs = [
    { key: 'new', label: 'Nouvelles' },
    { key: 'responded', label: 'Répondues' },
    { key: 'expired', label: 'Expirées' },
  ] as const

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Demandes</h1>
      <div className="flex gap-1 mb-6 bg-neutral-100 rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === t.key ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500">Aucune demande</p>
        <p className="text-sm text-neutral-400 mt-1">Quand un acheteur vous contactera, cela apparaîtra ici.</p>
      </div>
    </div>
  )
}

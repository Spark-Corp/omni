'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: '', description: '' })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Paramètres</h1>
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Nom de la boutique</label>
          <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2 border border-neutral-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2 border border-neutral-300 rounded-lg" rows={3} />
        </div>
        <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium">Enregistrer</button>
      </div>
    </div>
  )
}

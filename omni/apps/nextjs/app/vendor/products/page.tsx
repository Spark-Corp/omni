'use client'

import { useState } from 'react'

export default function ProductsPage() {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Mes produits</h1>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
          Ajouter un produit
        </button>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500">Aucun produit</p>
        <p className="text-sm text-neutral-400 mt-1">Ajoutez votre premier produit pour apparaître dans les résultats.</p>
      </div>
    </div>
  )
}

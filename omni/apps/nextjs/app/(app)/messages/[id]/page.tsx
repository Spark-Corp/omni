'use client'

import { useParams } from 'next/navigation'

export default function BuyerChatPage() {
  const params = useParams()
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Conversation</h1>
      <div className="bg-white rounded-xl border border-neutral-200 p-6 min-h-[400px] flex items-center justify-center">
        <p className="text-neutral-500">Chargez la conversation...</p>
      </div>
    </div>
  )
}

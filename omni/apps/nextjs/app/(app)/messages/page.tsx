export default function BuyerMessagesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Messages</h1>
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500">Aucun message</p>
        <p className="text-sm text-neutral-400 mt-1">Les conversations apparaîtront ici quand vous contacterez un vendeur.</p>
      </div>
    </div>
  )
}

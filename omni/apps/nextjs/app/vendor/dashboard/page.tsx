export default function VendorDashboardPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <p className="text-sm text-neutral-500 mb-1">Vues aujourd'hui</p>
          <p className="text-3xl font-bold text-neutral-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <p className="text-sm text-neutral-500 mb-1">Demandes</p>
          <p className="text-3xl font-bold text-neutral-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <p className="text-sm text-neutral-500 mb-1">Taux de réponse</p>
          <p className="text-3xl font-bold text-neutral-800">—</p>
        </div>
      </div>
    </div>
  )
}

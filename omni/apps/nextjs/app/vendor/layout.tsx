import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'vendor') redirect('/auth/signin')

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <a href="/vendor/dashboard" className="font-bold text-primary">Omni</a>
          <a href="/vendor/dashboard" className="text-sm text-neutral-600 hover:text-neutral-800">Dashboard</a>
          <a href="/vendor/products" className="text-sm text-neutral-600 hover:text-neutral-800">Produits</a>
          <a href="/vendor/requests" className="text-sm text-neutral-600 hover:text-neutral-800">Demandes</a>
          <a href="/vendor/messages" className="text-sm text-neutral-600 hover:text-neutral-800">Messages</a>
          <a href="/vendor/settings" className="text-sm text-neutral-600 hover:text-neutral-800 ml-auto">Paramètres</a>
          <a href="/vendor/premium" className="text-sm text-ai-accent font-medium">Premium</a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

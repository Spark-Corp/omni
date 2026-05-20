import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Omni — Trouvez tout près de chez vous',
  description: 'Omni vous connecte aux vendeurs de votre quartier en temps réel.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  )
}

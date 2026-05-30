import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientProviders } from '@/providers/client-providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Toilet KPI 🧻',
  description: 'Transformando papel higiênico em consciência sustentável.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}

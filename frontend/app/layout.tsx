import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientProviders } from '@/providers/client-providers'
import { FirstRunLoader } from '@/components/first-run-loader'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Campeões do Tolete 🧻',
  description: 'O trono é para os fortes. Prove seu valor.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientProviders>
          <FirstRunLoader>{children}</FirstRunLoader>
        </ClientProviders>
      </body>
    </html>
  )
}

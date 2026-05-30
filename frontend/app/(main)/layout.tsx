import { ReactNode } from 'react'
import { AppNav } from '@/components/app-nav'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppNav />
      {/* pb-16 on mobile reserves space for the fixed bottom tab bar */}
      <main className="flex flex-1 flex-col overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}

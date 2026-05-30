'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users } from 'lucide-react'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home, shortLabel: 'H' },
  { href: '/social', label: 'Social', icon: Users, shortLabel: 'S' },
] as const

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop: left sidebar */}
      <aside className="hidden md:flex md:w-16 md:flex-shrink-0 md:flex-col md:border-r md:border-border md:bg-background">
        <nav className="flex flex-col gap-2 p-3 pt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.shortLabel}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile: bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background md:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

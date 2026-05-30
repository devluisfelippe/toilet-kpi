import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-5xl">🧻</span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Toilet KPI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transformando papel higiênico em consciência sustentável.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}

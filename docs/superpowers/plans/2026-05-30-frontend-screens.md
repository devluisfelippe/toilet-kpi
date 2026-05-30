# Frontend Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **COMMIT RULE:** NEVER add `Co-Authored-By: Claude` or any AI co-author trailer to commits. Commits belong only to the human author.

**Goal:** Implement all frontend screens — Login, Register, Home (KPI chart + challenges + quote), Social (partners) — following the wireframe layout, mobile-first and fully responsive, with a mock service layer ready to swap in real API calls later.

**Architecture:** Two Next.js route groups: `(auth)` for login/register (centered card layout) and `(main)` for home/social. Navigation uses **bottom tab bar on mobile, sidebar on desktop** (`md:` breakpoint toggle). Services are isolated behind async functions; mocks return typed data today, real API calls tomorrow — no component changes required when the API is ready. Dark mode forced by default (matches wireframe). Challenges come from a backend API route — service mock matches the expected response shape.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Tailwind v4, shadcn/ui (Button, Card, Dialog, Input, Label, Badge), Recharts (bar chart), date-fns.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| MODIFY | `frontend/app/layout.tsx` | Force dark mode (`dark` class on `<html>`) |
| MODIFY | `frontend/app/page.tsx` | Redirect to `/home` |
| CREATE | `frontend/app/(auth)/layout.tsx` | Centered card layout for auth screens |
| CREATE | `frontend/app/(auth)/login/page.tsx` | Login form (email + password) |
| CREATE | `frontend/app/(auth)/register/page.tsx` | Register form (name + email + password) |
| CREATE | `frontend/app/(main)/layout.tsx` | Responsive layout: bottom nav (mobile) + sidebar (desktop) |
| CREATE | `frontend/app/(main)/home/page.tsx` | Home: chart + register btn + challenges + quote |
| CREATE | `frontend/app/(main)/social/page.tsx` | Social: partners list + add partner dialog |
| CREATE | `frontend/services/types.ts` | All service interfaces and return types |
| CREATE | `frontend/services/records.service.ts` | DailyRecord CRUD (mock → API) |
| CREATE | `frontend/services/user.service.ts` | UserProfile read/update (mock → API) |
| CREATE | `frontend/services/social.service.ts` | Partners CRUD (mock → API) |
| CREATE | `frontend/services/challenges.service.ts` | Challenges list (mock → API — shape matches backend route) |
| CREATE | `frontend/constants/quotes.ts` | Array of humorous quotes for daily display |
| CREATE | `frontend/components/app-nav.tsx` | Bottom nav (mobile) + sidebar (desktop) — unified component |
| CREATE | `frontend/components/kpi-bar-chart.tsx` | Recharts BarChart for monthly KPI metrics |
| CREATE | `frontend/components/daily-record-dialog.tsx` | "Registrar nova cagada" form dialog |
| CREATE | `frontend/components/challenge-card.tsx` | Single challenge progress card |
| CREATE | `frontend/components/challenges-section.tsx` | Horizontal scroll row of challenge cards |
| CREATE | `frontend/components/daily-quote.tsx` | Humorous quote display |
| CREATE | `frontend/components/partner-card.tsx` | Single partner display card |
| CREATE | `frontend/components/add-partner-dialog.tsx` | Modal: add a new shit partner |
| MODIFY | `frontend/package.json` | Add recharts, date-fns |

---

## Task 1: Install Runtime Dependencies + shadcn/ui Components

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/components/ui/button.tsx`
- Create: `frontend/components/ui/card.tsx`
- Create: `frontend/components/ui/input.tsx`
- Create: `frontend/components/ui/label.tsx`
- Create: `frontend/components/ui/dialog.tsx`
- Create: `frontend/components/ui/badge.tsx`

- [ ] **Step 1: Install recharts, date-fns and missing Radix primitives**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi/frontend && npm install recharts date-fns @radix-ui/react-dialog @radix-ui/react-label
```

Expected: packages added with no errors.

- [ ] **Step 2: Try shadcn/ui CLI first**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi/frontend && npx shadcn add button card dialog input label badge --yes 2>&1 | head -30
```

If the CLI succeeds, skip Steps 3-8 and go to Step 9 (commit). If it fails or produces errors, continue with Steps 3-8 (manual creation).

- [ ] **Step 3: Create components/ui/button.tsx (manual fallback)**

Create `frontend/components/ui/button.tsx`:

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

- [ ] **Step 4: Create components/ui/card.tsx (manual fallback)**

Create `frontend/components/ui/card.tsx`:

```tsx
import * as React from 'react'
import { cn } from '@/utils/cn'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-xl border bg-card text-card-foreground shadow', className)} {...props} />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

- [ ] **Step 5: Create components/ui/input.tsx (manual fallback)**

Create `frontend/components/ui/input.tsx`:

```tsx
import * as React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
```

- [ ] **Step 6: Create components/ui/label.tsx (manual fallback)**

Create `frontend/components/ui/label.tsx`:

```tsx
import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/utils/cn'

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

- [ ] **Step 7: Create components/ui/dialog.tsx (manual fallback)**

Create `frontend/components/ui/dialog.tsx`:

```tsx
'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </DialogClose>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

export {
  Dialog, DialogTrigger, DialogPortal, DialogOverlay,
  DialogClose, DialogContent, DialogHeader, DialogTitle,
}
```

- [ ] **Step 8: Create components/ui/badge.tsx (manual fallback)**

Create `frontend/components/ui/badge.tsx`:

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
```

- [ ] **Step 9: Commit**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi && git add frontend/package.json frontend/package-lock.json frontend/components/ui/ && git commit -m "build(frontend): add recharts, date-fns and shadcn/ui base components"
```

---

## Task 2: Service Layer + Mock Data + Quotes

**Files:**
- Create: `frontend/services/types.ts`
- Create: `frontend/services/records.service.ts`
- Create: `frontend/services/user.service.ts`
- Create: `frontend/services/social.service.ts`
- Create: `frontend/services/challenges.service.ts`
- Create: `frontend/constants/quotes.ts`

- [ ] **Step 1: Create services/types.ts**

Create `frontend/services/types.ts`:

```typescript
import type { DailyRecord, KpiMetrics, UserProfile } from '@/types'

export interface ServiceResult<T> {
  data: T
  error?: string
}

export interface Partner {
  id: string
  name: string
  avatarInitials: string
  monthlyRolls: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  badge: string
  target: number
  progress: number
  unit: string
  completed: boolean
}

export interface MonthlyKpiEntry {
  month: string
  rolls: number
  costBrl: number
  waterLiters: number
  co2Kg: number
}

export type { DailyRecord, KpiMetrics, UserProfile }
```

- [ ] **Step 2: Create services/records.service.ts**

Create `frontend/services/records.service.ts`:

```typescript
import { calculateKpi } from '@/utils/calculate-kpi'
import { DEFAULT_ROLL_PRICE_BRL } from '@/constants/kpi'
import type { DailyRecord, MonthlyKpiEntry, ServiceResult } from './types'

const MOCK_MONTHLY_KPI: MonthlyKpiEntry[] = [
  { month: 'Fev', rolls: 2.1, costBrl: 5.25, waterLiters: 294, co2Kg: 0.13 },
  { month: 'Mar', rolls: 1.8, costBrl: 4.5, waterLiters: 252, co2Kg: 0.11 },
  { month: 'Abr', rolls: 2.4, costBrl: 6.0, waterLiters: 336, co2Kg: 0.14 },
  { month: 'Mai', rolls: 1.5, costBrl: 3.75, waterLiters: 210, co2Kg: 0.09 },
]

// TODO: replace with GET /api/records when API is ready
export async function getMonthlyKpi(): Promise<ServiceResult<MonthlyKpiEntry[]>> {
  return { data: MOCK_MONTHLY_KPI }
}

// TODO: replace with POST /api/records when API is ready
export async function createRecord(
  record: Omit<DailyRecord, 'date'>
): Promise<ServiceResult<DailyRecord>> {
  const newRecord: DailyRecord = {
    ...record,
    date: new Date().toISOString().split('T')[0],
  }
  calculateKpi(record, DEFAULT_ROLL_PRICE_BRL)
  return { data: newRecord }
}
```

- [ ] **Step 3: Create services/user.service.ts**

Create `frontend/services/user.service.ts`:

```typescript
import type { UserProfile, ServiceResult } from './types'

const MOCK_USER: UserProfile = {
  rollPriceBrl: 2.5,
  consumptionProfile: 'moderate',
}

// TODO: replace with GET /api/user when API is ready
export async function getUserProfile(): Promise<ServiceResult<UserProfile>> {
  return { data: MOCK_USER }
}

// TODO: replace with PATCH /api/user when API is ready
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<ServiceResult<UserProfile>> {
  return { data: { ...MOCK_USER, ...updates } }
}
```

- [ ] **Step 4: Create services/social.service.ts**

Create `frontend/services/social.service.ts`:

```typescript
import type { Partner, ServiceResult } from './types'

const MOCK_PARTNERS: Partner[] = [
  { id: '1', name: 'João Silva', avatarInitials: 'JS', monthlyRolls: 3.2 },
  { id: '2', name: 'Maria Souza', avatarInitials: 'MS', monthlyRolls: 1.1 },
  { id: '3', name: 'Pedro Costa', avatarInitials: 'PC', monthlyRolls: 4.7 },
]

// TODO: replace with GET /api/partners when API is ready
export async function getPartners(): Promise<ServiceResult<Partner[]>> {
  return { data: MOCK_PARTNERS }
}

// TODO: replace with POST /api/partners when API is ready
export async function addPartner(name: string): Promise<ServiceResult<Partner>> {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return {
    data: { id: String(Date.now()), name, avatarInitials: initials, monthlyRolls: 0 },
  }
}
```

- [ ] **Step 5: Create services/challenges.service.ts**

The shape of `Challenge` must match the backend route response contract exactly. The mock follows this shape so that swapping to a real fetch requires only replacing the function body.

Create `frontend/services/challenges.service.ts`:

```typescript
import type { Challenge, ServiceResult } from './types'

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Mestre da Folha Única',
    description: 'Use no máximo 1 volta na mão por ida',
    badge: '🏆',
    target: 7,
    progress: 3,
    unit: 'dias',
    completed: false,
  },
  {
    id: '2',
    title: 'Ninja da Ducha',
    description: 'Use água como complemento por 5 dias seguidos',
    badge: '🥷',
    target: 5,
    progress: 5,
    unit: 'dias',
    completed: true,
  },
  {
    id: '3',
    title: 'Guardião da Celulose',
    description: 'Fique abaixo de 1 rolo no mês',
    badge: '🌿',
    target: 1,
    progress: 0.6,
    unit: 'rolos',
    completed: false,
  },
  {
    id: '4',
    title: 'CEO do Banheiro Sustentável',
    description: 'Complete todos os outros desafios',
    badge: '👑',
    target: 3,
    progress: 1,
    unit: 'desafios',
    completed: false,
  },
]

// TODO: replace with GET /api/challenges when API is ready
export async function getChallenges(): Promise<ServiceResult<Challenge[]>> {
  return { data: MOCK_CHALLENGES }
}
```

- [ ] **Step 6: Create constants/quotes.ts**

Create `frontend/constants/quotes.ts`:

```typescript
export interface Quote {
  text: string
  author: string
}

export const DAILY_QUOTES: Quote[] = [
  {
    text: 'O príncipe deve fazer o bem sempre que possível, mas estar preparado para fazer o mal quando necessário.',
    author: 'Nicolau Maquiavel',
  },
  {
    text: 'A natureza não faz nada em vão.',
    author: 'Aristóteles',
  },
  {
    text: 'Conhece-te a ti mesmo — incluindo o quanto de papel você usa.',
    author: 'Sócrates (adaptado)',
  },
  {
    text: 'A maior riqueza é a saúde, a segunda é a beleza, a terceira é o papel higiênico.',
    author: 'Platão (adaptado)',
  },
  {
    text: 'Seja a mudança que você quer ver no banheiro.',
    author: 'Mahatma Gandhi (adaptado)',
  },
]

export function getDailyQuote(): Quote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}
```

- [ ] **Step 7: Commit**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi && git add frontend/services/ frontend/constants/quotes.ts && git commit -m "feat(frontend): add service layer with mocks and daily quotes"
```

---

## Task 3: Auth Screens — Login and Register

**Files:**
- Create: `frontend/app/(auth)/layout.tsx`
- Create: `frontend/app/(auth)/login/page.tsx`
- Create: `frontend/app/(auth)/register/page.tsx`

- [ ] **Step 1: Create app/(auth)/layout.tsx**

Create `frontend/app/(auth)/layout.tsx`:

```tsx
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
```

- [ ] **Step 2: Create app/(auth)/login/page.tsx**

Create `frontend/app/(auth)/login/page.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: replace with POST /api/auth/login when API is ready
    router.push('/home')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg">Entrar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/register" className="text-primary underline underline-offset-4">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create app/(auth)/register/page.tsx**

Create `frontend/app/(auth)/register/page.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: replace with POST /api/auth/register when API is ready
    router.push('/home')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg">Criar conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Criar conta
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi && git add frontend/app/\(auth\)/ && git commit -m "feat(frontend): add login and register screens"
```

---

## Task 4: Responsive Navigation + Main Layout

Navigation strategy:
- **Mobile (`< md`):** bottom tab bar fixed at the bottom of the screen, icons + labels
- **Desktop (`>= md`):** sidebar on the left, 64px wide, icons only

**Files:**
- Create: `frontend/components/app-nav.tsx`
- Create: `frontend/app/(main)/layout.tsx`
- Modify: `frontend/app/layout.tsx` (dark mode)
- Modify: `frontend/app/page.tsx` (redirect)

- [ ] **Step 1: Modify app/layout.tsx to force dark mode**

Overwrite `frontend/app/layout.tsx`:

```tsx
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
```

- [ ] **Step 2: Modify app/page.tsx to redirect**

Overwrite `frontend/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  // TODO: check auth state when API is ready — redirect to /login if not authenticated
  redirect('/home')
}
```

- [ ] **Step 3: Create components/app-nav.tsx**

Create `frontend/components/app-nav.tsx`:

```tsx
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
```

- [ ] **Step 4: Create app/(main)/layout.tsx**

Create `frontend/app/(main)/layout.tsx`:

```tsx
import { ReactNode } from 'react'
import { AppNav } from '@/components/app-nav'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppNav />
      {/* Main content: on mobile add bottom padding for the tab bar */}
      <main className="flex flex-1 flex-col overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi && git add frontend/app/layout.tsx frontend/app/page.tsx frontend/components/app-nav.tsx frontend/app/\(main\)/ && git commit -m "feat(frontend): add responsive navigation (bottom bar mobile, sidebar desktop) and dark mode"
```

---

## Task 5: Shared Components — Chart, Challenges, Quote

**Files:**
- Create: `frontend/components/kpi-bar-chart.tsx`
- Create: `frontend/components/challenge-card.tsx`
- Create: `frontend/components/challenges-section.tsx`
- Create: `frontend/components/daily-quote.tsx`

- [ ] **Step 1: Create components/kpi-bar-chart.tsx**

Recharts uses browser APIs so must be a client component.

Create `frontend/components/kpi-bar-chart.tsx`:

```tsx
'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { MonthlyKpiEntry } from '@/services/types'

interface KpiBarChartProps {
  data: MonthlyKpiEntry[]
}

export function KpiBarChart({ data }: KpiBarChartProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value} rolos`, 'Consumo']}
          />
          <Bar dataKey="rolls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Create components/challenge-card.tsx**

Create `frontend/components/challenge-card.tsx`:

```tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Challenge } from '@/services/types'

interface ChallengeCardProps {
  challenge: Challenge
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const percentage = Math.min(
    Math.round((challenge.progress / challenge.target) * 100),
    100
  )

  return (
    <Card className="w-48 flex-shrink-0">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xl">{challenge.badge}</span>
          {challenge.completed && (
            <Badge variant="default" className="text-xs">Completo</Badge>
          )}
        </div>
        <p className="mb-1 text-sm font-semibold leading-tight">{challenge.title}</p>
        <p className="mb-3 text-xs text-muted-foreground leading-snug">{challenge.description}</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{challenge.progress} / {challenge.target} {challenge.unit}</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create components/challenges-section.tsx**

Create `frontend/components/challenges-section.tsx`:

```tsx
import { ChallengeCard } from '@/components/challenge-card'
import type { Challenge } from '@/services/types'

interface ChallengesSectionProps {
  challenges: Challenge[]
}

export function ChallengesSection({ challenges }: ChallengesSectionProps) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Desafios
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create components/daily-quote.tsx**

Create `frontend/components/daily-quote.tsx`:

```tsx
import type { Quote } from '@/constants/quotes'

interface DailyQuoteProps {
  quote: Quote
}

export function DailyQuote({ quote }: DailyQuoteProps) {
  return (
    <blockquote className="rounded-lg border border-border p-4 text-center">
      <p className="text-sm italic text-muted-foreground leading-relaxed">
        &ldquo;{quote.text}&rdquo;
      </p>
      <footer className="mt-2 text-xs font-medium text-muted-foreground">
        — {quote.author}
      </footer>
    </blockquote>
  )
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi && git add frontend/components/kpi-bar-chart.tsx frontend/components/challenge-card.tsx frontend/components/challenges-section.tsx frontend/components/daily-quote.tsx && git commit -m "feat(frontend): add KPI chart, challenge cards and daily quote components"
```

---

## Task 6: "Registrar Nova Cagada" Dialog + Home Screen

**Files:**
- Create: `frontend/components/daily-record-dialog.tsx`
- Create: `frontend/app/(main)/home/page.tsx`

- [ ] **Step 1: Create components/daily-record-dialog.tsx**

Create `frontend/components/daily-record-dialog.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRecord } from '@/services/records.service'

interface DailyRecordDialogProps {
  onSuccess?: () => void
}

export function DailyRecordDialog({ onSuccess }: DailyRecordDialogProps) {
  const [open, setOpen] = useState(false)
  const [bathroomTrips, setBathroomTrips] = useState(2)
  const [handTurns, setHandTurns] = useState(1)
  const [usedWater, setUsedWater] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await createRecord({ bathroomTrips, handTurns, usedWater })
    setSubmitting(false)
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full py-6 text-base uppercase tracking-widest">
          Registrar Nova Cagada
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-auto max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar Nova Cagada 🧻</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="trips">Idas ao banheiro</Label>
            <Input
              id="trips"
              type="number"
              min={1}
              max={20}
              value={bathroomTrips}
              onChange={(e) => setBathroomTrips(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="turns">Voltas na mão</Label>
            <Input
              id="turns"
              type="number"
              min={1}
              max={10}
              value={handTurns}
              onChange={(e) => setHandTurns(Number(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">
              ≈ {handTurns * 5} folhas por ida
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="water"
              type="checkbox"
              checked={usedWater}
              onChange={(e) => setUsedWater(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Label htmlFor="water">Usou ducha / bidê</Label>
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Registrando...' : 'Confirmar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create app/(main)/home/page.tsx**

`KpiBarChart` is a client component (recharts). To avoid SSR issues, import it via `dynamic` with `ssr: false`.

Create `frontend/app/(main)/home/page.tsx`:

```tsx
import dynamic from 'next/dynamic'
import { getMonthlyKpi } from '@/services/records.service'
import { getChallenges } from '@/services/challenges.service'
import { getDailyQuote } from '@/constants/quotes'
import { ChallengesSection } from '@/components/challenges-section'
import { DailyRecordDialog } from '@/components/daily-record-dialog'
import { DailyQuote } from '@/components/daily-quote'

const KpiBarChart = dynamic(
  () => import('@/components/kpi-bar-chart').then((m) => m.KpiBarChart),
  { ssr: false }
)

export default async function HomePage() {
  const [kpiResult, challengesResult] = await Promise.all([
    getMonthlyKpi(),
    getChallenges(),
  ])
  const quote = getDailyQuote()

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Consumo mensal — rolos
        </h1>
        <KpiBarChart data={kpiResult.data} />
      </div>

      <DailyRecordDialog />

      <ChallengesSection challenges={challengesResult.data} />

      <DailyQuote quote={quote} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi && git add frontend/components/daily-record-dialog.tsx frontend/app/\(main\)/home/ && git commit -m "feat(frontend): add home screen with KPI chart, register dialog and challenges"
```

---

## Task 7: Social Screen + Add Partner Dialog

**Files:**
- Create: `frontend/components/partner-card.tsx`
- Create: `frontend/components/add-partner-dialog.tsx`
- Create: `frontend/app/(main)/social/page.tsx`

- [ ] **Step 1: Create components/partner-card.tsx**

Create `frontend/components/partner-card.tsx`:

```tsx
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Partner } from '@/services/types'

interface PartnerCardProps {
  partner: Partner
  isSelected?: boolean
}

export function PartnerCard({ partner, isSelected = false }: PartnerCardProps) {
  return (
    <Card className={isSelected ? 'border-primary' : ''}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {partner.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{partner.name}</p>
          <p className="text-xs text-muted-foreground">
            {partner.monthlyRolls.toFixed(1)} rolos/mês
          </p>
        </div>
        <Badge variant={partner.monthlyRolls < 2 ? 'default' : 'secondary'} className="text-xs">
          {partner.monthlyRolls < 2 ? '🌿' : partner.monthlyRolls > 4 ? '🔥' : '😐'}
        </Badge>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create components/add-partner-dialog.tsx**

Create `frontend/components/add-partner-dialog.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addPartner } from '@/services/social.service'
import type { Partner } from '@/services/types'

interface AddPartnerDialogProps {
  onAdd?: (partner: Partner) => void
}

export function AddPartnerDialog({ onAdd }: AddPartnerDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    const result = await addPartner(name.trim())
    setSubmitting(false)
    setOpen(false)
    setName('')
    onAdd?.(result.data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full py-6 text-base uppercase tracking-widest">
          Adicionar Parceiro de Cagada
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-auto max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar Parceiro 🤝</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner-name">Nome do parceiro</Label>
            <Input
              id="partner-name"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Create app/(main)/social/page.tsx**

Social page uses client-side state for the partner list (adds optimistically on the client while API isn't ready).

Create `frontend/app/(main)/social/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { getPartners } from '@/services/social.service'
import { PartnerCard } from '@/components/partner-card'
import { AddPartnerDialog } from '@/components/add-partner-dialog'
import type { Partner } from '@/services/types'

export default function SocialPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    getPartners().then((r) => setPartners(r.data))
  }, [])

  function handleAdd(partner: Partner) {
    setPartners((prev) => [...prev, partner])
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Parceiros de cagada
        </h1>
        <div className="flex flex-col gap-2">
          {partners.map((partner) => (
            <button
              key={partner.id}
              onClick={() =>
                setSelectedId(partner.id === selectedId ? null : partner.id)
              }
              className="w-full text-left"
            >
              <PartnerCard partner={partner} isSelected={partner.id === selectedId} />
            </button>
          ))}
          {partners.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum parceiro ainda. Adicione alguém!
            </p>
          )}
        </div>
      </div>

      <AddPartnerDialog onAdd={handleAdd} />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi && git add frontend/components/partner-card.tsx frontend/components/add-partner-dialog.tsx frontend/app/\(main\)/social/ && git commit -m "feat(frontend): add social screen with partners list and add partner dialog"
```

---

## Task 8: Verify Build + Fix Issues

**Files:** fixes only

- [ ] **Step 1: Run TypeScript type check**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi/frontend && npx tsc --noEmit 2>&1
```

Fix any type errors. Common issues:
- Missing `'use client'` on components that use hooks → add it
- Unused variable warnings → remove unused imports

- [ ] **Step 2: Run production build**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi/frontend && npm run build 2>&1
```

Expected: `✓ Compiled successfully`

Common issues and fixes:
- `@radix-ui/react-dialog` missing → `npm install @radix-ui/react-dialog`
- `@radix-ui/react-label` missing → `npm install @radix-ui/react-label`
- Recharts SSR error → `dynamic(..., { ssr: false })` already applied in home/page.tsx

- [ ] **Step 3: Run dev server and verify on mobile viewport**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi/frontend && npm run dev
```

Open browser DevTools → toggle mobile emulation (375px viewport) and verify:
- `/` redirects to `/home`
- Bottom tab bar is visible with "Home" and "Social"
- Bar chart renders inside the viewport
- "Registrar nova cagada" button is full-width
- Dialog opens on tap, form is accessible
- Navigate to `/social` via tab bar — partners list and "Adicionar" button visible
- Open `/login` and `/register` — form is centered and readable on mobile
- On desktop (≥768px): bottom bar disappears, sidebar appears on the left

- [ ] **Step 4: Commit any fixes**

```bash
cd /Users/andreimatiazischopf/Projects/Personal-projects/toilet-kpi && git add -A && git commit -m "fix(frontend): resolve build and responsive issues after screens implementation"
```

---

## Self-Review

**Spec coverage:**
- ✅ Home screen (H) with bar chart, register button, challenges, quote — Tasks 5 + 6
- ✅ Social screen (S) with partners list and add partner dialog — Task 7
- ✅ Login screen — Task 3
- ✅ Register/auto-cadastro screen — Task 3
- ✅ Challenges section embedded in home, data from service (mock → API) — Task 2 + 5
- ✅ Service layer abstraction ready for API — Task 2 (all services have `// TODO: replace with real API`)
- ✅ Challenges service shape matches what a backend route would return — Task 2 Step 5
- ✅ Mobile-first responsive: bottom tab bar on mobile, sidebar on desktop — Task 4
- ✅ Dark mode by default (matches wireframe aesthetic) — Task 4
- ✅ No co-author in any commit message — enforced in header rule

**No API coupling:** All data flows through `services/` functions. Swapping mock → real API = replace function bodies only. No component changes needed.

**Responsive coverage:** Every page uses `p-4 sm:p-6` padding, challenge cards scroll horizontally, dialogs are `max-w-sm` and centered, bottom nav is hidden on `md:` and replaced by sidebar.

**Placeholder scan:** All auth-related TODOs say exactly which HTTP verb and endpoint to replace with. No vague "implement later" comments.

**Type consistency:** `Partner`, `Challenge`, `MonthlyKpiEntry` defined once in `services/types.ts` (Task 2 Step 1) and imported in every component that uses them. `DailyRecord` from `@/types` re-exported via `services/types.ts`.

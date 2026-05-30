# App Router Migration — Frontend Restructuring

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the frontend from Next.js Pages Router to App Router, adopting TypeScript, Tailwind CSS, shadcn/ui, and the same folder structure used in `apps/brokers`.

**Architecture:** The `pages/` directory is replaced by an `app/` directory with `layout.tsx` and `page.tsx`. Providers are isolated in `providers/client-providers.tsx` (client component) and composed into the root layout (server component). Feature folders (`components/`, `hooks/`, `types/`, `utils/`, `constants/`) are created at the root of `frontend/`.

**Tech Stack:** Next.js 16.2.6 App Router, React 19, TypeScript 5, Tailwind CSS 3, shadcn/ui (Radix UI + class-variance-authority), Lucide React.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| CREATE | `frontend/tsconfig.json` | TypeScript config with `@/*` path alias |
| CREATE | `frontend/tailwind.config.ts` | Tailwind content paths + theme |
| CREATE | `frontend/postcss.config.mjs` | PostCSS with tailwindcss + autoprefixer |
| CREATE | `frontend/app/globals.css` | Tailwind directives + CSS variables |
| CREATE | `frontend/app/layout.tsx` | Root server layout: metadata, font, ClientProviders |
| CREATE | `frontend/app/page.tsx` | Root page: landing placeholder |
| CREATE | `frontend/providers/client-providers.tsx` | 'use client' wrapper for future providers |
| CREATE | `frontend/constants/kpi.ts` | Named constants for all KPI calculations |
| CREATE | `frontend/types/index.ts` | Shared TypeScript types (DailyRecord, UserProfile, KpiMetrics) |
| CREATE | `frontend/utils/calculate-kpi.ts` | Pure functions: folhas → rolos → custo → impacto |
| CREATE | `frontend/components/ui/` | shadcn/ui base components (via CLI) |
| MODIFY | `frontend/package.json` | Add TypeScript, Tailwind, shadcn/ui deps |
| MODIFY | `frontend/next.config.mjs` | No change needed (reactStrictMode kept) |
| DELETE | `frontend/pages/` | Entire Pages Router directory |
| DELETE | `frontend/styles/` | Old globals.css and CSS modules |
| DELETE | `frontend/jsconfig.json` | Replaced by tsconfig.json |

---

## Task 1: Read Next.js 16 App Router Docs

**Files:**
- Read: `frontend/node_modules/next/dist/docs/` (any available .md files)

- [ ] **Step 1: Check what docs are available**

```bash
ls frontend/node_modules/next/dist/docs/ 2>/dev/null | head -20
```

Expected: list of markdown files describing Next.js 16 APIs. If empty, skip and proceed — the brokers project's pattern is the authoritative reference.

- [ ] **Step 2: Scan for App Router-specific notes**

```bash
find frontend/node_modules/next/dist/docs -name "*.md" 2>/dev/null | xargs grep -l "app" | head -5
```

Note any breaking changes. If nothing is found, proceed with the plan — Next.js 16's App Router is stable.

---

## Task 2: Install TypeScript and Configure tsconfig.json

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Delete: `frontend/jsconfig.json`

- [ ] **Step 1: Install TypeScript dependencies**

```bash
cd frontend && npm install --save-dev typescript @types/node @types/react @types/react-dom
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Create tsconfig.json**

Create `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Delete jsconfig.json**

```bash
rm frontend/jsconfig.json
```

- [ ] **Step 4: Verify TypeScript resolves**

```bash
cd frontend && npx tsc --version
```

Expected: `Version 5.x.x`

- [ ] **Step 5: Commit**

```bash
git add frontend/tsconfig.json frontend/package.json frontend/package-lock.json
git rm frontend/jsconfig.json
git commit -m "build(frontend): add TypeScript, replace jsconfig with tsconfig"
```

---

## Task 3: Install and Configure Tailwind CSS

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.mjs`

- [ ] **Step 1: Install Tailwind + PostCSS + Autoprefixer**

```bash
cd frontend && npm install --save-dev tailwindcss postcss autoprefixer
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Create tailwind.config.ts**

Create `frontend/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#16a34a',
          secondary: '#86efac',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: Create postcss.config.mjs**

Create `frontend/postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
```

- [ ] **Step 4: Commit**

```bash
git add frontend/tailwind.config.ts frontend/postcss.config.mjs frontend/package.json frontend/package-lock.json
git commit -m "build(frontend): add Tailwind CSS and PostCSS"
```

---

## Task 4: Install shadcn/ui Dependencies

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/components.json` (shadcn config)

- [ ] **Step 1: Install shadcn/ui peer dependencies manually**

```bash
cd frontend && npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Add tailwindcss-animate plugin to tailwind.config.ts**

Update `frontend/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#16a34a',
          secondary: '#86efac',
        },
      },
    },
  },
  plugins: [animate],
}

export default config
```

- [ ] **Step 3: Create components.json (shadcn/ui config)**

Create `frontend/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 4: Create utils/cn.ts (shadcn/ui merge utility)**

Create `frontend/utils/cn.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/components.json frontend/utils/cn.ts frontend/tailwind.config.ts frontend/package.json frontend/package-lock.json
git commit -m "build(frontend): add shadcn/ui deps and cn utility"
```

---

## Task 5: Create App Router Core Files

**Files:**
- Create: `frontend/app/globals.css`
- Create: `frontend/app/layout.tsx`
- Create: `frontend/app/page.tsx`
- Create: `frontend/providers/client-providers.tsx`

- [ ] **Step 1: Create app/globals.css**

Create `frontend/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 142 76% 36%;
    --primary-foreground: 355 100% 97.3%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 142 76% 36%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 0 0% 95%;
    --primary: 142 76% 36%;
    --primary-foreground: 144 61.2% 20.2%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 12 6.5% 15.1%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 142 76% 36%;
    --card: 24 9.8% 10%;
    --card-foreground: 0 0% 95%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 95%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Create providers/client-providers.tsx**

Create `frontend/providers/client-providers.tsx`:

```tsx
'use client'

import { ReactNode } from 'react'

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return <>{children}</>
}
```

- [ ] **Step 3: Create app/layout.tsx**

Create `frontend/app/layout.tsx`:

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
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Create app/page.tsx**

Create `frontend/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <span className="text-6xl">🧻</span>
      <h1 className="text-4xl font-bold tracking-tight">Toilet KPI</h1>
      <p className="text-lg text-muted-foreground">
        Transformando papel higiênico em consciência sustentável.
      </p>
    </main>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/ frontend/providers/
git commit -m "feat(frontend): create App Router core (layout, page, providers)"
```

---

## Task 6: Create Feature Folder Structure

**Files:**
- Create: `frontend/constants/kpi.ts`
- Create: `frontend/types/index.ts`
- Create: `frontend/hooks/.gitkeep`
- Create: `frontend/components/index.ts`

- [ ] **Step 1: Create constants/kpi.ts**

Create `frontend/constants/kpi.ts`:

```typescript
export const SHEETS_PER_HAND_TURN = 5
export const SHEETS_PER_ROLL = 200
export const WATER_LITERS_PER_ROLL = 140
export const CO2_KG_PER_ROLL = 0.06
export const DEFAULT_ROLL_PRICE_BRL = 2.5
export const DAYS_PER_MONTH = 30
```

- [ ] **Step 2: Create types/index.ts**

Create `frontend/types/index.ts`:

```typescript
export interface DailyRecord {
  date: string
  bathroomTrips: number
  handTurns: number
  usedWater: boolean
}

export interface UserProfile {
  rollPriceBrl: number
  consumptionProfile: 'economic' | 'moderate' | 'high'
}

export interface KpiMetrics {
  sheetsPerUse: number
  sheetsPerDay: number
  sheetsPerMonth: number
  rollsPerMonth: number
  costPerMonth: number
  waterLitersPerMonth: number
  co2KgPerMonth: number
}

export type ConsumptionProfile = 'economic' | 'moderate' | 'high'

export interface ConsumptionProfileConfig {
  label: string
  sheetsPerDay: number
  rollsPerYear: number
}
```

- [ ] **Step 3: Create utils/calculate-kpi.ts**

Create `frontend/utils/calculate-kpi.ts`:

```typescript
import {
  SHEETS_PER_HAND_TURN,
  SHEETS_PER_ROLL,
  WATER_LITERS_PER_ROLL,
  CO2_KG_PER_ROLL,
  DAYS_PER_MONTH,
} from '@/constants/kpi'
import type { DailyRecord, KpiMetrics } from '@/types'

export function calculateKpi(
  record: Pick<DailyRecord, 'bathroomTrips' | 'handTurns'>,
  rollPriceBrl: number,
): KpiMetrics {
  const sheetsPerUse = record.handTurns * SHEETS_PER_HAND_TURN
  const sheetsPerDay = record.bathroomTrips * sheetsPerUse
  const sheetsPerMonth = sheetsPerDay * DAYS_PER_MONTH
  const rollsPerMonth = sheetsPerMonth / SHEETS_PER_ROLL
  const costPerMonth = rollsPerMonth * rollPriceBrl
  const waterLitersPerMonth = rollsPerMonth * WATER_LITERS_PER_ROLL
  const co2KgPerMonth = rollsPerMonth * CO2_KG_PER_ROLL

  return {
    sheetsPerUse,
    sheetsPerDay,
    sheetsPerMonth,
    rollsPerMonth,
    costPerMonth,
    waterLitersPerMonth,
    co2KgPerMonth,
  }
}
```

- [ ] **Step 4: Create components/index.ts placeholder**

Create `frontend/components/index.ts`:

```typescript
// Shared components — add exports here as components are created
```

- [ ] **Step 5: Create hooks placeholder**

```bash
touch frontend/hooks/.gitkeep
```

- [ ] **Step 6: Commit**

```bash
git add frontend/constants/ frontend/types/ frontend/utils/calculate-kpi.ts frontend/components/ frontend/hooks/
git commit -m "feat(frontend): add folder structure, KPI constants, types and calculation utility"
```

---

## Task 7: Remove Old Pages Router Files

**Files:**
- Delete: `frontend/pages/` (entire directory)
- Delete: `frontend/styles/` (entire directory)

- [ ] **Step 1: Delete pages directory**

```bash
git rm -r frontend/pages/
```

Expected output: removes `pages/_app.js`, `pages/_document.js`, `pages/index.js`, `pages/api/hello.js`.

- [ ] **Step 2: Delete styles directory**

```bash
git rm -r frontend/styles/
```

Expected output: removes `styles/globals.css`, `styles/Home.module.css`.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(frontend): remove Pages Router files (pages/, styles/)"
```

---

## Task 8: Verify the Build

**Files:** none created/modified — verification only.

- [ ] **Step 1: Install all dependencies cleanly**

```bash
cd frontend && npm install
```

- [ ] **Step 2: Run TypeScript type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors. If `next-env.d.ts` is missing, run `next dev` once to generate it.

- [ ] **Step 3: Run development server**

```bash
cd frontend && npm run dev
```

Expected: server starts on `http://localhost:3000`. Open the URL and verify:
- Page renders with "🧻 Toilet KPI" heading
- No hydration errors in the browser console
- Tailwind styles are applied (centered content)

- [ ] **Step 4: Run production build**

```bash
cd frontend && npm run build
```

Expected: build completes successfully with no type errors.

- [ ] **Step 5: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(frontend): resolve build issues after App Router migration"
```

---

## Self-Review

**Spec coverage:**
- ✅ App Router structure (`app/layout.tsx`, `app/page.tsx`) — Task 5
- ✅ TypeScript with `@/*` alias — Task 2
- ✅ Tailwind CSS — Task 3
- ✅ shadcn/ui foundation — Task 4
- ✅ Folder structure matching brokers (`components/`, `providers/`, `hooks/`, `types/`, `utils/`, `constants/`) — Tasks 5 & 6
- ✅ KPI constants as named constants (not magic numbers) — Task 6
- ✅ Remove Pages Router — Task 7
- ✅ Verified build — Task 8

**Placeholder scan:** No TBDs, TODOs, or vague steps. All code is complete.

**Type consistency:** `DailyRecord` and `KpiMetrics` defined in `types/index.ts` (Task 6 Step 2) and consumed in `utils/calculate-kpi.ts` (Task 6 Step 3) — consistent.

# Frontend Screens v2 — Missões, PCL e Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o frontend baseado em métricas de papel higiênico pelo sistema real de missões/cagadas — o usuário loga com nickname+senha, registra uma cagada, recebe uma missão absurda aleatória, resolve e acumula PCL; a tela social mostra o ranking de amigos por PCL com títulos especiais.

**Architecture:** App Router Next.js (TypeScript) já configurado. A camada `lib/api.ts` gerencia tokens JWT no localStorage e envolve fetch com tipagem genérica; as services em `services/` chamam `apiRequest` e retornam `ServiceResult<T>`. As telas home e social são client components (gerenciam estado do fluxo de cagada e token). Auth usa `(auth)` route group; home e social usam `(main)` route group com nav responsiva já existente.

**Tech Stack:** Next.js App Router, TypeScript 6, Tailwind v4, shadcn/ui (Button, Card, Input, Label, Badge), lucide-react.

---

## ⚠️ Contexto antes de começar

1. **O sistema NÃO é rastreador de papel higiênico.** É um jogo de disputas entre amigos: registra "cagadas", recebe missões absurdas, acumula PCL (Pontos de Cu Limpo) e sobe de patente. Referência: `docs/superpowers/plans/2026-05-30-toilet-kpi-missoes.md`.
2. **Infraestrutura App Router já existe** — não modifique `app/layout.tsx`, `app/globals.css`, `app/(main)/layout.tsx`, `components/app-nav.tsx`, `components/ui/*`, nem arquivos de configuração (tsconfig.json, postcss, tailwind).
3. **Backend pode não estar rodando** — as services usam `apiRequest` mas capturam erros e retornam `ServiceResult` com `error`. As telas mostram erros mas não quebram.
4. **Commit rule:** NUNCA adicionar `Co-Authored-By: Claude` nas mensagens de commit.
5. **AGENTS.md:** Antes de escrever qualquer código Next.js, leia `frontend/node_modules/next/dist/docs/` para confirmar que `useRouter` de `next/navigation`, `Link`, e `router.replace` batem com a versão instalada.
6. **Comandos de frontend** rodam a partir de `frontend/`.
7. **Variáveis de ambiente:** Criar `frontend/.env.local.example` e copiar para `frontend/.env.local` com `NEXT_PUBLIC_API_URL=http://localhost:3001`.

---

## Mapa de arquivos

**Criar:**
- `frontend/lib/api.ts` — cliente HTTP genérico com gestão de token JWT
- `frontend/.env.local.example` — variável NEXT_PUBLIC_API_URL
- `frontend/services/auth.service.ts` — register/login → salva JWT
- `frontend/services/cagadas.service.ts` — registrarCagada, resolverCagada
- `frontend/services/ranking.service.ts` — getRanking, addFriend

**Modificar:**
- `frontend/services/types.ts` — substituir tipos de papel pelos tipos do domínio
- `frontend/services/user.service.ts` — substituir mock por chamada a GET /me
- `frontend/utils/index.ts` — remover export de calculateKpi
- `frontend/app/(auth)/layout.tsx` — atualizar subtítulo
- `frontend/app/(auth)/login/page.tsx` — trocar email por nickname+senha
- `frontend/app/(auth)/register/page.tsx` — trocar email+nome por nickname+senha
- `frontend/app/(main)/home/page.tsx` — fluxo de cagada (client component)
- `frontend/app/(main)/social/page.tsx` — ranking de PCL + adicionar amigo

**Deletar (no Task 7):**
- `frontend/services/records.service.ts`
- `frontend/services/challenges.service.ts`
- `frontend/services/social.service.ts`
- `frontend/components/kpi-bar-chart.tsx`
- `frontend/components/kpi-bar-chart-client.tsx`
- `frontend/components/challenge-card.tsx`
- `frontend/components/challenges-section.tsx`
- `frontend/components/partner-card.tsx`
- `frontend/components/add-partner-dialog.tsx`
- `frontend/components/daily-record-dialog.tsx`
- `frontend/types/index.ts`
- `frontend/constants/kpi.ts`
- `frontend/utils/calculate-kpi.ts`

**Manter sem alteração:**
- `frontend/app/layout.tsx`, `frontend/app/page.tsx`, `frontend/app/globals.css`
- `frontend/app/(main)/layout.tsx`, `frontend/components/app-nav.tsx`
- `frontend/components/daily-quote.tsx`, `frontend/constants/quotes.ts`
- `frontend/utils/cn.ts`, `frontend/components/ui/*`
- Toda a configuração (tsconfig.json, postcss.config.mjs, tailwind.config.ts, next.config.ts)

---

## Task 1: Tipos do domínio

**Files:**
- Modify: `frontend/services/types.ts`
- Delete: `frontend/types/index.ts`, `frontend/constants/kpi.ts`, `frontend/utils/calculate-kpi.ts`
- Modify: `frontend/utils/index.ts`

- [ ] **Step 1: Substituir `services/types.ts` pelos tipos do domínio**

```typescript
// frontend/services/types.ts
export interface ServiceResult<T> {
  data: T
  error?: string
}

export type Nivel = 'leve' | 'medio' | 'insano'
export type Resultado = 'cumprida' | 'falhou' | 'pulou'

export interface HistoricoItem {
  cagadaId: string
  missao: string
  status: Resultado
  pclDelta: number
}

export interface UserProfile {
  nickname: string
  pcl: number
  patente: string
  historicoRecente: HistoricoItem[]
}

export interface MissaoInfo {
  id: string
  level: Nivel
  text: string
}

export interface CagadaRegistrada {
  cagadaId: string
  mission: MissaoInfo
  pontosEmJogo: number
}

export interface ResolveResult {
  pclDelta: number
  totalPcl: number
  patente: string
  mensagem: string
}

export interface RankingEntry {
  nickname: string
  pcl: number
  titulo: string
}
```

- [ ] **Step 2: Atualizar `utils/index.ts` para remover calculateKpi**

```typescript
// frontend/utils/index.ts
export { cn } from './cn'
```

- [ ] **Step 3: Deletar arquivos obsoletos**

Run (de `frontend/`):
```bash
rm types/index.ts constants/kpi.ts utils/calculate-kpi.ts
rmdir types/ 2>/dev/null || true
```

Expected: sem erro; diretório `types/` removido se ficar vazio.

- [ ] **Step 4: Verificar TypeScript**

Run (de `frontend/`): `npx tsc --noEmit`
Expected: erros apenas em arquivos que ainda referenciam os tipos removidos — esses serão corrigidos nos próximos tasks. Zero erros em `services/types.ts` e `utils/index.ts`.

- [ ] **Step 5: Commit**

```bash
git add frontend/services/types.ts frontend/utils/index.ts
git rm frontend/types/index.ts frontend/constants/kpi.ts frontend/utils/calculate-kpi.ts
git commit -m "refactor(frontend): replace paper-tracking types with domain types (PCL, missions, ranking)"
```

---

## Task 2: API client + variáveis de ambiente

**Files:**
- Create: `frontend/.env.local.example`
- Create: `frontend/lib/api.ts`

- [ ] **Step 1: Criar `.env.local.example` e copiar para `.env.local`**

Crie o arquivo `frontend/.env.local.example` com o conteúdo:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Depois copie:
```bash
cp frontend/.env.local.example frontend/.env.local
```

Expected: `frontend/.env.local` existe com `NEXT_PUBLIC_API_URL=http://localhost:3001`.

- [ ] **Step 2: Criar `frontend/lib/api.ts`**

Crie o diretório (se não existir) e o arquivo:
```bash
mkdir -p frontend/lib
```

```typescript
// frontend/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const TOKEN_KEY = 'toilet_kpi_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? 'Deu ruim no trono.'
    throw new Error(msg)
  }
  return data as T
}
```

- [ ] **Step 3: Verificar TypeScript**

Run (de `frontend/`): `npx tsc --noEmit`
Expected: zero erros em `lib/api.ts`.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/api.ts frontend/.env.local.example
git commit -m "feat(frontend): JWT API client with token management"
```

---

## Task 3: Service layer

**Files:**
- Create: `frontend/services/auth.service.ts`
- Modify: `frontend/services/user.service.ts`
- Create: `frontend/services/cagadas.service.ts`
- Create: `frontend/services/ranking.service.ts`

- [ ] **Step 1: Criar `services/auth.service.ts`**

```typescript
// frontend/services/auth.service.ts
import { apiRequest, setToken } from '@/lib/api'
import type { ServiceResult } from './types'

export async function login(
  nickname: string,
  senha: string,
): Promise<ServiceResult<void>> {
  try {
    const res = await apiRequest<{ token: string }>('/auth/login', {
      method: 'POST',
      body: { nickname, senha },
      auth: false,
    })
    setToken(res.token)
    return { data: undefined }
  } catch (err) {
    return {
      data: undefined,
      error: err instanceof Error ? err.message : 'Credenciais inválidas.',
    }
  }
}

export async function register(
  nickname: string,
  senha: string,
): Promise<ServiceResult<void>> {
  try {
    const res = await apiRequest<{ token: string }>('/auth/register', {
      method: 'POST',
      body: { nickname, senha },
      auth: false,
    })
    setToken(res.token)
    return { data: undefined }
  } catch (err) {
    return {
      data: undefined,
      error: err instanceof Error ? err.message : 'Erro ao criar conta.',
    }
  }
}
```

- [ ] **Step 2: Substituir `services/user.service.ts`**

```typescript
// frontend/services/user.service.ts
import { apiRequest } from '@/lib/api'
import type { ServiceResult, UserProfile } from './types'

const EMPTY: UserProfile = {
  nickname: '',
  pcl: 0,
  patente: '',
  historicoRecente: [],
}

export async function getMe(): Promise<ServiceResult<UserProfile>> {
  try {
    const data = await apiRequest<UserProfile>('/me')
    return { data }
  } catch (err) {
    return {
      data: EMPTY,
      error: err instanceof Error ? err.message : 'Erro ao carregar perfil.',
    }
  }
}
```

- [ ] **Step 3: Criar `services/cagadas.service.ts`**

```typescript
// frontend/services/cagadas.service.ts
import { apiRequest } from '@/lib/api'
import type {
  CagadaRegistrada,
  ResolveResult,
  Resultado,
  ServiceResult,
} from './types'

const EMPTY_CAGADA: CagadaRegistrada = {
  cagadaId: '',
  mission: { id: '', level: 'leve', text: '' },
  pontosEmJogo: 0,
}

const EMPTY_RESULT: ResolveResult = {
  pclDelta: 0,
  totalPcl: 0,
  patente: '',
  mensagem: '',
}

export async function registrarCagada(): Promise<ServiceResult<CagadaRegistrada>> {
  try {
    const data = await apiRequest<CagadaRegistrada>('/cagadas', {
      method: 'POST',
    })
    return { data }
  } catch (err) {
    return {
      data: EMPTY_CAGADA,
      error: err instanceof Error ? err.message : 'Erro ao registrar cagada.',
    }
  }
}

export async function resolverCagada(
  cagadaId: string,
  resultado: Resultado,
): Promise<ServiceResult<ResolveResult>> {
  try {
    const data = await apiRequest<ResolveResult>(
      `/cagadas/${cagadaId}/resolver`,
      { method: 'POST', body: { resultado } },
    )
    return { data }
  } catch (err) {
    return {
      data: EMPTY_RESULT,
      error: err instanceof Error ? err.message : 'Erro ao resolver cagada.',
    }
  }
}
```

- [ ] **Step 4: Criar `services/ranking.service.ts`**

```typescript
// frontend/services/ranking.service.ts
import { apiRequest } from '@/lib/api'
import type { RankingEntry, ServiceResult } from './types'

export async function getRanking(): Promise<ServiceResult<RankingEntry[]>> {
  try {
    const data = await apiRequest<RankingEntry[]>('/friends/ranking')
    return { data }
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Erro ao carregar ranking.',
    }
  }
}

export async function addFriend(
  nickname: string,
): Promise<ServiceResult<void>> {
  try {
    await apiRequest<void>('/friends', {
      method: 'POST',
      body: { nickname },
    })
    return { data: undefined }
  } catch (err) {
    return {
      data: undefined,
      error: err instanceof Error ? err.message : 'Erro ao adicionar amigo.',
    }
  }
}
```

- [ ] **Step 5: Verificar TypeScript**

Run (de `frontend/`): `npx tsc --noEmit`
Expected: zero erros nas novas services. Podem restar erros em arquivos que ainda importam os serviços antigos — esses são corrigidos nos tasks seguintes.

- [ ] **Step 6: Commit**

```bash
git add frontend/services/auth.service.ts frontend/services/user.service.ts frontend/services/cagadas.service.ts frontend/services/ranking.service.ts
git commit -m "feat(frontend): domain service layer (auth, user, cagadas, ranking)"
```

---

## Task 4: Telas de autenticação

**Files:**
- Modify: `frontend/app/(auth)/layout.tsx`
- Modify: `frontend/app/(auth)/login/page.tsx`
- Modify: `frontend/app/(auth)/register/page.tsx`

- [ ] **Step 1: Atualizar subtítulo do layout de auth**

```typescript
// frontend/app/(auth)/layout.tsx
import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-5xl">🧻</span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Toilet KPI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O trono é para os fortes. Prove seu valor.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Substituir login page — nickname + senha**

```typescript
// frontend/app/(auth)/login/page.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/services/auth.service'

export default function LoginPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const res = await login(nickname.trim(), senha)
    setLoading(false)
    if (res.error) {
      setErro(res.error)
      return
    }
    router.replace('/home')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg">Entrar no trono</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="seu_nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
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

- [ ] **Step 3: Substituir register page — nickname + senha**

```typescript
// frontend/app/(auth)/register/page.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register } from '@/services/auth.service'

export default function RegisterPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    setLoading(true)
    const res = await register(nickname.trim(), senha)
    setLoading(false)
    if (res.error) {
      setErro(res.error)
      return
    }
    router.replace('/home')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg">Criar conta de guerreiro</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="seu_nickname_épico"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar">Confirmar senha</Label>
            <Input
              id="confirmar"
              type="password"
              placeholder="••••••••"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
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

- [ ] **Step 4: Verificar TypeScript**

Run (de `frontend/`): `npx tsc --noEmit`
Expected: zero erros nos arquivos de auth.

- [ ] **Step 5: Verificar visualmente** (com `npm run dev`)

Abra `http://localhost:3000/login`:
- Campo "Nickname" (não "E-mail")
- Campo "Senha"
- Nenhum campo "Nome" ou "E-mail"
- Clique "Entrar" sem backend rodando → mensagem de erro em vermelho

Abra `http://localhost:3000/register`:
- Campos Nickname, Senha, Confirmar senha
- Senha diferente de confirmar → "As senhas não coincidem."

- [ ] **Step 6: Commit**

```bash
git add "frontend/app/(auth)/"
git commit -m "feat(frontend): auth screens with nickname+senha"
```

---

## Task 5: Home screen — fluxo de cagada

**Files:**
- Modify: `frontend/app/(main)/home/page.tsx`

- [ ] **Step 1: Substituir home page pelo fluxo de cagada**

```typescript
// frontend/app/(main)/home/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DailyQuote } from '@/components/daily-quote'
import { getDailyQuote } from '@/constants/quotes'
import { getMe } from '@/services/user.service'
import { registrarCagada, resolverCagada } from '@/services/cagadas.service'
import { clearToken, getToken } from '@/lib/api'
import type {
  CagadaRegistrada,
  ResolveResult,
  Resultado,
  UserProfile,
} from '@/services/types'

function nivelVariant(nivel: string): 'destructive' | 'default' | 'secondary' {
  if (nivel === 'insano') return 'destructive'
  if (nivel === 'medio') return 'default'
  return 'secondary'
}

export default function HomePage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<UserProfile | null>(null)
  const [cagada, setCagada] = useState<CagadaRegistrada | null>(null)
  const [resultado, setResultado] = useState<ResolveResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function carregarPerfil() {
    const res = await getMe()
    if (res.error) {
      setErro(res.error)
      return
    }
    setPerfil(res.data)
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login')
      return
    }
    carregarPerfil()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleRegistrar() {
    setErro('')
    setResultado(null)
    setLoading(true)
    const res = await registrarCagada()
    setLoading(false)
    if (res.error) {
      setErro(res.error)
      return
    }
    setCagada(res.data)
  }

  async function handleResolver(r: Resultado) {
    if (!cagada) return
    setLoading(true)
    const res = await resolverCagada(cagada.cagadaId, r)
    setLoading(false)
    if (res.error) {
      setErro(res.error)
      return
    }
    setResultado(res.data)
    setCagada(null)
    await carregarPerfil()
  }

  function handleSair() {
    clearToken()
    router.replace('/login')
  }

  if (!perfil) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando o trono…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Profile header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {perfil.nickname}
          </p>
          <p className="mt-0.5 text-sm font-medium">{perfil.patente}</p>
          <p className="text-2xl font-bold tabular-nums">
            {perfil.pcl}{' '}
            <span className="text-sm font-normal text-muted-foreground">PCL</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSair}
          className="text-muted-foreground"
        >
          sair
        </Button>
      </div>

      {/* Cagada flow */}
      <section className="flex flex-col items-center gap-4 py-4">
        {!cagada && !resultado && (
          <Button
            size="lg"
            className="h-20 w-full max-w-xs text-xl"
            onClick={handleRegistrar}
            disabled={loading}
          >
            {loading ? 'Sorteando missão…' : '💩 Registrar cagada'}
          </Button>
        )}

        {cagada && (
          <Card className="w-full max-w-sm border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant={nivelVariant(cagada.mission.level)}>
                  {cagada.mission.level}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  vale {cagada.pontosEmJogo} PCL
                </span>
              </div>
              <CardTitle className="text-base leading-snug">
                {cagada.mission.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handleResolver('cumprida')}
                disabled={loading}
              >
                ✅ Cumpri
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => handleResolver('pulou')}
                disabled={loading}
              >
                🐔 Pulei
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleResolver('falhou')}
                disabled={loading}
              >
                🧻 Falhei
              </Button>
            </CardContent>
          </Card>
        )}

        {resultado && (
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
              <p className="text-lg font-semibold">{resultado.mensagem}</p>
              <p className="text-3xl font-bold tabular-nums">
                {resultado.pclDelta >= 0 ? '+' : ''}
                {resultado.pclDelta} PCL
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {resultado.totalPcl} · {resultado.patente}
              </p>
              <Button
                className="mt-2 w-full"
                onClick={handleRegistrar}
                disabled={loading}
              >
                💩 Nova cagada
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {erro && (
        <p className="text-center text-sm text-destructive">{erro}</p>
      )}

      {/* Recent history */}
      {perfil.historicoRecente.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Histórico recente
          </h2>
          <div className="flex flex-col gap-2">
            {perfil.historicoRecente.map((h) => (
              <div
                key={h.cagadaId}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="max-w-[55%] truncate text-sm text-muted-foreground">
                  {h.missao}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant={
                      h.status === 'cumprida'
                        ? 'default'
                        : h.status === 'falhou'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="text-xs"
                  >
                    {h.status}
                  </Badge>
                  <span
                    className={
                      h.pclDelta >= 0
                        ? 'font-medium text-primary'
                        : 'font-medium text-destructive'
                    }
                  >
                    {h.pclDelta >= 0 ? '+' : ''}
                    {h.pclDelta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <DailyQuote quote={getDailyQuote()} />
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

Run (de `frontend/`): `npx tsc --noEmit`
Expected: zero erros em `home/page.tsx`.

- [ ] **Step 3: Verificar visualmente** (com `npm run dev`)

Abra `http://localhost:3000/home` sem token no localStorage:
Expected: redireciona imediatamente para `/login`.

Se quiser testar com backend rodando: faça login via `/login`, volte para `/home`. Confirme:
- Nickname, patente e PCL aparecem no header
- Botão "💩 Registrar cagada" centralizado
- Missão e botões aparecem após registrar
- Resultado mostra após resolver

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(main)/home/page.tsx"
git commit -m "feat(frontend): home screen with cagada/mission flow and PCL display"
```

---

## Task 6: Social screen — ranking de PCL

**Files:**
- Modify: `frontend/app/(main)/social/page.tsx`

- [ ] **Step 1: Substituir social page pelo ranking de PCL**

```typescript
// frontend/app/(main)/social/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getRanking, addFriend } from '@/services/ranking.service'
import { getToken } from '@/lib/api'
import type { RankingEntry } from '@/services/types'

export default function SocialPage() {
  const router = useRouter()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [nick, setNick] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    const res = await getRanking()
    if (!res.error) setRanking(res.data)
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login')
      return
    }
    carregar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!nick.trim()) return
    setErro('')
    setLoading(true)
    const res = await addFriend(nick.trim())
    setLoading(false)
    if (res.error) {
      setErro(res.error)
      return
    }
    setNick('')
    await carregar()
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ranking de amigos
      </h1>

      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="nick" className="sr-only">
            Nickname do amigo
          </Label>
          <Input
            id="nick"
            placeholder="nickname do amigo"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '…' : 'Adicionar'}
        </Button>
      </form>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="flex flex-col gap-2">
        {ranking.map((entry, i) => (
          <Card key={entry.nickname}>
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 shrink-0 text-right text-sm font-medium text-muted-foreground">
                {i + 1}.
              </span>
              <div className="flex flex-1 flex-col">
                <span className="font-semibold">{entry.nickname}</span>
                {entry.titulo && (
                  <span className="text-xs text-muted-foreground">
                    {entry.titulo}
                  </span>
                )}
              </div>
              <span className="shrink-0 font-bold tabular-nums">
                {entry.pcl} PCL
              </span>
            </CardContent>
          </Card>
        ))}
        {ranking.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum amigo no ranking ainda. Adicione alguém!
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

Run (de `frontend/`): `npx tsc --noEmit`
Expected: zero erros.

- [ ] **Step 3: Verificar visualmente** (com `npm run dev`)

Abra `http://localhost:3000/social`:
- Formulário para adicionar amigo por nickname
- Lista vazia com "Nenhum amigo no ranking ainda."
- Sem token → redireciona para /login

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(main)/social/page.tsx"
git commit -m "feat(frontend): social screen with PCL ranking and add-friend form"
```

---

## Task 7: Cleanup — componentes e services obsoletos

**Files:**
- Delete: todos os arquivos listados abaixo

- [ ] **Step 1: Deletar components obsoletos**

Run (de `frontend/`):
```bash
rm components/kpi-bar-chart.tsx
rm components/kpi-bar-chart-client.tsx
rm components/challenge-card.tsx
rm components/challenges-section.tsx
rm components/partner-card.tsx
rm components/add-partner-dialog.tsx
rm components/daily-record-dialog.tsx
```

Expected: arquivos removidos sem erro.

- [ ] **Step 2: Deletar services obsoletos**

```bash
rm services/records.service.ts
rm services/challenges.service.ts
rm services/social.service.ts
```

Expected: arquivos removidos sem erro.

- [ ] **Step 3: Verificar TypeScript e build**

Run: `npx tsc --noEmit`
Expected: zero erros.

Run: `npm run build`
Expected: build completa sem erros ou warnings críticos.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(frontend): delete paper-tracking components and obsolete services"
```

---

## Task 8: Verificação final

- [ ] **Step 1: Build limpo**

Run (de `frontend/`): `npm run build`
Expected: zero erros TypeScript, build passa.

- [ ] **Step 2: Smoke test manual** (com `npm run dev`)

Abra `http://localhost:3000`. Verifique:
- [ ] Redirect automático para `/login` sem token no localStorage
- [ ] `/login`: campos Nickname e Senha (sem E-mail)
- [ ] `/register`: campos Nickname, Senha, Confirmar senha (sem E-mail)
- [ ] `/register`: senha ≠ confirmar exibe "As senhas não coincidem."
- [ ] `/home` sem token: redireciona imediatamente para `/login`
- [ ] `/social` sem token: redireciona imediatamente para `/login`
- [ ] Nav mobile (< md): tab bar fixo no fundo com Home e Social
- [ ] Nav desktop (≥ md): sidebar esquerda estreita
- [ ] Nenhum erro de import no console do browser

- [ ] **Step 3: Commit final se necessário**

Se houver ajustes menores após o smoke test:
```bash
git add -A
git commit -m "fix(frontend): smoke test fixes"
```

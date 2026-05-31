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

const PENDING_KEY = 'toilet_kpi_pending_cagada'

function savePending(c: CagadaRegistrada) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(c))
}

function loadPending(): CagadaRegistrada | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as CagadaRegistrada) : null
  } catch {
    return null
  }
}

function clearPending() {
  localStorage.removeItem(PENDING_KEY)
}


export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeMission, setActiveMission] = useState<CagadaRegistrada | null>(null)
  // false = pending mission restored (shows compact row); true = user is resolving (shows buttons)
  const [resolving, setResolving] = useState(false)
  const [result, setResult] = useState<ResolveResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadProfile() {
    const res = await getMe()
    if (res.error) {
      setError(res.error)
      return
    }
    setProfile(res.data)
  }

  useEffect(() => {
    const init = async () => {
      if (!getToken()) {
        router.replace('/login')
        return
      }
      await loadProfile()
      const pending = loadPending()
      if (pending) {
        setActiveMission(pending)
        setResolving(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleRegister() {
    setError('')
    setResult(null)
    setLoading(true)
    const res = await registrarCagada()
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    savePending(res.data)
    setActiveMission(res.data)
    setResolving(true)
  }

  async function handleResolve(outcome: Resultado) {
    if (!activeMission) return
    setError('')
    setLoading(true)
    const res = await resolverCagada(activeMission.cagadaId, outcome)
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    clearPending()
    setActiveMission(null)
    setResolving(false)
    setResult(res.data)
    await loadProfile()
  }

  function handleSignOut() {
    clearToken()
    router.replace('/login')
  }

  if (!profile) {
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
            {profile.nickname}
          </p>
          <p className="mt-0.5 text-sm font-medium">{profile.patente}</p>
          <p className="text-2xl font-bold tabular-nums">
            {profile.pcl}{' '}
            <span className="text-sm font-normal text-muted-foreground">PCL</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground"
        >
          sair
        </Button>
      </div>

      {/* Cagada flow */}
      <section className="flex flex-col items-center gap-4 py-4">
        {!activeMission && !result && (
          <Button
            size="lg"
            className="h-20 w-full max-w-xs text-xl"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Sorteando missão…' : '💩 Registrar cagada'}
          </Button>
        )}

        {result && (
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
              <p className="text-lg font-semibold">{result.mensagem}</p>
              <p className="text-3xl font-bold tabular-nums">
                {result.pclDelta >= 0 ? '+' : ''}
                {result.pclDelta} PCL
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {result.totalPcl} · {result.patente}
              </p>
              <Button
                className="mt-2 w-full"
                onClick={handleRegister}
                disabled={loading}
              >
                💩 Nova cagada
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      {/* History + pending mission */}
      {(activeMission || profile.historicoRecente.length > 0) && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Histórico recente
          </h2>
          <div className="flex flex-col gap-2">
            {/* Pending mission as first item */}
            {activeMission && (
              <div className="rounded-lg border border-amber-300 bg-amber-50">
                <button
                  className="flex w-full items-center justify-between px-3 py-2 text-left"
                  onClick={() => setResolving((v) => !v)}
                >
                  <span className="max-w-[55%] truncate text-sm font-medium text-amber-800">
                    {activeMission.mission.text}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="bg-amber-400 text-xs text-amber-900 hover:bg-amber-400">
                      pendente
                    </Badge>
                    <span className="text-xs text-amber-600">
                      {resolving ? '▲' : '▼'}
                    </span>
                  </div>
                </button>
                {resolving && (
                  <div className="flex gap-2 border-t border-amber-200 px-3 py-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleResolve('cumprida')}
                      disabled={loading}
                    >
                      ✅ Cumpri
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleResolve('pulou')}
                      disabled={loading}
                    >
                      🐔 Pulei
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleResolve('falhou')}
                      disabled={loading}
                    >
                      🧻 Falhei
                    </Button>
                  </div>
                )}
              </div>
            )}

            {profile.historicoRecente.map((h) => (
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

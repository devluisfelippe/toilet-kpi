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

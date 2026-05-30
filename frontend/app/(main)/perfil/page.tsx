'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getMe } from '@/services/user.service'
import { clearToken, getToken } from '@/lib/api'
import type { HistoricoItem, UserProfile } from '@/services/types'

function statusVariant(status: HistoricoItem['status']) {
  if (status === 'cumprida') return 'default'
  if (status === 'falhou') return 'destructive'
  return 'secondary'
}

function calcStats(historico: HistoricoItem[]) {
  return historico.reduce(
    (acc, h) => {
      acc[h.status] = (acc[h.status] ?? 0) + 1
      return acc
    },
    { cumprida: 0, falhou: 0, pulou: 0 } as Record<HistoricoItem['status'], number>,
  )
}

export default function PerfilPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<UserProfile | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const init = async () => {
      if (!getToken()) {
        router.replace('/login')
        return
      }
      const res = await getMe()
      if (res.error) {
        setErro(res.error)
        return
      }
      setPerfil(res.data)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSair() {
    clearToken()
    router.replace('/login')
  }

  if (!perfil) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {erro || 'Carregando perfil…'}
        </p>
      </div>
    )
  }

  const stats = calcStats(perfil.historicoRecente)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Perfil
          </p>
          <h1 className="mt-1 text-2xl font-bold">{perfil.nickname}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{perfil.patente}</p>
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

      {/* PCL destaque */}
      <Card>
        <CardContent className="flex flex-col items-center gap-1 py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pontos de Cu Limpo
          </p>
          <p className="text-5xl font-bold tabular-nums">{perfil.pcl}</p>
          <p className="text-sm text-muted-foreground">PCL acumulados</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-4">
            <p className="text-2xl font-bold text-primary">{stats.cumprida}</p>
            <p className="text-center text-xs text-muted-foreground">✅ Cumpridas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-4">
            <p className="text-2xl font-bold text-muted-foreground">{stats.pulou}</p>
            <p className="text-center text-xs text-muted-foreground">🐔 Puladas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-4">
            <p className="text-2xl font-bold text-destructive">{stats.falhou}</p>
            <p className="text-center text-xs text-muted-foreground">🧻 Falhas</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      {perfil.historicoRecente.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Histórico
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
                  <Badge variant={statusVariant(h.status)} className="text-xs">
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
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Nenhuma cagada registrada ainda. Vá ao trono!
        </p>
      )}
    </div>
  )
}

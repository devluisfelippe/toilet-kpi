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
  const [friendNickname, setFriendNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadRanking() {
    const res = await getRanking()
    if (!res.error) setRanking(res.data)
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login')
      return
    }
    const init = async () => {
      await loadRanking()
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!friendNickname.trim()) return
    setError('')
    setLoading(true)
    const res = await addFriend(friendNickname.trim())
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setFriendNickname('')
    await loadRanking()
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
            value={friendNickname}
            onChange={(e) => setFriendNickname(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '…' : 'Adicionar'}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

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

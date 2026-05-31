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
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(nickname.trim(), password)
    setLoading(false)
    if (res.error) {
      setError(res.error)
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
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

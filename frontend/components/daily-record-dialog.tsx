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

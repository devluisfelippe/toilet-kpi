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

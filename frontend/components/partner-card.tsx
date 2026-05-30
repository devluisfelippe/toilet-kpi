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

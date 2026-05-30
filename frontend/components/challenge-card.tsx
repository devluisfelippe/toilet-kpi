import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Challenge } from '@/services/types'

interface ChallengeCardProps {
  challenge: Challenge
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const percentage = Math.min(
    Math.round((challenge.progress / challenge.target) * 100),
    100
  )

  return (
    <Card className="w-48 flex-shrink-0">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xl">{challenge.badge}</span>
          {challenge.completed && (
            <Badge variant="default" className="text-xs">Completo</Badge>
          )}
        </div>
        <p className="mb-1 text-sm font-semibold leading-tight">{challenge.title}</p>
        <p className="mb-3 text-xs text-muted-foreground leading-snug">{challenge.description}</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{challenge.progress} / {challenge.target} {challenge.unit}</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

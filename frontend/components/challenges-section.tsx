import { ChallengeCard } from '@/components/challenge-card'
import type { Challenge } from '@/services/types'

interface ChallengesSectionProps {
  challenges: Challenge[]
}

export function ChallengesSection({ challenges }: ChallengesSectionProps) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Desafios
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  )
}

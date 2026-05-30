import type { Challenge, ServiceResult } from './types'

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Mestre da Folha Única',
    description: 'Use no máximo 1 volta na mão por ida',
    badge: '🏆',
    target: 7,
    progress: 3,
    unit: 'dias',
    completed: false,
  },
  {
    id: '2',
    title: 'Ninja da Ducha',
    description: 'Use água como complemento por 5 dias seguidos',
    badge: '🥷',
    target: 5,
    progress: 5,
    unit: 'dias',
    completed: true,
  },
  {
    id: '3',
    title: 'Guardião da Celulose',
    description: 'Fique abaixo de 1 rolo no mês',
    badge: '🌿',
    target: 1,
    progress: 0.6,
    unit: 'rolos',
    completed: false,
  },
  {
    id: '4',
    title: 'CEO do Banheiro Sustentável',
    description: 'Complete todos os outros desafios',
    badge: '👑',
    target: 3,
    progress: 1,
    unit: 'desafios',
    completed: false,
  },
]

// TODO: replace with GET /api/challenges when API is ready
export async function getChallenges(): Promise<ServiceResult<Challenge[]>> {
  return { data: MOCK_CHALLENGES }
}

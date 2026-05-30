import type { Partner, ServiceResult } from './types'

const MOCK_PARTNERS: Partner[] = [
  { id: '1', name: 'João Silva', avatarInitials: 'JS', monthlyRolls: 3.2 },
  { id: '2', name: 'Maria Souza', avatarInitials: 'MS', monthlyRolls: 1.1 },
  { id: '3', name: 'Pedro Costa', avatarInitials: 'PC', monthlyRolls: 4.7 },
]

// TODO: replace with GET /api/partners when API is ready
export async function getPartners(): Promise<ServiceResult<Partner[]>> {
  return { data: MOCK_PARTNERS }
}

// TODO: replace with POST /api/partners when API is ready
export async function addPartner(name: string): Promise<ServiceResult<Partner>> {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return {
    data: { id: String(Date.now()), name, avatarInitials: initials, monthlyRolls: 0 },
  }
}

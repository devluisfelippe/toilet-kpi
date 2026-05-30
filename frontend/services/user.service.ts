import type { UserProfile, ServiceResult } from './types'

const MOCK_USER: UserProfile = {
  rollPriceBrl: 2.5,
  consumptionProfile: 'moderate',
}

// TODO: replace with GET /api/user when API is ready
export async function getUserProfile(): Promise<ServiceResult<UserProfile>> {
  return { data: MOCK_USER }
}

// TODO: replace with PATCH /api/user when API is ready
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<ServiceResult<UserProfile>> {
  return { data: { ...MOCK_USER, ...updates } }
}

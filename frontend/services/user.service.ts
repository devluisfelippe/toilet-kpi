import type { ServiceResult, UserProfile } from './types'

const EMPTY: UserProfile = {
  nickname: '',
  pcl: 0,
  patente: '',
  historicoRecente: [],
}

export async function getMe(): Promise<ServiceResult<UserProfile>> {
  return { data: EMPTY }
}

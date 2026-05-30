// frontend/services/ranking.service.ts
import { apiRequest } from '@/lib/api'
import type { RankingEntry, ServiceResult } from './types'

export async function getRanking(): Promise<ServiceResult<RankingEntry[]>> {
  try {
    const data = await apiRequest<RankingEntry[]>('/friends/ranking')
    return { data }
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Erro ao carregar ranking.',
    }
  }
}

export async function addFriend(
  nickname: string,
): Promise<ServiceResult<void>> {
  try {
    await apiRequest<void>('/friends', {
      method: 'POST',
      body: { nickname },
    })
    return { data: undefined }
  } catch (err) {
    return {
      data: undefined,
      error: err instanceof Error ? err.message : 'Erro ao adicionar amigo.',
    }
  }
}

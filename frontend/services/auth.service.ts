// frontend/services/auth.service.ts
import { apiRequest, setToken } from '@/lib/api'
import type { ServiceResult } from './types'

export async function login(
  nickname: string,
  senha: string,
): Promise<ServiceResult<void>> {
  try {
    const res = await apiRequest<{ token: string }>('/auth/login', {
      method: 'POST',
      body: { nickname, senha },
      auth: false,
    })
    setToken(res.token)
    return { data: undefined }
  } catch (err) {
    return {
      data: undefined,
      error: err instanceof Error ? err.message : 'Credenciais inválidas.',
    }
  }
}

export async function register(
  nickname: string,
  senha: string,
): Promise<ServiceResult<void>> {
  try {
    const res = await apiRequest<{ token: string }>('/auth/register', {
      method: 'POST',
      body: { nickname, senha },
      auth: false,
    })
    setToken(res.token)
    return { data: undefined }
  } catch (err) {
    return {
      data: undefined,
      error: err instanceof Error ? err.message : 'Erro ao criar conta.',
    }
  }
}

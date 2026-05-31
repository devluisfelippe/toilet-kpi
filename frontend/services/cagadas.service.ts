// frontend/services/cagadas.service.ts
import { apiRequest } from '@/lib/api'
import type {
  CagadaRegistrada,
  ResolveResult,
  Resultado,
  ServiceResult,
} from './types'

const EMPTY_CAGADA: CagadaRegistrada = {
  cagadaId: '',
  mission: { id: '', level: 'leve', text: '' },
  pointsInGame: 0,
}

const EMPTY_RESULT: ResolveResult = {
  pclDelta: 0,
  totalPcl: 0,
  patent: '',
  mensagem: '',
}

export async function registrarCagada(): Promise<ServiceResult<CagadaRegistrada>> {
  try {
    const data = await apiRequest<CagadaRegistrada>('/cagadas', {
      method: 'POST',
    })
    return { data }
  } catch (err) {
    return {
      data: EMPTY_CAGADA,
      error: err instanceof Error ? err.message : 'Erro ao registrar cagada.',
    }
  }
}

export async function resolverCagada(
  cagadaId: string,
  outcome: Resultado,
): Promise<ServiceResult<ResolveResult>> {
  try {
    const data = await apiRequest<ResolveResult>(
      `/cagadas/${cagadaId}/resolver`,
      { method: 'POST', body: { result: outcome } },
    )
    return { data }
  } catch (err) {
    return {
      data: EMPTY_RESULT,
      error: err instanceof Error ? err.message : 'Erro ao resolver cagada.',
    }
  }
}

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
  pontosEmJogo: 0,
}

const EMPTY_RESULT: ResolveResult = {
  pclDelta: 0,
  totalPcl: 0,
  patente: '',
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
  resultado: Resultado,
): Promise<ServiceResult<ResolveResult>> {
  try {
    const data = await apiRequest<ResolveResult>(
      `/cagadas/${cagadaId}/resolver`,
      { method: 'POST', body: { resultado } },
    )
    return { data }
  } catch (err) {
    return {
      data: EMPTY_RESULT,
      error: err instanceof Error ? err.message : 'Erro ao resolver cagada.',
    }
  }
}

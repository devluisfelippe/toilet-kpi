// frontend/services/types.ts
export interface ServiceResult<T> {
  data: T
  error?: string
}

export type Nivel = 'leve' | 'medio' | 'insano'
export type Resultado = 'cumprida' | 'falhou' | 'pulou'

export interface HistoricoItem {
  cagadaId: string
  missao: string
  status: Resultado
  pclDelta: number
}

export interface UserProfile {
  nickname: string
  pcl: number
  patente: string
  historicoRecente: HistoricoItem[]
}

export interface MissaoInfo {
  id: string
  level: Nivel
  text: string
}

export interface CagadaRegistrada {
  cagadaId: string
  mission: MissaoInfo
  pontosEmJogo: number
}

export interface ResolveResult {
  pclDelta: number
  totalPcl: number
  patente: string
  mensagem: string
}

export interface RankingEntry {
  nickname: string
  pcl: number
  titulo: string
}

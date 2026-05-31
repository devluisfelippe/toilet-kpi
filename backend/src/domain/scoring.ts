export type Nivel = 'leve' | 'medio' | 'insano';
export type Result = 'cumprida' | 'falhou' | 'pulou';

export const PCL_LEVEL: Record<Nivel, { cumprida: number; falhou: number }> = {
  leve: { cumprida: 10, falhou: -5 },
  medio: { cumprida: 30, falhou: -10 },
  insano: { cumprida: 70, falhou: -20 },
};

export const PATENTS: ReadonlyArray<{ min: number; nome: string }> = [
  { min: 6000, nome: 'Lenda Iluminada do Papel Zero' },
  { min: 3000, nome: 'CEO do Banheiro Sustentável' },
  { min: 1500, nome: 'Diretor de Higiene Íntima' },
  { min: 700, nome: 'Gerente de Dejetos' },
  { min: 300, nome: 'Analista de Resíduos Pleno' },
  { min: 100, nome: 'Office-boy da Privada' },
  { min: 0, nome: 'Estagiário do Vaso' },
];

export function pclDelta(nivel: Nivel, result: Result): number {
  if (result === 'pulou') return 0;
  return PCL_LEVEL[nivel][result];
}

export function applyPcl(current: number, delta: number): number {
  return Math.max(0, current + delta);
}

export function patent(pcl: number): string {
  return PATENTS.find((patent) => pcl >= patent.min)!.nome;
}

export function pointsInGame(nivel: Nivel): number {
  return PCL_LEVEL[nivel].cumprida;
}

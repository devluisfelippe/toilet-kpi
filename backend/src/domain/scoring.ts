export type Nivel = 'leve' | 'medio' | 'insano';
export type Resultado = 'cumprida' | 'falhou' | 'pulou';

export const PCL_POR_NIVEL: Record<
  Nivel,
  { cumprida: number; falhou: number }
> = {
  leve: { cumprida: 10, falhou: -5 },
  medio: { cumprida: 30, falhou: -10 },
  insano: { cumprida: 70, falhou: -20 },
};

export const PATENTES: ReadonlyArray<{ min: number; nome: string }> = [
  { min: 6000, nome: 'Lenda Iluminada do Papel Zero' },
  { min: 3000, nome: 'CEO do Banheiro Sustentável' },
  { min: 1500, nome: 'Diretor de Higiene Íntima' },
  { min: 700, nome: 'Gerente de Dejetos' },
  { min: 300, nome: 'Analista de Resíduos Pleno' },
  { min: 100, nome: 'Office-boy da Privada' },
  { min: 0, nome: 'Estagiário do Vaso' },
];

export function pclDelta(nivel: Nivel, resultado: Resultado): number {
  if (resultado === 'pulou') return 0;
  return PCL_POR_NIVEL[nivel][resultado];
}

export function aplicarPcl(atual: number, delta: number): number {
  return Math.max(0, atual + delta);
}

export function patenteDe(pcl: number): string {
  return PATENTES.find((patente) => pcl >= patente.min)!.nome;
}

export function pontosEmJogo(nivel: Nivel): number {
  return PCL_POR_NIVEL[nivel].cumprida;
}

import { MISSOES, Missao } from './missions.catalog';

const NIVEIS: ReadonlyArray<Missao['level']> = ['leve', 'medio', 'insano'];

describe('catálogo de missões', () => {
  it('tem ao menos 200 missões', () => {
    expect(MISSOES.length).toBeGreaterThanOrEqual(200);
  });

  it('cobre os três níveis com pelo menos 3 missões cada', () => {
    for (const nivel of NIVEIS) {
      const quantidade = MISSOES.filter(
        (missao) => missao.level === nivel,
      ).length;
      expect(quantidade).toBeGreaterThanOrEqual(3);
    }
  });

  it('não tem ids duplicados', () => {
    const ids = MISSOES.map((missao) => missao.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda missão tem nível válido, id e texto não-vazios', () => {
    const niveisValidos = new Set<string>(NIVEIS);
    for (const missao of MISSOES) {
      expect(niveisValidos.has(missao.level)).toBe(true);
      expect(missao.id.trim().length).toBeGreaterThan(0);
      expect(missao.text.trim().length).toBeGreaterThan(0);
    }
  });
});
